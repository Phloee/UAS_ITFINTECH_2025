// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/backend/models/Order';
import User from '@/backend/models/User';
import { requireAuth, unauthorizedResponse } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = requireAuth(request);
        await connectDB();

        const { id } = await params;
        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.userId.toString() !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (order.paymentStatus === 'paid') {
            return NextResponse.json({ error: 'Order already paid' }, { status: 400 });
        }

        // Get user details
        const userDoc = await User.findById(user.id);

        // Create Midtrans transaction
        const paymentService = require('@/backend/utils/payment');
        const payment = await paymentService.createTransaction(order, userDoc);

        // Update order with payment token
        order.paymentToken = payment.token;
        await order.save();

        return NextResponse.json({
            message: 'Payment initiated',
            token: payment.token,
            redirectUrl: payment.redirectUrl
        });
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return unauthorizedResponse();
        }
        console.error('Payment initiation error:', error);
        return NextResponse.json({ error: error.message || 'Failed to initiate payment' }, { status: 500 });
    }
}
