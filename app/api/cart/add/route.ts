// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/backend/models/Cart';
import Product from '@/backend/models/Product';
import { requireAuth, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const user = requireAuth(request);
        await connectDB();

        const { productId, quantity = 1 } = await request.json();

        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        let cart = await Cart.findOne({ userId: user.id });
        if (!cart) {
            cart = await Cart.create({ userId: user.id, items: [] });
        }

        const existingItem = cart.items.find(
            (item) => item.productId.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        await cart.populate('items.productId');

        return NextResponse.json({
            message: 'Product added to cart',
            cart
        });
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return unauthorizedResponse();
        }
        console.error('Add to cart error:', error);
        return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
    }
}
