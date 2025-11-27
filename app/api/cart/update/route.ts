// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/backend/models/Cart';
import { requireAuth, unauthorizedResponse } from '@/lib/auth';

export async function PUT(request: NextRequest) {
    try {
        const user = requireAuth(request);
        await connectDB();

        const { productId, quantity } = await request.json();

        const cart = await Cart.findOne({ userId: user.id });
        if (!cart) {
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        const item = cart.items.find(
            (item) => item.productId.toString() === productId
        );

        if (!item) {
            return NextResponse.json({ error: 'Item not in cart' }, { status: 404 });
        }

        item.quantity = quantity;
        await cart.save();
        await cart.populate('items.productId');

        return NextResponse.json({
            message: 'Cart updated',
            cart
        });
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return unauthorizedResponse();
        }
        console.error('Update cart error:', error);
        return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
    }
}
