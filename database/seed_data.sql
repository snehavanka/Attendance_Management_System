use attendancesystems;

INSERT INTO users (name, email, password, role) VALUES
('Sneha Vanka', 'sneha.vanka@example.com', 'hashed_password1', 'student'),
('Rajesh Kumar', 'rajesh.kumar@example.com', 'hashed_password2', 'teacher'),
('Anita Singh', 'anita.singh@example.com', 'hashed_password3', 'admin'),
('Sunita Verma', 'sunita.verma@example.com', 'hashed_password4', 'parent');
SELECT *from users;
SELECT email,password from users;
update users set email='rajesh@gmail.com'
where name='Rajesh Kumar';

INSERT INTO students (roll_number, name, class, parent_email) VALUES
('CS202301', 'Sneha Vanka', 'CSE-4A', 'sunita.verma@example.com');
UPDATE students set user_id=3 
where name="Sneha Vanka";


select*from students;

INSERT INTO teachers (teacher_id, name, department, assigned_classes, user_id) VALUES
('T1001', 'Rajesh Kumar', 'Computer Science', "'CSE-4A','CSE-4B'", 4);
select*from teachers;

INSERT INTO attendance (roll_number, teacher_id, date, subject_code, status, edit_count, class) VALUES
('CS202301', 'T1001', '2025-07-21', 'CSE401', 'P', 0, 'CSE-4A');
DELETE FROM attendance WHERE id = 12;
select*from attendance;

INSERT INTO attendance_summary (roll_number, subject_code, attended, total, percentage) VALUES
('CS202301', 'CSE401', 45, 48, 93.75);

select*from attendance_summary;

/*INSERT INTO edit_logs (teacher_id, roll_number, class, date, previous_status, new_status) VALUES
('T1001', 'CS202302', 'CSE-4A', '2025-07-20', 'A', 'P');*/
select*from edit_logs;