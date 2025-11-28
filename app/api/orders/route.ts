// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/backend/models/Order';
import User from '@/backend/models/User';
import Product from '@/backend/models/Product';
import { requireAuth, requireAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = requireAuth(request);
        await connectDB();

        if (user.isAdmin) {
            // Admin: get all orders with user details
            // Note: items already contain product name, price, image from order creation
            const orders = await Order.find({})
                .sort({ createdAt: -1 })
                .populate('userId', 'name email phone');

            return NextResponse.json(orders);
        } else {
            // User: get own orders
            const orders = await Order.find({ userId: user.id })
                .sort({ createdAt: -1 });
            return NextResponse.json(orders);
        }
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return unauthorizedResponse();
        }
        console.error('Get orders error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        return NextResponse.json({
            error: 'Failed to fetch orders',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
