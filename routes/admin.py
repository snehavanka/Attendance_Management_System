from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from flask_jwt_extended import get_jwt_identity
from werkzeug.security import generate_password_hash
from middleware.role_required import role_required
from database.models import User, Attendance, Teacher, Student, db

admin_bp = Blueprint('admin', __name__)
@admin_bp.route('/admin/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "email": user.email,
        "role": user.role
    }), 200

@admin_bp.route('/admin/filter-attendance', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def filter_attendance():
    roll_number = request.args.get('roll_number')
    date_from = request.args.get('from')
    date_to = request.args.get('to')
    class_name = request.args.get('class')

    query = Attendance.query

    if roll_number:
        query = query.filter_by(roll_number=roll_number)
    if class_name:
        query = query.filter_by(class_name=class_name)
    if date_from and date_to:
        query = query.filter(Attendance.date.between(date_from, date_to))

    records = query.all()
    data = [{
        "id": r.id,
        "roll_number": r.roll_number,
        "date": r.date.isoformat(),
        "subject_code": r.subject_code,
        "status": r.status,
        "class": r.class_name
    } for r in records]

    return jsonify(attendance=data), 200


@admin_bp.route('/admin/teachers', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def get_teachers():
    teachers = Teacher.query.all()
    data = [{
        "teacher_id": t.teacher_id,
        "name": t.name,
        "department": t.department,
        "assigned_classes": t.assigned_classes
    } for t in teachers]

    return jsonify(teachers=data), 200


@admin_bp.route('/admin/get-all-users', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def get_all_users():
    name = request.args.get('name', '').strip()
    email = request.args.get('email', '').strip()
    role = request.args.get('role', '').strip().lower()
    starting_year = request.args.get('starting_year')
    ending_year = request.args.get('ending_year')

    query = db.session.query(User)

    if name:
        query = query.filter(User.name.ilike(f"%{name}%"))
    if email:
        query = query.filter(User.email.ilike(f"%{email}%"))
    if role:
        query = query.filter(func.lower(User.role) == role)

    if role == 'student':
        query = query.join(Student, User.id == Student.user_id)
        if starting_year:
            query = query.filter(Student.starting_year == int(starting_year))
        if ending_year:
            query = query.filter(Student.ending_year == int(ending_year))

    users = query.all()

    result = []
    for user in users:
        data = {
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        }

        if user.role == 'student' and hasattr(user, 'student_profile'):
            data.update({
                "roll_number": user.student_profile.roll_number,
                "class_name": user.student_profile.class_name,
                "parent_email": user.student_profile.parent_email,
                "starting_year": user.student_profile.starting_year,
                "ending_year": user.student_profile.ending_year,
            })
        elif user.role == 'teacher' and hasattr(user, 'teacher_profile'):
            data.update({
                "teacher_id": user.teacher_profile.teacher_id,
                "department": user.teacher_profile.department,
                "assigned_classes": user.teacher_profile.assigned_classes,
            })

        result.append(data)

    return jsonify(result), 200


@admin_bp.route('/admin/manage-user', methods=['POST', 'PUT', 'DELETE'])
@jwt_required()
@role_required(['admin'])
def manage_user():
    data = request.get_json()
    action = request.method

    if action == 'POST':
        name = data.get('name')
        email = data.get('email')
        role = data.get('role')
        password = data.get('password')

        if not all([name, email, role, password]):
            return jsonify({"error": "Missing required fields"}), 400

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "User with this email already exists"}), 409

        hashed_password=generate_password_hash(password)
        new_user = User(name=name, email=email, role=role, password=hashed_password)
        db.session.add(new_user)
        db.session.flush()

        if role == 'teacher':
            teacher = Teacher(
                teacher_id=data.get("teacher_id"),
                user_id=new_user.id,
                name=name,
                department=data.get('department', ''),
                assigned_classes=data.get('assigned_classes', '')
            )
            db.session.add(teacher)

        elif role == 'student':
            roll_number = data.get('roll_number')
            student_class = data.get('class_name')
            parent_email = data.get('parent_email', '')
            starting_year = data.get('starting_year')
            ending_year = data.get('ending_year')

            if not roll_number or not student_class:
                return jsonify({"error": "Missing student roll_number or class"}), 400

            student = Student(
                user_id=new_user.id,
                roll_number=roll_number,
                name=name,
                class_name=student_class,
                parent_email=parent_email,
                starting_year=starting_year,
                ending_year=ending_year
            )
            db.session.add(student)

        db.session.commit()
        return jsonify({"msg": "User created", "user_id": new_user.id}), 201

    elif action == 'PUT':
        user_id = data.get('id')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        user.name = data.get('name', user.name)
        user.email = data.get('email', user.email)
        user.role = data.get('role', user.role)
        if data.get('password'):
            user.password = generate_password_hash(data.get('password'))

        if user.role == 'teacher':  
            teacher = Teacher.query.filter_by(user_id=user.id).first()
            if not teacher:
                teacher = Teacher(user_id=user.id, name=user.name)
                db.session.add(teacher)

            teacher.department = data.get('department', teacher.department)
            teacher.assigned_classes = data.get('assigned_classes', teacher.assigned_classes)

        elif user.role == 'student':
            student = Student.query.filter_by(user_id=user.id).first()
            if not student:
                return jsonify({"error": "Student record not found for user"}), 404

            student.roll_number = data.get('roll_number', student.roll_number)
            student.class_name = data.get('class_name', student.class_name)
            student.parent_email = data.get('parent_email', student.parent_email)
            student.starting_year = data.get('starting_year', student.starting_year)
            student.ending_year = data.get('ending_year', student.ending_year)
            student.name = user.name

        db.session.commit()
        return jsonify({"msg": "User updated"}), 200

    elif action == 'DELETE':
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        if user.role == 'teacher':
            teacher = Teacher.query.filter_by(user_id=user.id).first()
            if teacher:
                db.session.delete(teacher)

        elif user.role == 'student':
            student = Student.query.filter_by(user_id=user.id).first()
            if student:
                db.session.delete(student)

        db.session.delete(user)
        db.session.commit()
        return jsonify({"msg": "User deleted"}), 200

    return jsonify({"error": "Invalid request method"}), 405
