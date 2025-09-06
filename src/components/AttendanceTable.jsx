import React from 'react';

const AttendanceTable = ({ records }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>S.No</th>
          <th>Subject Code</th>
          <th>Attendance %</th>
          <th>Classes Attended</th>
          <th>Total Conducted</th>
          <th>Status (P/A)</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{record.subject_code}</td>
            <td>{record.percentage}%</td>
            <td>{record.attended}</td>
            <td>{record.total}</td>
            <td>{record.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AttendanceTable;
