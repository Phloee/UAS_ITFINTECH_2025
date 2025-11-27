// @ts-nocheck
import axios from 'axios';

// Use Next.js API routes in production, Express backend in development
const API_URL = typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
    ? '/api'  // Production: Next.js API routes (same domain)
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'; // Development: Express backend

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const auth = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    adminLogin: (data) => api.post('/auth/admin/login', data)
};

// Products API
export const products = {
    getAll: () => api.get('/products'),
    getById: (id) => api.get(`/products/${id}`),
    create: (formData) => api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/products/${id}`)
};

// Cart API
export const cart = {
    get: () => api.get('/cart'),
    add: (data) => api.post('/cart/add', data),
    update: (data) => api.put('/cart/update', data),
    remove: (productId) => api.delete(`/cart/remove/${productId}`),
    clear: () => api.delete('/cart/clear')
};

// Orders API
export const orders = {
    create: (data) => api.post('/orders/create', data),
    initiatePayment: (orderId) => api.post(`/orders/${orderId}/payment`),
    getUserOrders: () => api.get('/orders/user'),
    getById: (id) => api.get(`/orders/${id}`),
    getAll: () => api.get('/orders'),
    updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status })
};

// Reports API
export const reports = {
    getFinancial: (params) => api.get('/reports/financial', { params }),
    getOrderStats: () => api.get('/reports/orders'),
    getProductPerformance: () => api.get('/reports/products'),
    getChartData: (params) => api.get('/reports/charts', { params })
};

export default api;
