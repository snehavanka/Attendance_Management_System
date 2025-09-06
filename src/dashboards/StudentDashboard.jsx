import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../services/api';
import './StudentDashboard.css'; 
function StudentDashboard() {
  const [attendanceToday, setAttendanceToday] = useState([]);
  const [overallStats, setOverallStats] = useState([]);
  const [overallPercentage, setOverallPercentage] = useState(null);
  const [activeTab, setActiveTab] = useState('today');

  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/student/attendance', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      setAttendanceToday(res.data.attendance);
    }).catch(err => {
      console.error("Attendance fetch failed:", err.response?.data || err.message);
    });

    axios.get('/student/summary', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      setOverallStats(res.data.summary);
      setOverallPercentage(res.data.overall_attendance_percentage);
    }).catch(err => {
      console.error("Summary fetch failed:", err.response?.data || err.message);
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  return (
    <div className="dash">
      {/* Top Navigation Bar */}
      <div className="nav">
        <h1 className="title">Student Dashboard</h1>
        <div className="nav-items">
          <div
            onClick={() => setActiveTab('today')}
            className={`tab ${activeTab === 'today' ? 'tab-active' : ''}`}
          >
            Today's Attendance
          </div>
          <div
            onClick={() => setActiveTab('overall')}
            className={`tab ${activeTab === 'overall' ? 'tab-active' : ''}`}
          >
            Overall Attendance
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="content">
        {activeTab === 'today' && (
          <div>
            <h2 className="section-title">Today's Attendance</h2>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceToday.map((row, i) => (
                  <tr key={i}>
                    <td>{row.subject_code}</td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'overall' && (
          <div>
            <h2 className="section-title">Overall Attendance</h2>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>%</th>
                  <th>Attended</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {overallStats.map((row, i) => {
                  const isLow = row.percentage < 75;
                  return (
                    <tr key={i} className={isLow ? 'low-att' : ''}>
                      <td>{row.subject_code}</td>
                      <td className={isLow ? 'low-text' : 'good-text'}>
                        {row.percentage}%
                      </td>
                      <td>{row.attended}</td>
                      <td>{row.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {overallPercentage !== null && (
              <div className={`overall ${overallPercentage < 75 ? 'warn' : 'good'}`}>
                Overall Attendance: {overallPercentage}%
                {overallPercentage < 75 && ' — Warning: Below 75%!'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;

