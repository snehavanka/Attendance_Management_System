import React, { useEffect, useState } from 'react';
import axios from '../services/api';

function ParentDashboard() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    axios.get('/parent/view-attendance', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setRecords(res.data.attendance || []));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Your Child's Attendance</h2>
      <table className="border w-full">
        <thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead>
        <tbody>
          {records.map((row, i) => (
            <tr key={i}><td>{row.date}</td><td>{row.subject_code}</td><td>{row.status}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ParentDashboard;
