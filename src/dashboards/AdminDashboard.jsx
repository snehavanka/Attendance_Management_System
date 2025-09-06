
import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import './AdminDashboard.css';  

function AdminDashboard() {
  const [action, setAction] = useState('POST');
  const [role, setRole] = useState('');
  const [userForm, setUserForm] = useState({
    id: '', name: '', email: '', password: '',
    roll_number: '', class_name: '', parent_email: '',
    starting_year: '', ending_year: '',
    teacher_id: '', department: '', assigned_classes: '', role: ''
  });
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);

  const [userFilters, setUserFilters] = useState({
    name: '', email: '', role: '',
    starting_year: '', ending_year: ''
  });

  const [attendanceFilters, setAttendanceFilters] = useState({ roll_number: '', class: '', from: '', to: '' });
  const [attendanceResults, setAttendanceResults] = useState([]);

  const [activeTab, setActiveTab] = useState('manageUser');

  const tokenHeader = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
  const [userInfo, setUserInfo] = useState({ email: '', role: '' });
  
  const handleUserInput = (e) => {
    const { name, value } = e.target;
    if (editUser) {
      setEditUser(prev => ({ ...prev, [name]: value }));
    } else {
      setUserForm(prev => ({ ...prev, [name]: value }));
      if (name === 'role') setRole(value);
    }
  };

 
  const submitUser = async () => {
    try {
      const dataToSend = editUser ? editUser : userForm;
      const method = editUser ? 'put' : action.toLowerCase();
      const url = '/admin/manage-user';

      const res = await axios({
        method,
        url,
        data: dataToSend,
        ...tokenHeader
      });
      alert(res.data.msg || 'Success');
      resetUserForm();
      setEditUser(null);
      fetchUsers();
      setActiveTab('allUsers'); 
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const resetUserForm = () => {
    setUserForm({
      id: '', name: '', email: '', password: '',
      roll_number: '', class_name: '', parent_email: '',
      starting_year: '', ending_year: '',
      teacher_id: '', department: '', assigned_classes: '', role: ''
    });
    setRole('');
  };


  const fetchUsers = () => {
    const cleanedFilters = {};
    if (userFilters.name.trim()) cleanedFilters.name = userFilters.name.trim();
    if (userFilters.email.trim()) cleanedFilters.email = userFilters.email.trim();
    if (userFilters.role && userFilters.role !== "") cleanedFilters.role = userFilters.role.toLowerCase();

    if (!cleanedFilters.role || cleanedFilters.role === 'student') {
      if (userFilters.starting_year.trim()) cleanedFilters.starting_year = userFilters.starting_year.trim();
      if (userFilters.ending_year.trim()) cleanedFilters.ending_year = userFilters.ending_year.trim();
    }

    axios.get('/admin/get-all-users', { params: cleanedFilters, ...tokenHeader })
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  };

  
  const handleDelete = (user_id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    axios.delete('/admin/manage-user', { ...tokenHeader, data: { user_id } })
      .then(res => {
        alert(res.data.msg);
        fetchUsers();
      })
      .catch(err => {
        alert(err.response?.data?.error || 'Delete failed');
      });
  };


  const handleEdit = (user) => {
    setEditUser({
      id: user.user_id,
      name: user.name || '',
      email: user.email || '',
      role: user.role || '',
      password: '',
      roll_number: user.roll_number || '',
      class_name: user.class_name || '',
      parent_email: user.parent_email || '',
      starting_year: user.starting_year || '',
      ending_year: user.ending_year || '',
      teacher_id: user.teacher_id || '',
      department: user.department || '',
      assigned_classes: user.assigned_classes || ''
    });
    setRole(user.role || '');
    setActiveTab('manageUser');
  };

  
  const fetchAttendance = async () => {
    try {
      const res = await axios.get('/admin/filter-attendance', { ...tokenHeader, params: attendanceFilters });
      setAttendanceResults(res.data.attendance || []);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to fetch attendance');
    }
  };
  useEffect(() => {
  fetchUsers();
  fetchUserInfo(); 
}, []);

const fetchUserInfo = async () => {
  try {
    const res = await axios.get('/admin/me', tokenHeader);
    setUserInfo({ email: res.data.email, role: res.data.role });
  } catch (err) {
    console.error('Failed to fetch user info');
  }
};


  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  
  const showStudentCols = userFilters.role === '' || userFilters.role === 'student';
  const showTeacherCols = userFilters.role === '' || userFilters.role === 'teacher';

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>

      <nav className="navbar">
        <div className="nav-tabs">
          <div
            className={`nav-tab ${activeTab === 'manageUser' ? 'active' : ''}`}
            onClick={() => setActiveTab('manageUser')}
          >
            Manage User
          </div>
          <div
            className={`nav-tab ${activeTab === 'allUsers' ? 'active' : ''}`}
            onClick={() => setActiveTab('allUsers')}
          >
            All Users
          </div>
          <div
            className={`nav-tab ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            Attendance
          </div>
        </div>
        {/* Display email and role */}
  <div className="user-info" style={{ marginRight: '10px', color: '#fff' }}>
    {userInfo.email} ({userInfo.role})
  </div>

        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>

      {activeTab === 'manageUser' && (
        <div className="manage-user-section">
          <h2>{editUser ? 'Edit User' : 'Create User'}</h2>

          {editUser ? (
            <>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={editUser.name}
                onChange={handleUserInput}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={editUser.email}
                onChange={handleUserInput}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={editUser.password}
                onChange={handleUserInput}
              />
              <select
                name="role"
                value={editUser.role}
                onChange={(e) => {
                  handleUserInput(e);
                  setRole(e.target.value);
                }}
              >
                <option value="">-- Select Role --</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
                <option value="admin">Admin</option>
              </select>

              {editUser.role === 'student' && (
                <>
                  <input
                    type="text"
                    name="roll_number"
                    placeholder="Roll Number"
                    value={editUser.roll_number}
                    onChange={handleUserInput}
                  />
                  <input
                    type="text"
                    name="class_name"
                    placeholder="Class"
                    value={editUser.class_name}
                    onChange={handleUserInput}
                  />
                  <input
                    type="email"
                    name="parent_email"
                    placeholder="Parent Email"
                    value={editUser.parent_email}
                    onChange={handleUserInput}
                  />
                  <input
                    type="number"
                    name="starting_year"
                    placeholder="Starting Year"
                    value={editUser.starting_year}
                    onChange={handleUserInput}
                  />
                  <input
                    type="number"
                    name="ending_year"
                    placeholder="Ending Year"
                    value={editUser.ending_year}
                    onChange={handleUserInput}
                  />
                </>
              )}

              {editUser.role === 'teacher' && (
                <>
                  <input
                    type="text"
                    name="teacher_id"
                    placeholder="Teacher ID"
                    value={editUser.teacher_id}
                    onChange={handleUserInput}
                  />
                  <input
                    type="text"
                    name="department"
                    placeholder="Department"
                    value={editUser.department}
                    onChange={handleUserInput}
                  />
                  <input
                    type="text"
                    name="assigned_classes"
                    placeholder="Assigned Classes"
                    value={editUser.assigned_classes}
                    onChange={handleUserInput}
                  />
                </>
              )}

              <div className="form-buttons">
                <button onClick={submitUser}>Update User</button>
                <button onClick={() => { setEditUser(null); resetUserForm(); }}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <select value={action} onChange={(e) => setAction(e.target.value)}>
                <option value="POST">Create</option>
                <option value="PUT">Update</option>
                <option value="DELETE">Delete</option>
              </select>

              {(action !== 'POST') && (
                <input
                  type="text"
                  name="id"
                  value={userForm.id}
                  onChange={handleUserInput}
                  placeholder="User ID"
                />
              )}

              {action !== 'DELETE' && (
                <>
                  <input
                    type="text"
                    name="name"
                    value={userForm.name}
                    onChange={handleUserInput}
                    placeholder="Name"
                  />
                  <input
                    type="email"
                    name="email"
                    value={userForm.email}
                    onChange={handleUserInput}
                    placeholder="Email"
                  />
                  <input
                    type="password"
                    name="password"
                    value={userForm.password}
                    onChange={handleUserInput}
                    placeholder="Password"
                  />
                  <select
                    name="role"
                    value={userForm.role}
                    onChange={handleUserInput}
                  >
                    <option value="">-- Select Role --</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                  </select>

                  {role === 'student' && (
                    <>
                      <input
                        type="text"
                        name="roll_number"
                        value={userForm.roll_number}
                        onChange={handleUserInput}
                        placeholder="Roll Number"
                      />
                      <input
                        type="text"
                        name="class_name"
                        value={userForm.class_name}
                        onChange={handleUserInput}
                        placeholder="Class"
                      />
                      <input
                        type="email"
                        name="parent_email"
                        value={userForm.parent_email}
                        onChange={handleUserInput}
                        placeholder="Parent Email"
                      />
                      <input
                        type="number"
                        name="starting_year"
                        value={userForm.starting_year}
                        onChange={handleUserInput}
                        placeholder="Starting Year"
                      />
                      <input
                        type="number"
                        name="ending_year"
                        value={userForm.ending_year}
                        onChange={handleUserInput}
                        placeholder="Ending Year"
                      />
                    </>
                  )}

                  {role === 'teacher' && (
                    <>
                      <input
                        type="text"
                        name="teacher_id"
                        value={userForm.teacher_id}
                        onChange={handleUserInput}
                        placeholder="Teacher ID"
                      />
                      <input
                        type="text"
                        name="department"
                        value={userForm.department}
                        onChange={handleUserInput}
                        placeholder="Department"
                      />
                      <input
                        type="text"
                        name="assigned_classes"
                        value={userForm.assigned_classes}
                        onChange={handleUserInput}
                        placeholder="Assigned Classes"
                      />
                    </>
                  )}
                  <div className="form-buttons">
                    <button onClick={submitUser}>{action} User</button>
                    <button onClick={resetUserForm}>Reset</button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'allUsers' && (
        <div className="all-users-section">
          <h2>All Users</h2>

          <div className="filter-container">
            <input
              type="text"
              placeholder="Filter by Name"
              value={userFilters.name}
              onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Filter by Email"
              value={userFilters.email}
              onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
            />
            <select
              value={userFilters.role}
              onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>

            {(userFilters.role === 'student' || userFilters.role === '') && (
              <>
                <input
                  type="number"
                  placeholder="Starting Year"
                  value={userFilters.starting_year}
                  onChange={(e) => setUserFilters({ ...userFilters, starting_year: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Ending Year"
                  value={userFilters.ending_year}
                  onChange={(e) => setUserFilters({ ...userFilters, ending_year: e.target.value })}
                />
              </>
            )}

            <button onClick={fetchUsers}>Filter</button>
          </div>

          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>

                {showStudentCols && (
                  <>
                    <th>Roll Number</th>
                    <th>Class</th>
                    <th>Parent Email</th>
                    <th>Starting Year</th>
                    <th>Ending Year</th>
                  </>
                )}

                {showTeacherCols && <th>Assigned Classes</th>}

                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3 + (showStudentCols ? 5 : 0) + (showTeacherCols ? 1 : 0)} style={{ textAlign: 'center' }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.user_id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>

                    {(user.role === 'student' && showStudentCols) && (
                      <>
                        <td>{user.roll_number}</td>
                        <td>{user.class_name}</td>
                        <td>{user.parent_email}</td>
                        <td>{user.starting_year}</td>
                        <td>{user.ending_year}</td>
                      </>
                    )}

                    {showTeacherCols && (
                      <td>{user.role === 'teacher' ? user.assigned_classes || '-' : '-'}</td>
                    )}

                    <td>
                      <button onClick={() => handleEdit(user)}>Edit</button>{' '}
                      <button onClick={() => handleDelete(user.user_id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="attendance-section">
          <h2>Filter Attendance</h2>

          <input
            type="text"
            placeholder="Roll Number"
            onChange={(e) => setAttendanceFilters(prev => ({ ...prev, roll_number: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Class"
            onChange={(e) => setAttendanceFilters(prev => ({ ...prev, class: e.target.value }))}
          />
          <input
            type="date"
            onChange={(e) => setAttendanceFilters(prev => ({ ...prev, from: e.target.value }))}
          />
          <input
            type="date"
            onChange={(e) => setAttendanceFilters(prev => ({ ...prev, to: e.target.value }))}
          />
          <button onClick={fetchAttendance}>Filter</button>

          <div className="attendance-table-container">
            <h4>Attendance Records:</h4>
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Roll Number</th>
                  <th>Status</th>
                  <th>Subject Code</th>
                  <th>Class</th>
                </tr>
              </thead>
              <tbody>
                {attendanceResults.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>No attendance records found.</td>
                  </tr>
                ) : (
                  attendanceResults.map((r) => (
                    <tr key={r.id}>
                      <td>{r.date}</td>
                      <td>{r.roll_number}</td>
                      <td>{r.status}</td>
                      <td>{r.subject_code}</td>
                      <td>{r.class}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

