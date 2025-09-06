# Attendance_Management_System
Role-based Attendance Management System built with Flask, React (Vite), and MySQL — supports students, teachers, parents, and admins with secure login, attendance tracking, filtering, and reporting for schools/colleges.
## 📌 Project Overview
A **role-based Attendance Management System** built using **Flask (Python)** for the backend and **React + Vite** for the frontend.  

The system supports **Students, Teachers, Parents, and Admins**, each with specific role-based capabilities:

- **Students**  
  - Secure login to view their daily attendance.  
  - Can view subject-wise percentages.  
  - Daily status is visible only for the current day; overall percentages remain available.  

- **Teachers**  
  - Mark attendance for assigned classes.  
  - Can edit attendance up to **3 times per student per day**.  
  - Filter attendance by class, date, or roll number.  
  - Can only view and edit students in their assigned classes.  

- **Parents**  
  - Read-only access to their child’s attendance.  

- **Admins**  
  - Add, edit, or delete students, teachers, and parents.  
  - Assign teachers to classes.  
  - Filter attendance records by class, date, or roll number.  
  - View attendance logs and edit history.  
  - View teacher details with filters (name, teacher ID, department).  

---

## 🏗 Project Architecture
attendance-system/
├── backend/
│ ├── app.py # Main Flask entry point
│ ├── config.py # Configuration (DB, JWT secret, etc.)
│ ├── requirements.txt # Python dependencies
│ ├── database/
│ │ ├── models.py # SQLAlchemy models
│ │ ├── schema.sql # SQL table schema
│ │ └── seed_data.sql # Initial sample data
│ ├── utils/
│ │ ├── jwt_auth.py # JWT handling
│ │ ├── db_helper.py # Common DB utilities
│ │ └── password_hash.py # Password hashing
│ ├── middleware/
│ │ └── role_required.py # Role-based access middleware
│ ├── routes/
│ │ ├── auth.py # /login, signup
│ │ ├── student.py # Student routes
│ │ ├── teacher.py # Teacher routes
│ │ ├── admin.py # Admin routes
│ │ └── parent.py # Parent routes
│ └── logs/
│ └── edit_logs.csv # Optional CSV for edit history
├── frontend/ (React + Vite)
│ ├── public/
│ │ └── index.html
│ ├── src/
│ │ ├── index.jsx
│ │ ├── App.jsx
│ │ ├── auth/
│ │ │ ├── LoginPage.jsx
│ │ │ └── ProtectedRoute.jsx
│ │ ├── dashboards/
│ │ │ ├── StudentDashboard.jsx
│ │ │ ├── TeacherDashboard.jsx
│ │ │ ├── ParentDashboard.jsx
│ │ │ └── AdminDashboard.jsx
│ │ ├── components/
│ │ │ ├── AttendanceTable.jsx
│ │ │ ├── AttendanceForm.jsx
│ │ │ ├── AttendanceStats.jsx
│ │ │ └── Filters.jsx
│ │ ├── services/
│ │ │ └── api.js # Axios wrapper for backend
│ │ └── styles/
│ │ └── app.css
│ └── package.json
├── .env # Secrets (JWT, DB URL, etc.)
## 🗄 Database Schema (SQLAlchemy Models)

### `users`
- `id` (PK)  
- `name`  
- `email` (unique)  
- `password` (hashed)  
- `role` (student/teacher/admin/parent)  

### `students`
- `roll_number` (PK)  
- `name`  
- `class_name`  
- `starting_year`, `ending_year`  
- `user_id` (FK → users.id, unique)  
- `parent_id` (FK → users.id for parent)  

### `teachers`
- `teacher_id` (PK)  
- `name`  
- `department`  
- `user_id` (FK → users.id)  

### `teacher_classes` ✅ (new, replaces `assigned_classes`)
- `id` (PK)  
- `teacher_id` (FK → teachers.teacher_id)  
- `class_name`  

### `attendance`
- `id` (PK)  
- `roll_number` (FK → students.roll_number)  
- `teacher_id` (FK → teachers.teacher_id)  
- `date`  
- `subject_code`  
- `status` (`P`/`A`)  
- `edit_count` (default = 0)  
- `class_name`  

🔒 Unique Constraint:  
`(roll_number, date, subject_code)` → ensures only one record per student per subject per day.  

### `attendance_summary`
- `roll_number` (PK, FK → students.roll_number)  
- `subject_code` (PK)  
- `attended`  
- `total`  
- `percentage`  

### `edit_logs`
- `id` (PK)  
- `teacher_id`  
- `roll_number`  
- `class_name`  
- `date`  
- `previous_status`  
- `new_status`  
- `edit_time` (auto timestamp)  

---

## 🔑 Key Flask Routes

### Authentication
- `POST /login`  
- `POST /signup` (admin-only for creating users)  

### Student
- `GET /student/attendance`  
- `GET /student/summary`  

### Teacher
- `POST /teacher/mark-attendance`  
- `PUT /teacher/edit-attendance`  
- `GET /teacher/filter?class=...&date=...&roll_no=...`  

### Parent
- `GET /parent/view-attendance`  

### Admin
- `GET /admin/filter-attendance?from=...&to=...&class=...`  
- `GET /admin/teachers`  
- `POST/PUT/DELETE /admin/manage-user`  

---

## 👥 User Roles & Permissions

### Student
- View own attendance (daily + percentage summary).  

### Teacher
- Mark attendance for assigned classes.  
- Edit up to 3 times per student per day.  
- Filter attendance by date/class/roll number.  

### Parent
- View child’s attendance (read-only).  

### Admin
- Manage all users (add/edit/delete).  
- Assign teachers to classes.  
- View and filter attendance.  
- Access audit logs.  

---

## 📊 Attendance Logic
### Student Dashboard Table 
Screen shot
<img width="1912" height="907" alt="Screenshot 2025-09-06 151555" src="https://github.com/user-attachments/assets/a10da4fc-29e9-43e8-8303-59f2768db94f" />

### Teacher Dashboard Table
<img width="1901" height="906" alt="Screenshot 2025-09-06 151750" src="https://github.com/user-attachments/assets/7f9e818d-fd41-4cbd-ad33-7ad4fe65e906" />

- `edit_count` ensures max 3 edits/day per student.  
- `edit_logs` tracks history of changes.  

### Admin Dashboard Table
<img width="1913" height="906" alt="Screenshot 2025-09-06 151708" src="https://github.com/user-attachments/assets/3c14f0d7-976d-4a7e-bbfa-7d552c315c5c" />

---

## ⚙️ Backend
- Flask (Python) + SQLAlchemy ORM  
- JWT authentication (role-based access)  
- CORS enabled for React frontend  
- SQLite/MySQL support  

---

## 🎨 Frontend
- React + Vite  
- Role-based dashboards  
- Attendance marking and filtering  
- Responsive UI  

---

## 🚀 Getting Started

### Backend
```bash
cd backend
pip install -r requirements.txt
flask run

Frontend: 
  cd frontend
  npm install
  npm run dev

Environment Variables (.env)
  SECRET_KEY=your_jwt_secret
  DATABASE_URL=mysql+pymysql://user:password@localhost/attendance_db


