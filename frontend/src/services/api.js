// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';
const api = axios.create({
    baseURL: API_URL,
});

// ⚡ THIS IS THE MISSING PART CAUSING 403 ERRORS
api.interceptors.request.use(config => {
    const tokens = localStorage.getItem('authTokens');
    if (tokens) {
        const parsed = JSON.parse(tokens);
        // Attach the token to the header
        config.headers.Authorization = `Bearer ${parsed.access}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;