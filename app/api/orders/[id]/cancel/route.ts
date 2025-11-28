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
        const user = await requireAuth(request);
        await connectDB();

        const { id } = await params;
        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.userId.toString() !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (order.status !== 'pending') {
            return NextResponse.json({ error: 'Cannot cancel non-pending order' }, { status: 400 });
        }

        order.status = 'cancelled';
        order.paymentStatus = 'cancelled';
        await order.save();

        return NextResponse.json({
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return unauthorizedResponse();
        }
        console.error('Cancel order error:', error);
        return NextResponse.json({ error: error.message || 'Failed to cancel order' }, { status: 500 });
    }
}
