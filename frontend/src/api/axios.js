import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        } else if (error.response?.status === 403) {
            // Handle forbidden (admin role spoofing check)
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role === 'admin') {
                user.role = 'user';
                localStorage.setItem('user', JSON.stringify(user));
            }
            alert('Akses Ditolak: Anda tidak memiliki wewenang untuk melihat data ini.');
            window.location.href = '/dashboard';
        }
        return Promise.reject(error);
    }
);

export default api;
