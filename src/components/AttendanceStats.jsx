import React from 'react';

const AttendanceStats = ({ summary }) => {
  return (
    <div>
      <h3>Overall Attendance Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Subject Code</th>
            <th>Classes Attended</th>
            <th>Total Conducted</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((row, index) => (
            <tr key={index}>
              <td>{row.subject_code}</td>
              <td>{row.attended}</td>
              <td>{row.total}</td>
              <td>{row.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceStats;
