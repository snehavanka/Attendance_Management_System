import React, { useState } from 'react';
import axios from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/forgot-password', { email });
      setMessage(res.data.msg || "Reset link sent to your email");
    } catch (err) {
      setMessage(err.response?.data?.msg || "Failed to send reset email");
    }
  };

  return (
    <div
      style={{
        backgroundImage: "url('/images/background.jpg')",
        backgroundSize: "cover",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.9)",
          display: "flex",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          borderRadius: "10px",
          overflow: "hidden",
          width: "80%",
          maxWidth: "900px"
        }}
      >
        {/* Right side image */}
        <div style={{ flex: 1 }}>
          <img
            src="/images/login-side.png"
            alt="Side visual"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Forgot Password form */}
        <div style={{ flex: 1, padding: "40px" }}>
          <h2>Forgot Password</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: "10px" }}
              />
            </div>
            <button type="submit" style={{ padding: "10px 20px" }}>
              Send Reset Link
            </button>
          </form>
          {message && (
            <p style={{ marginTop: "15px", color: "green" }}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;


