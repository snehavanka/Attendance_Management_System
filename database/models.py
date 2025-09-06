from datetime import datetime
from database import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(256))
    role = db.Column(db.Enum('student', 'teacher', 'admin', 'parent'))

    student_profile = db.relationship("Student", backref="user", uselist=False, foreign_keys="[Student.user_id]")
    teacher_profile = db.relationship("Teacher",backref='user',uselist=False,foreign_keys="[Teacher.user_id]")

class Student(db.Model):
    __tablename__ = 'students'
    roll_number = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(100))
    class_name = db.Column('class', db.String(50))
    parent_email = db.Column(db.String(100))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    starting_year = db.Column(db.Integer)
    ending_year = db.Column(db.Integer)
    parent = db.relationship('User', foreign_keys=[parent_id])
    attendances = db.relationship('Attendance', back_populates='student')

class Teacher(db.Model):
    __tablename__ = 'teachers'
    teacher_id = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(100))
    department = db.Column(db.String(100))
    assigned_classes = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'),nullable=False)
   
    
class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    roll_number = db.Column(db.String(20), db.ForeignKey('students.roll_number'))
    teacher_id = db.Column(db.String(20), db.ForeignKey('teachers.teacher_id'))
    date = db.Column(db.Date)
    subject_code = db.Column(db.String(50))
    status = db.Column(db.Enum('P', 'A'))
    edit_count = db.Column(db.Integer, default=0)
    class_name = db.Column('class', db.String(50))
    student = db.relationship('Student', back_populates='attendances')

class AttendanceSummary(db.Model):
    __tablename__ = 'attendance_summary'
    roll_number = db.Column(db.String(20), primary_key=True)
    subject_code = db.Column(db.String(50), primary_key=True)
    attended = db.Column(db.Integer, default=0)
    total = db.Column(db.Integer, default=0)
    percentage = db.Column(db.Float)

class EditLog(db.Model):
    __tablename__ = 'edit_logs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    teacher_id = db.Column(db.String(20))
    roll_number = db.Column(db.String(20))
    class_name = db.Column('class', db.String(50))
    date = db.Column(db.Date)
    previous_status = db.Column(db.String(1))
    new_status = db.Column(db.String(1))
    edit_time = db.Column(db.DateTime, default=datetime.utcnow)
