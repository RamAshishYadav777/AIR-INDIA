import axios from 'axios';

const getBaseURL = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Safety check: Ensure URL doesn't have a trailing slash before adding /api
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    
    // Force the /api suffix if it's missing
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

console.log("✈️ FINAL Axios Base URL being used:", api.defaults.baseURL);

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
