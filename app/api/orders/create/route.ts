// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/backend/models/Order';
import Cart from '@/backend/models/Cart';
import User from '@/backend/models/User';
import { requireAuth, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const user = requireAuth(request);
        await connectDB();

        const { shippingAddress } = await request.json();

        // Get user's cart
        const cart = await Cart.findOne({ userId: user.id }).populate('items.productId');

        if (!cart || !cart.items || cart.items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // Get user details
        const userDoc = await User.findById(user.id);

        // Prepare order items
        const orderItems = [];
        for (const item of cart.items) {
            if (!item.productId) continue;

            const product = item.productId;
            if (product.stock < item.quantity) {
                return NextResponse.json({ error: `Insufficient stock for: ${product.name}` }, { status: 400 });
            }

            orderItems.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.image
            });
        }

        if (orderItems.length === 0) {
            return NextResponse.json({ error: 'No valid items in cart' }, { status: 400 });
        }

        // Calculate total
        const totalAmount = orderItems.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
        );

        // Generate order number
        const orderNumber = 'SF-' + Date.now();

        // Create order
        const order = await Order.create({
            userId: user.id,
            orderNumber,
            items: orderItems,
            totalAmount,
            shippingAddress: shippingAddress || userDoc.address || '',
            status: 'pending',
            paymentStatus: 'pending'
        });

        return NextResponse.json({
            message: 'Order created successfully',
            order
        }, { status: 201 });
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return unauthorizedResponse();
        }
        console.error('Create order error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
