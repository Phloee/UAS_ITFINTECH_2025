// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Cart from '@/backend/models/Cart';
import { requireAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = requireAuth(request);
        await connectDB();

        let cart = await Cart.findOne({ userId: user.id }).populate('items.productId');

        if (!cart) {
            // Create empty cart if doesn't exist
            cart = await Cart.create({ userId: user.id, items: [] });
        }

        // Filter out items with null productId (deleted products) and fix image paths
        if (cart.items) {
            cart.items = cart.items.filter(item => {
                if (!item.productId) return false;

                // Fix missing or invalid image paths
                if (!item.productId.image || item.productId.image === '/assets/products/placeholder.jpg') {
                    // Use default product image based on folder name or fallback
                    if (item.productId.folderName) {
                        item.productId.image = `/assets/products/${item.productId.folderName}/${item.productId.folderName}.png`;
                    } else {
                        // Set to null to handle on frontend
                        item.productId.image = null;
                    }
                }

                return true;
            });

            if (cart.isModified('items')) {
                await cart.save();
            }
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
