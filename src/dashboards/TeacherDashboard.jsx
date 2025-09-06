
import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import {useNavigate} from 'react-router-dom';
import './TeacherDashboard.css'; 

function TeacherDashboard() {
  const today = new Date().toISOString().split('T')[0];

  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [filters, setFilters] = useState({ class: '', date: today, roll_number: '', subject_code: '' });
  const [subjectCode, setSubjectCode] = useState('');
  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [attendanceData, setAttendanceData] = useState([]);
  const [editStatusMap, setEditStatusMap] = useState({});
  const [editCountMap, setEditCountMap] = useState({});
  const navigate=useNavigate();
  const [teacherInfo, setTeacherInfo] = useState({ email: '', role: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return alert("No token found. Please login again.");

    axios.get('/teacher/assigned-classes', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setAssignedClasses(res.data.assigned_classes || []);
    }).catch(err => {
      console.error("Failed to load assigned classes", err);
      alert("Failed to load assigned classes");
    });
  }, []);
    useEffect(() => {
    axios.get('/teacher/profile', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => {
      setTeacherInfo(res.data);
    })
    .catch(err => {
      console.error("Failed to fetch teacher profile:", err);
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };
  useEffect(() => {
    if (selectedClass) {
      setFilters(prev => ({ ...prev, class: selectedClass }));
    }
  }, [selectedClass]);

  useEffect(() => {
    if (filters.class) {
      fetchStudentsAndAttendance();
    }
  }, [filters.class]);

  const fetchStudentsAndAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const [studentRes, attRes] = await Promise.all([
        axios.get('/teacher/students', {
          headers: { Authorization: `Bearer ${token}` },
          params: { class: filters.class }
        }),
        axios.get('/teacher/filter', {
          headers: { Authorization: `Bearer ${token}` },
          params: { class: filters.class, date: filters.date }
        })
      ]);

      const allStudents = studentRes.data;
      const attendanceRecords = attRes.data.attendance || [];

      const editStatus = {};
      const editCount = {};
      attendanceRecords.forEach(rec => {
        editStatus[rec.id] = rec.status;
        editCount[rec.id] = rec.edit_count;
      });

      setStudents(allStudents);
      setAttendanceData(attendanceRecords);
      setEditStatusMap(editStatus);
      setEditCountMap(editCount);
    } catch (err) {
      console.error(err);
      alert("Failed to load students or attendance");
    }
  };

  const fetchAttendance = () => {
    const token = localStorage.getItem('token');
    axios.get('/teacher/filter', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        class: filters.class,
        date: filters.date,
        roll_number: filters.roll_number,
        subject_code: subjectCode.trim()
      }
    }).then(res => {
      const records = res.data.attendance || [];

      const editStatus = {};
      const editCount = {};
      records.forEach(att => {
        editStatus[att.id] = att.status;
        editCount[att.id] = att.edit_count;
      });

      setAttendanceData(records);
      setEditStatusMap(editStatus);
      setEditCountMap(editCount);

      const filteredStudents = records.map(a => ({
        roll_number: a.roll_number,
        name: a.name
      }));
      setStudents(filteredStudents);
    }).catch(err => {
      console.error(err);
      alert("Failed to fetch attendance");
    });
  };

  const submitAttendance = () => {
    if (!subjectCode.trim()) return alert("Please enter subject code");
    if (!students.length) return alert("No students loaded");

    const submittedRolls = attendanceData.map(a => a.roll_number);
    const attendanceList = students
      .filter(s => !submittedRolls.includes(s.roll_number))
      .map(s => ({
        roll_number: s.roll_number,
        status: statusMap[s.roll_number] || 'P',
        date: filters.date,
        subject_code: subjectCode.trim(),
        class: filters.class
      }));

    if (!attendanceList.length) return alert("All students already marked");

    axios.post('/teacher/mark-attendance', { attendance: attendanceList }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(() => {
      alert("Attendance submitted");
      fetchStudentsAndAttendance();
    }).catch(() => alert("Failed to submit attendance"));
  };

  const submitEdit = (id) => {
    const new_status = editStatusMap[id];
    if (!new_status) return alert("Select new status");
    if (editCountMap[id] >= 3) return alert("Edit limit reached");

    axios.put('/teacher/edit-attendance', {
      attendance_id: id,
      new_status
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(() => {
      alert("Attendance updated");
      fetchStudentsAndAttendance();
    }).catch(err => {
      alert(err.response?.data?.msg || "Edit failed");
    });
  };

  const isAttendanceSubmitted = (roll_number) =>
    attendanceData.some(a => a.roll_number === roll_number);

  return (
    <div className="teacher-dashboard">
      <aside className="sidebar">
        <h3>Assigned Classes</h3>
        <div className="class-list">
          {assignedClasses.map(cls => (
            <button
              key={cls}
              className={`class-btn ${cls === selectedClass ? 'active' : ''}`}
              onClick={() => setSelectedClass(cls)}
            >
              {cls}
            </button>
          ))}
          </div>
         <div className="teacher-info">
          <p><strong>{teacherInfo.email}</strong></p>
          <p>{teacherInfo.role}</p> 
        </div>
        <button className="logout-btn" onClick={() => {
          localStorage.removeItem('token');
          navigate('/',{replace:true});
        }}>Logout</button>
      </aside>

      <main className="main-content">
        {!selectedClass && (
          <p className="welcome-text">Please select a class from the right to view students.</p>
        )}

        {selectedClass && (
          <>
            <div className="filters">
              <span><strong>Class:</strong> {filters.class}</span>
              <span><strong>Date:</strong> {filters.date}</span>
              <label><strong>Roll NO:</strong></label>
              <input
                placeholder="Roll Number"
                value={filters.roll_number}
                onChange={e => setFilters({ ...filters, roll_number: e.target.value })}
              />
              <label><strong>Subject Code:</strong></label>
              <input
                placeholder="Subject Code"
                value={subjectCode}
                onChange={e => setSubjectCode(e.target.value)}
              />
              <button onClick={fetchStudentsAndAttendance}>Load Students</button>
              <button onClick={fetchAttendance}>Filter Attendance</button>
            </div>

            {students.length > 0 && (
              <>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Roll No</th>
                        <th>Status</th>
                        <th>Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => {
                        const attRecord = attendanceData.find(a => a.roll_number === s.roll_number);
                        return (
                          <tr key={s.roll_number}>
                            <td>{s.name}</td>
                            <td>{s.roll_number}</td>
                            <td>
                              {attRecord ? (
                                attRecord.status
                              ) : (
                                <select
                                  value={statusMap[s.roll_number] || 'P'}
                                  onChange={e =>
                                    setStatusMap({ ...statusMap, [s.roll_number]: e.target.value })
                                  }
                                >
                                  <option value="P">Present</option>
                                  <option value="A">Absent</option>
                                </select>
                              )}
                            </td>
                            <td>
                              {attRecord ? (
                                editCountMap[attRecord.id] < 3 ? (
                                  <>
                                    <select
                                      value={editStatusMap[attRecord.id] ?? attRecord.status}
                                      onChange={e =>
                                        setEditStatusMap({
                                          ...editStatusMap,
                                          [attRecord.id]: e.target.value
                                        })
                                      }
                                    >
                                      <option value="P">Present</option>
                                      <option value="A">Absent</option>
                                    </select>
                                    <button
                                      disabled={editStatusMap[attRecord.id] === attRecord.status}
                                      onClick={() => submitEdit(attRecord.id)}
                                    >
                                      Edit ({editCountMap[attRecord.id] || 0}/3)
                                    </button>
                                  </>
                                ) : (
                                  <span className="limit-text">Edit Limit Reached</span>
                                )
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {students.some(s => !isAttendanceSubmitted(s.roll_number)) && (
                  <footer className="footer">
                    <button onClick={submitAttendance}>Submit Attendance</button>
                  </footer>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default TeacherDashboard;

