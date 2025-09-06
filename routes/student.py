from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.models import Attendance, AttendanceSummary, Student,db
from middleware.role_required import role_required
from sqlalchemy import distinct
from sqlalchemy import func, case
from datetime import date

student_bp = Blueprint('student', __name__)

@student_bp.route('/student/attendance', methods=['GET'])
@jwt_required()
@role_required(['student'])
def get_attendance():

    user_id = get_jwt_identity()
    
    student = Student.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({"msg": "Student not found"}), 404
    today = date.today()
   
    attendance_records = Attendance.query.with_entities(
        Attendance.date,
        Attendance.subject_code,
        Attendance.status
    ).filter_by(roll_number=student.roll_number) \
     .filter(Attendance.date == today) \
     .group_by(Attendance.subject_code, Attendance.date, Attendance.status) \
     .all()

    attendance_list = [{
        "date": att.date.isoformat(),
        "subject_code": att.subject_code,
        "status": att.status
    } for att in attendance_records]

    return jsonify({"attendance":attendance_list,
                    "batch":{
                        "starting_year":student.starting_year,
                        "ending_year":student.ending_year
                    }
                    }), 200


@student_bp.route('/student/summary', methods=['GET'])
@jwt_required()
@role_required(['student'])
def get_summary():
    user_id = get_jwt_identity()
    
    student = Student.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({"msg": "Student not found"}), 404

    
    summary_query = (
        db.session.query(
            Attendance.subject_code,
            func.count(func.distinct(Attendance.date)).label('total'),
            func.sum(case((Attendance.status == 'P', 1), else_=0)).label('attended')
        )
        .filter_by(roll_number=student.roll_number)
        .group_by(Attendance.subject_code)
        .all()
    )

    summary_list = []
    total_attended=0
    total_classes=0
    for subj_code, total, attended in summary_query:
        percentage = round((attended / total) * 100, 2) if total else 0
        summary_list.append({
            "subject_code": subj_code,
            "attended": attended,
            "total": total,
            "percentage": percentage
        })
        total_attended += attended
        total_classes += total

    overall_percentage = round((total_attended / total_classes) * 100, 2) if total_classes else 0

    return jsonify({ "summary": summary_list,
        "overall_attendance_percentage": overall_percentage,
        "batch": {
            "starting_year": student.starting_year,
            "ending_year": student.ending_year
        }
    }), 200
