// @ts-nocheck
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { auth as authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { user, token } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            toast.success('Login successful!');
            return user;
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed');
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const { user, token } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            toast.success('Registration successful!');
            return user;
        } catch (error) {
            toast.error(error.response?.data?.error || 'Registration failed');
            throw error;
        }
    };

    const adminLogin = async (username, password) => {
        try {
            const response = await authAPI.adminLogin({ username, password });
            const { admin, token } = response.data;

            // Ensure isAdmin flag is set
            const adminUser = { ...admin, isAdmin: true };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(adminUser));
            setUser(adminUser);

            toast.success('Admin login successful!');
            return adminUser;
        } catch (error) {
            toast.error(error.response?.data?.error || 'Admin login failed');
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.success('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, adminLogin, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
