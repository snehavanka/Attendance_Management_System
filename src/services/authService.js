import api from './api';

export const login = async (email, password) => {
const res = await api.post('/login', { email, password });
if (res.data.token) {
localStorage.setItem('token', res.data.token);
}
return res.data;
};

export const logout = () => {
localStorage.removeItem('token');
};

export const getToken = () => localStorage.getItem('token');