import api from './api';
import { getToken } from './authService';

export const getFilteredAttendance = async (filters) => {
  const token = getToken();
  const res = await api.get('/admin/filter-attendance', {
    params: filters,
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getTeachers = async (filters) => {
  const token = getToken();
  const res = await api.get('/admin/teachers', {
    params: filters,
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateAttendance = async (student_id, date, new_status) => {
  const token = getToken();
  const res = await api.put('/admin/edit-attendance', {
    student_id,
    date,
    new_status,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const manageUser = async (userType, action, data) => {
  const token = getToken();
  const res = await api.post(`/admin/manage-${userType}`, {
    action,
    data,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
