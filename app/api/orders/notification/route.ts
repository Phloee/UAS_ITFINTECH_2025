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
                            console.log('📱 Attempting to send WhatsApp notification to:', user.phone);

                            const axios = require('axios');
                            const updatedOrderObj = order.toObject();
                            updatedOrderObj.status = newStatus;
                            updatedOrderObj.paymentStatus = paymentStatus;

                            const message = `
*Payment Confirmed!* ✅

Hello ${user.name},
Your payment for order *${updatedOrderObj.orderNumber}* has been confirmed.

*Order Details:*
Total Amount: Rp ${updatedOrderObj.totalAmount.toLocaleString('id-ID')}
Status: ${newStatus}

We are processing your order now. You will receive another update when it ships.

Thank you for shopping with ScentFix!
                            `.trim();

                            const response = await axios.post('https://api.fonnte.com/send', {
                                target: user.phone,
                                message: message,
                                countryCode: '62' // Added countryCode as per working example
                            }, {
                                headers: {
                                    'Authorization': process.env.FONNTE_TOKEN
                                }
                            });

                            console.log('📱 WhatsApp API Response:', response.data);
                            console.log('✅ Payment confirmation sent successfully to:', user.phone);
                        } catch (err: any) {
                            console.error('❌ WhatsApp notification error:');
                            console.error('Error details:', err.response?.data || err.message);
                            console.error('User phone:', user.phone);
                            console.error('FONNTE_TOKEN present:', !!process.env.FONNTE_TOKEN);
                            // Don't fail the webhook if WhatsApp fails
                        }
                    } else {
                        console.error('❌ User not found for order:', order.userId);
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
