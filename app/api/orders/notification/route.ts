// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/backend/models/Order';
import Product from '@/backend/models/Product';
import Cart from '@/backend/models/Cart';
import User from '@/backend/models/User';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const notification = await request.json();
        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        // Find order by order number
        const order = await Order.findOne({ orderNumber: orderId });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Update order status based on transaction status
        let newStatus = order.status;
        let paymentStatus = order.paymentStatus;
        let statusChanged = false;

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'accept' || !fraudStatus) {
                // Only process if not already paid
                if (paymentStatus !== 'paid') {
                    paymentStatus = 'paid';
                    newStatus = 'being processed';
                    statusChanged = true;

                    // Reduce product stock
                    for (const item of order.items) {
                        const product = await Product.findById(item.productId);
                        if (product) {
                            product.stock = Math.max(0, product.stock - item.quantity);
                            await product.save();
                        }
                    }

                    // Clear user's cart
                    await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });

                    // Send WhatsApp confirmation
                    const user = await User.findById(order.userId);
                    if (user) {
                        try {
                            const whatsappService = require('@/backend/utils/whatsapp');
                            const updatedOrderObj = order.toObject();
                            updatedOrderObj.status = newStatus;
                            updatedOrderObj.paymentStatus = paymentStatus;

                            await whatsappService.sendOrderConfirmation(user, updatedOrderObj);
                            console.log('📱 Payment confirmation sent to:', user.phone);
                        } catch (err) {
                            console.error('WhatsApp notification error:', err);
                        }
                    }
                }
            }
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            paymentStatus = 'failed';
            newStatus = 'cancelled';
            statusChanged = true;
        }

        if (statusChanged || paymentStatus !== order.paymentStatus) {
            order.status = newStatus;
            order.paymentStatus = paymentStatus;
            order.transactionStatus = transactionStatus;
            order.fraudStatus = fraudStatus || null;
            await order.save();
        }

        return NextResponse.json({ message: 'Notification processed' });
    } catch (error) {
        console.error('Notification processing error:', error);
        return NextResponse.json({ error: 'Failed to process notification' }, { status: 500 });
    }
}
