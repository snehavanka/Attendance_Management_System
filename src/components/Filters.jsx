import React, { useState } from 'react';

const Filters = ({ onFilter }) => {
  const [roll, setRoll] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [cls, setCls] = useState('');

  const handleClick = () => {
    onFilter({ roll, from, to, className: cls });
  };

  return (
    <div>
      <h4>Filter Attendance</h4>
      <input type="text" placeholder="Roll No" value={roll} onChange={e => setRoll(e.target.value)} />
      <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
      <input type="date" value={to} onChange={e => setTo(e.target.value)} />
      <input type="text" placeholder="Class" value={cls} onChange={e => setCls(e.target.value)} />
      <button onClick={handleClick}>Apply Filter</button>
    </div>
  );
};

export default Filters;
