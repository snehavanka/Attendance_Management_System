from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from middleware.role_required import role_required
from database.models import  User,Attendance, EditLog, Teacher, Student, db
from datetime import date as dt_date, datetime

teacher_bp = Blueprint('teacher', __name__)
@teacher_bp.route('/teacher/profile', methods=['GET'])
@jwt_required()
@role_required(['teacher'])
def get_teacher_profile():
    user_id = get_jwt_identity()
    teacher = Teacher.query.filter_by(user_id=user_id).first()

    if not teacher:
        return jsonify({"msg": "Teacher not found"}), 404

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({
        "email": user.email,
        "role": user.role
    }), 200

@teacher_bp.route('/teacher/assigned-classes', methods=['GET'])
@jwt_required()
@role_required(['teacher'])
def get_assigned_classes():
    user_id = get_jwt_identity()
    teacher = Teacher.query.filter_by(user_id=user_id).first()
    if not teacher:
        return jsonify({"msg": "Teacher not found"}), 404

    # Assuming assigned_classes is a comma separated string like "class1,class2"
    assigned_classes = teacher.assigned_classes or ""
    # Convert string to list and strip whitespace
    class_list = [cls.strip().strip("'") for cls in assigned_classes.split(",") if cls.strip()]
    
    return jsonify({"assigned_classes": class_list}), 200

@teacher_bp.route('/teacher/students', methods=['GET'])
@jwt_required()
@role_required(['teacher'])
def get_students_by_class():
    class_name = request.args.get('class')

    if not class_name:
        return jsonify({"msg": "Class is required"}), 400

    students = Student.query.filter_by(class_name=class_name).all()

    result = [{
        "name": student.name,
        "roll_number": student.roll_number
    } for student in students]

    return jsonify(result), 200

@teacher_bp.route('/teacher/mark-attendance', methods=['POST'])
@jwt_required()
@role_required(['teacher'])
def mark_attendance():
    data = request.get_json()
    user_id = get_jwt_identity()
    teacher = Teacher.query.filter_by(user_id=user_id).first()
    if not teacher:
        return jsonify({"msg":"Teacher not found"}),404
    teacher_id = teacher.teacher_id

    attendance_entries = data.get('attendance')
    if not attendance_entries:
        return jsonify({"msg": "No attendance data provided"}), 400

    for entry in attendance_entries:
        roll_number = entry.get('roll_number')
        entry_date_str = entry.get('date')
        status = entry.get('status')
        subject_code = entry.get('subject_code')
        class_name = entry.get('class')

        if not all([roll_number, status, subject_code, class_name]):
            return jsonify({"msg": "Missing fields in attendance entry"}), 400

        subject_code = subject_code.upper()

        try:
            entry_date = dt_date.fromisoformat(entry_date_str) if entry_date_str else dt_date.today()
        except ValueError:
            return jsonify({"msg": "Invalid date format. Use YYYY-MM-DD"}), 400

        existing = Attendance.query.filter_by(
            roll_number=roll_number,
            teacher_id=teacher_id,
            date=entry_date,
            subject_code=subject_code,
            class_name=class_name
        ).first()

        if existing:
            continue

        attendance = Attendance(
            roll_number=roll_number,
            teacher_id=teacher_id,
            date=entry_date,
            subject_code=subject_code,
            status=status,
            edit_count=0,
            class_name=class_name
        )
        db.session.add(attendance)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Database error", "error": str(e)}), 500

    return jsonify({"msg": "Attendance marked"}), 201

@teacher_bp.route('/teacher/edit-attendance', methods=['PUT'])
@jwt_required()
@role_required(['teacher'])
def edit_attendance():
    data = request.get_json()
    user_id = get_jwt_identity()
    teacher = Teacher.query.filter_by(user_id=user_id).first()
    if not teacher:
        return jsonify({"msg":"Teacher not found"}),404
    teacher_id = teacher.teacher_id

    attendance_id = data.get('attendance_id')
    new_status = data.get('new_status')

    attendance = Attendance.query.filter_by(id=attendance_id, teacher_id=teacher_id).first()
    if not attendance:
        return jsonify({"msg": "Attendance record not found or not allowed"}), 404

    if attendance.edit_count >= 3:
        return jsonify({"msg": "Edit limit reached"}), 403

    previous_status = attendance.status
    attendance.status = new_status
    attendance.edit_count += 1
    db.session.commit()

    edit_log = EditLog(
        teacher_id=teacher_id,
        roll_number=attendance.roll_number,
        class_name=attendance.class_name,
        date=attendance.date,
        previous_status=previous_status,
        new_status=new_status,
        edit_time=datetime.utcnow()
    )
    db.session.add(edit_log)
    db.session.commit()

    return jsonify({"msg": "Attendance updated"}), 200

@teacher_bp.route('/teacher/filter', methods=['GET'])
@jwt_required()
@role_required(['teacher'])
def filter_attendance():
    class_name = request.args.get('class')
    date_str = request.args.get('date')
    subject_code = request.args.get('subject_code')
    roll_number = request.args.get('roll_number')
    user_id = get_jwt_identity()
    teacher = Teacher.query.filter_by(user_id=user_id).first()
    if not teacher:
        return jsonify({"msg":"Teacher not found"}),404
    teacher_id = teacher.teacher_id

    query = Attendance.query.filter_by(teacher_id=teacher_id)

    if class_name:
        query = query.filter_by(class_name=class_name)
    if date_str:
        try:
            date_obj = dt_date.fromisoformat(date_str)
            query = query.filter_by(date=date_obj)
        except ValueError:
            return jsonify({"msg": "Invalid date format"}), 400
    if roll_number:
        query = query.filter_by(roll_number=roll_number)
    if subject_code:
        query = query.filter_by(subject_code=subject_code.upper())

    results = query.all()
    data = [{
        "id": r.id,
        "roll_number": r.roll_number,
        "name": r.student.name if r.student else None,
        "date": r.date.isoformat(),
        "subject_code": r.subject_code,
        "status": r.status,
        "edit_count": r.edit_count
    } for r in results]

    return jsonify(attendance=data), 200
