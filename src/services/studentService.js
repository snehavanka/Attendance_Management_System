import api from './api';
import { getToken } from './authService';

export const getStudentAttendance = async () => {
  const token = getToken();
  const res = await api.get('/student/attendance', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
