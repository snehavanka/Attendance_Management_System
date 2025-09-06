import api from './api';
import { getToken } from './authService';

export const markAttendance = async (class_id, attendanceData) => {
  const token = getToken();
  const res = await api.post(
    '/teacher/mark-attendance',
    {
      class_id,
      attendance: attendanceData,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const editAttendance = async (student_id, date, new_status) => {
  const token = getToken();
  const res = await api.put(
    '/teacher/edit-attendance',
    {
      student_id,
      date,
      new_status,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const getClassAttendance = async (class_id, from, to) => {
  const token = getToken();
  const res = await api.get('/teacher/class-attendance', {
    params: { class_id, from, to },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
