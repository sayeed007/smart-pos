import axios from 'axios';
import { clearStoredAuth, getStoredAuth } from '@/lib/auth-storage';
import { BACKEND_API_URL } from '@/config/backend-api';

// Legacy/mock API client used by existing Next.js route handlers.
export const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Backend API client (NestJS server).
export const backendApi = axios.create({
    baseURL: BACKEND_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for legacy/mock client.
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('aura_user');
            if (storedUser) {
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

backendApi.interceptors.request.use(
    (config) => {
        const auth = getStoredAuth();
        if (auth.accessToken) {
            config.headers.Authorization = `Bearer ${auth.accessToken}`;
        }
        if (auth.tenantId) {
            config.headers['X-Tenant-ID'] = auth.tenantId;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Global error handling for both clients.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

backendApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            clearStoredAuth();
            localStorage.removeItem('aura_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
