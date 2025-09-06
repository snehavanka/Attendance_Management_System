import React, { useState } from 'react';
import axios from '../services/api'; // Ensure correct axios instance
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);

      // Redirect based on role
      switch (res.data.role) {
        case 'admin': navigate('/admin'); break;
        case 'teacher': navigate('/teacher'); break;
        case 'student': navigate('/student'); break;
        case 'parent': navigate('/parent'); break;
        default: navigate('/');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Invalid email or password');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
        <button type="submit">Login</button>
      </form>

      <div style={{ marginTop: '10px' }}>
        <a href="/forgot-password">Forgot Password?</a>
      </div>
    </div>
  );
}

export default Login;
