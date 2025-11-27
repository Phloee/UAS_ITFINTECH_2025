// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/backend/models/Cart';
import { requireAuth, unauthorizedResponse } from '@/lib/auth';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const user = requireAuth(request);
        await connectDB();

        const { productId } = await params;

        const cart = await Cart.findOne({ userId: user.id });
        if (!cart) {
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        cart.items = cart.items.filter(
            (item) => item.productId.toString() !== productId
        );

        await cart.save();
        await cart.populate('items.productId');

        return NextResponse.json({
            message: 'Item removed from cart',
            cart
        });
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return unauthorizedResponse();
        }
        console.error('Remove from cart error:', error);
        return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
    }
}
