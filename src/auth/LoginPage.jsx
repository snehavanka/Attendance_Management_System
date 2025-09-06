import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      const { token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem("role", role);

      if (role === "student") navigate("/student");
      else if (role === "teacher") navigate("/teacher");
      else if (role === "admin") navigate("/admin");
      else if (role === "parent") navigate("/parent");
    } catch (error) {
      alert("Invalid email or password");
    }
  };

  return (
    
    <div style={{
      backgroundImage: "url('/images/background.jpg')",
      backgroundSize: "cover",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "rgba(255, 255, 255, 0.9)",
        display: "flex",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        borderRadius: "10px",
        overflow: "hidden",
        width: "80%",
        maxWidth: "900px"
      }}>
        {/* Right side image */}
        <div style={{ flex: 1 }}>
          <img src="/images/login-side.png" alt="Side visual" style={{ width: "100%", height: "100%" }} />
        </div>

        {/* Login form */}
        <div style={{ flex: 1, padding: "40px" }}>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "20px" }}>
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: "10px" }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "10px" }}
              />
            </div>
            <button type="submit" style={{ padding: "10px 20px" }}>Login</button>
          </form>
          <div style={{ marginTop: "10px" }}>
            <a href="/forgot-password">Forgot Password?</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

