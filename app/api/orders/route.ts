// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/backend/models/Order';
import { requireAuth, requireAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = requireAuth(request);
        await connectDB();

        if (user.isAdmin) {
            // Admin: get all orders with user and product details
            const orders = await Order.find({})
                .sort({ createdAt: -1 })
                .populate('userId', 'name email phone')
                .populate({
                    path: 'items.productId',
                    select: 'name price image'
                })
                .lean(); // Use lean() for better performance with populated data

            return NextResponse.json(orders);
        } else {
            // User: get own orders with product details
            const orders = await Order.find({ userId: user.id })
                .sort({ createdAt: -1 })
                .populate({
                    path: 'items.productId',
                    select: 'name price image'
                })
                .lean();
            return NextResponse.json(orders);
        }
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return unauthorizedResponse();
        }
        console.error('Get orders error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
