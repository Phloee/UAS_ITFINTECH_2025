// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/backend/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { name, email, password, birthdate, gender, phone } = await request.json();

        // Validation
        if (!name || !email || !password || !birthdate || !gender || !phone) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            birthdate,
            gender,
            phone,
            isAdmin: false
        });

        // Send welcome WhatsApp message
        try {
            const whatsappService = require('@/backend/utils/whatsapp');
            await whatsappService.sendWelcomeMessage({
                phone: user.phone,
                name: user.name
            });
            console.log('📱 WhatsApp welcome message sent to:', user.phone);
        } catch (err: any) {
            console.error('❌ WhatsApp error:', err.message);
            // Don't fail registration if WhatsApp fails
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id.toString(), email: user.email, isAdmin: false },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        // Remove password from response
        const userObj = user.toObject();
        delete userObj.password;

        return NextResponse.json({
            message: 'Registration successful',
            user: userObj,
            token
        }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
