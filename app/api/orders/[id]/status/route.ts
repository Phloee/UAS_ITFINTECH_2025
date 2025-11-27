// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/backend/models/Order';
import User from '@/backend/models/User';
import { requireAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        requireAdmin(request);
        await connectDB();

        const { id } = await params;
        const { status } = await request.json();

        const validStatuses = ['pending', 'being processed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        order.status = status;
        await order.save();

        // Send WhatsApp notification for status update
        const user = await User.findById(order.userId);
        if (user && status !== 'pending' && status !== 'cancelled') {
            try {
                const whatsappService = require('@/backend/utils/whatsapp');
                await whatsappService.sendOrderStatusUpdate(user, order, status);
                console.log('📱 Status update notification sent to:', user.phone);
            } catch (err) {
                console.error('WhatsApp notification error:', err);
            }
        }

        return NextResponse.json({
            message: 'Order status updated',
            order
        });
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return unauthorizedResponse();
        }
        if (error.message === 'Admin access required') {
            return forbiddenResponse();
        }
        console.error('Update order status error:', error);
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }
}
