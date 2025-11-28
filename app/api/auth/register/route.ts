// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/backend/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';

async function sendWhatsAppWelcome(phone: string, name: string) {
    try {
        const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
        if (!FONNTE_TOKEN) {
            console.warn('FONNTE_TOKEN not configured');
            return;
        }

        const message = `Selamat datang ${name} di ScentFix! 🎉\n\nTerima kasih sudah mendaftar. Nikmati pengalaman berbelanja produk deodoran sepatu terbaik kami.`;

        await axios.post('https://api.fonnte.com/send', {
            target: phone,
            message: message,
            countryCode: '62'
        }, {
            headers: {
                'Authorization': FONNTE_TOKEN
            }
        });

        console.log('📱 WhatsApp sent to:', phone);
    } catch (error) {
        console.error('WhatsApp error:', error);
    }
}

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

        // Check if phone already exists
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return NextResponse.json({ error: 'Phone number already registered' }, { status: 400 });
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
        await sendWhatsAppWelcome(user.phone, user.name);

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
