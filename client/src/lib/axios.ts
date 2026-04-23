import axios from 'axios';

const getBaseURL = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    
    if (!url.endsWith('/api')) {
        url += '/api';
    }
    
    return url;
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
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

export default api;
