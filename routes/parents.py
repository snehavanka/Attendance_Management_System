from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from middleware.role_required import role_required
from database.models import Student, Attendance

parent_bp = Blueprint('parent', __name__)

@parent_bp.route('/parent/view-attendance', methods=['GET'])
@jwt_required()
@role_required(['parent'])
def view_child_attendance():
    user_id = get_jwt_identity()
    print("JWT user_id:", user_id)
    # Get student linked to parent (assuming parent email or user id matches)
    student = Student.query.filter_by(parent_id=user_id).first()
    if not student:
        return jsonify({"msg": "Child not found"}), 404

    attendance_records = Attendance.query.filter_by(roll_number=student.roll_number).all()
    data = [{
        "date": att.date.isoformat(),
        "subject_code": att.subject_code,
        "status": att.status
    } for att in attendance_records]

    return jsonify(attendance=data), 200
