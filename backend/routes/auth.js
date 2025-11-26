const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/db');

const router = express.Router();

// Customer Registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, birthdate, gender, phone } = req.body;

        // Validation
        if (!name || !email || !password || !birthdate || !gender || !phone) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if email already exists
        const existingUser = await db.findOne('users.json', { email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await db.insert('users.json', {
            name,
            email,
            password: hashedPassword,
            birthdate,
            gender,
            phone,
            isAdmin: false
        });

        // Remove password from response
        delete user.password;

        // Send welcome WhatsApp message
        const whatsappService = require('../utils/whatsapp');
        console.log('📱 Attempting to send welcome WhatsApp message...');
        console.log('📱 User phone:', user.phone);
        console.log('📱 User name:', user.name);
        try {
            const whatsappResult = await whatsappService.sendWelcomeMessage(user);
            console.log('📱 WhatsApp message sent successfully:', whatsappResult);
        } catch (err) {
            console.error('❌ WhatsApp welcome message error:', err.message);
            console.error('❌ Full error:', err);
            // Don't fail registration if WhatsApp fails
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, isAdmin: false },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            user,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Customer Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await db.findOne('users.json', { email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, isAdmin: user.isAdmin || false },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Remove password from response
        delete user.password;

        res.json({
            message: 'Login successful',
            user,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find admin
        const admin = await db.findOne('admins.json', { username });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin.id, username: admin.username, isAdmin: true },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Remove password from response
        delete admin.password;

        res.json({
            message: 'Admin login successful',
            admin,
            token
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
