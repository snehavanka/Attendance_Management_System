import React, {useState }  from 'react';

const AttendanceForm = ({ students, handleSubmit }) => {
  const [statusMap, setStatusMap] = useState({});

  const handleStatusChange = (roll, status) => {
    setStatusMap(prev => ({ ...prev, [roll]: status }));
  };

  const onSubmit = () => {
    handleSubmit(statusMap);
  };

  return (
    <div>
      <h3>Mark Attendance</h3>
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.roll_number}>
              <td>{s.roll_number}</td>
              <td>{s.name}</td>
              <td>
                <select value={statusMap[s.riil_number]||''} 
                onChange={(e) => handleStatusChange(s.roll_number, e.target.value)}>
                  <option value="">-- Select --</option>
                  <option value="P">Present</option>
                  <option value="A">Absent</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
};

export default AttendanceForm;
