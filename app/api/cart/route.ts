// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/backend/models/Cart';
import Product from '@/backend/models/Product';
import { requireAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = requireAuth(request);
        await connectDB();

        let cart = await Cart.findOne({ userId: user.id }).populate('items.productId');

        if (!cart) {
            cart = await Cart.create({ userId: user.id, items: [] });
        }

        return NextResponse.json(cart);
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return unauthorizedResponse();
        }
        console.error('Get cart error:', error);
        return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
    }
}
