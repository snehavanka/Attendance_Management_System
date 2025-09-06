create  database attendancesystems
use attendancesystems;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  password VARCHAR(100),
  role ENUM('student', 'teacher', 'admin', 'parent')
);
ALTER TABLE users MODIFY password VARCHAR(256);
select*from users;


CREATE TABLE students (
  roll_number VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100),
  class VARCHAR(50),
  parent_email VARCHAR(100)
);

ALTER table students add user_id int unique;
ALTER table students 
    add constraint fk_student_user
    FOREIGN key (user_id) REFERENCES users(id);
  
ALTER TABLE students ADD COLUMN parent_id INT;
ALTER TABLE students
ADD CONSTRAINT fk_parent_user
FOREIGN KEY (parent_id) REFERENCES users(id);
UPDATE users
SET email="vankasneha218@gmail.com"
WHERE name = 'Sneha Vanka';
ALTER TABLE students
ADD COLUMN starting_year INT,
ADD COLUMN ending_year INT;
select*from students;

CREATE TABLE teachers (
  teacher_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100),
  department VARCHAR(100),
  assigned_classes TEXT
);
ALTER TABLE teachers ADD user_id int unique;
alter table teachers 
      add constraint fk_teacher_user 
      FOREIGN key(user_id) REFERENCES users(id);
      

CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roll_number VARCHAR(20),
  teacher_id VARCHAR(20),
  date DATE,
  subject_code VARCHAR(50),
  status ENUM('P', 'A'),
  edit_count INT DEFAULT 0,
  class VARCHAR(50),
  FOREIGN KEY (roll_number) REFERENCES students(roll_number),
  FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
);
select* from attendance;
CREATE TABLE attendance_summary (
  roll_number VARCHAR(20),
  subject_code VARCHAR(50),
  attended INT DEFAULT 0,
  total INT DEFAULT 0,
  percentage FLOAT,
  PRIMARY KEY (roll_number, subject_code)
);
delete from attendance_summary;

CREATE TABLE edit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id VARCHAR(20),
  roll_number VARCHAR(20),
  class VARCHAR(50),
  date DATE,
  previous_status VARCHAR(1),
  new_status VARCHAR(1),
  edit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DESC students;
select*from students;