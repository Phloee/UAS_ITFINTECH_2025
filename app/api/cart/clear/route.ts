// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/backend/models/Cart';
import { requireAuth, unauthorizedResponse } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
    try {
        const user = requireAuth(request);
        await connectDB();

        const cart = await Cart.findOne({ userId: user.id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }

        return NextResponse.json({
            message: 'Cart cleared',
            cart: cart || { items: [] }
        });
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return unauthorizedResponse();
        }
        console.error('Clear cart error:', error);
        return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
    }
}
