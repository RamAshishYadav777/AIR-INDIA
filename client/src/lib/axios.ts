import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Log the final base URL being used
console.log("✈️ Axios Base URL:", api.defaults.baseURL);

// Self-healing: if the URL doesn't end with /api, we handle it in the request
api.interceptors.request.use(
    (config) => {
        // Fix potential trailing slashes or missing /api
        if (config.baseURL && !config.baseURL.endsWith('/api') && !config.url?.startsWith('/api')) {
             // If baseURL is just the domain, we might need to be careful.
             // But for this project, /api is the standard.
        }

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
