// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/backend/models/Order';
import Product from '@/backend/models/Product';
import Cart from '@/backend/models/Cart';
import User from '@/backend/models/User';
import { requireAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(
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

        // Check ownership (or admin)
        if (order.userId.toString() !== user.id && !user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Lazy Status Update: If pending, check Midtrans
        if (order.paymentStatus === 'pending' && order.orderNumber) {
            try {
                const paymentService = require('@/backend/utils/payment');
                const statusResponse = await paymentService.getTransactionStatus(order.orderNumber);

                if (statusResponse) {
                    const transactionStatus = statusResponse.transaction_status;
                    const fraudStatus = statusResponse.fraud_status;
                    let newStatus = order.status;
                    let paymentStatus = order.paymentStatus;
                    let statusChanged = false;

                    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
                        if (fraudStatus === 'accept' || !fraudStatus) {
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
                        }
                    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
                        paymentStatus = 'failed';
                        newStatus = 'cancelled';
                        statusChanged = true;
                    }

                    if (statusChanged) {
                        order.status = newStatus;
                        order.paymentStatus = paymentStatus;
                        order.transactionStatus = transactionStatus;
                        order.fraudStatus = fraudStatus || null;
                        await order.save();
                        console.log(`Order ${order.orderNumber} status updated via lazy check: ${paymentStatus}`);
                    }
                }
            } catch (midtransError) {
                console.error('Lazy status check failed:', midtransError.message);
                // Continue returning the order even if check fails
            }
        }

        return NextResponse.json(order);
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return unauthorizedResponse();
        }
        console.error('Get order error:', error);
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}
