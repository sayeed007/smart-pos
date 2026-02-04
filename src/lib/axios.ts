
import axios from 'axios';

// Create a single axios instance
export const api = axios.create({
    baseURL: '/api', // Proxy to Next.js API routes
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: Attach auth token
api.interceptors.request.use(
    (config) => {
        // In a real app, get from cookies/storage
        // For now, we simulate by checking localStorage user
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('aura_user');
            if (storedUser) {
                // Mock token logic - usually token is separate
                const user = JSON.parse(storedUser);
                config.headers.Authorization = `Bearer mock-token-${user.id}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized (redirect to login)
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
