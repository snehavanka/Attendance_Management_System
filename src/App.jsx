import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './auth/LoginPage';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import StudentDashboard from './dashboards/StudentDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import ParentDashboard from './dashboards/ParentDashboard';
import ProtectedRoute from './auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* ✅ Public Routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* ✅ Protected Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parent"
        element={
          <ProtectedRoute role="parent">
            <ParentDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
