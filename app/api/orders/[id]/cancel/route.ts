// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/backend/models/Order';
import { requireAuth, unauthorizedResponse } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        console.log('[Cancel] Starting cancel order request');

        const user = await requireAuth(request);
        console.log('[Cancel] User authenticated:', user.id);

        await connectDB();
        console.log('[Cancel] Database connected');

        const { id } = await params;
        console.log('[Cancel] Order ID:', id);

        const order = await Order.findById(id);
        console.log('[Cancel] Order found:', order ? 'Yes' : 'No');

        if (!order) {
            console.log('[Cancel] Order not found');
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        console.log('[Cancel] Order status:', order.status, 'Payment status:', order.paymentStatus);
        console.log('[Cancel] Order userId:', order.userId.toString(), 'Request userId:', user.id);

        if (order.userId.toString() !== user.id) {
            console.log('[Cancel] Unauthorized - user mismatch');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (order.status !== 'pending') {
            console.log('[Cancel] Cannot cancel - order status is:', order.status);
            return NextResponse.json({ error: 'Cannot cancel non-pending order' }, { status: 400 });
        }

        order.status = 'cancelled';
        order.paymentStatus = 'cancelled';
        console.log('[Cancel] Updating order to cancelled');

        await order.save();
        console.log('[Cancel] Order saved successfully');

        return NextResponse.json({
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        console.error('[Cancel] Error occurred:', error);
        console.error('[Cancel] Error message:', error.message);
        console.error('[Cancel] Error stack:', error.stack);

        if (error.message === 'Unauthorized') {
            return unauthorizedResponse();
        }
        return NextResponse.json({
            error: error.message || 'Failed to cancel order',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
