// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/backend/models/Product';
import { requireAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const product = await Product.findById(id);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check admin auth first
        const user = requireAdmin(request);
        console.log('Admin authenticated:', user.id);

        await connectDB();

        const { id } = await params;
        const body = await request.json();
        console.log('Update request for product:', id, body);

        const { name, description, price, stock } = body;

        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Build updates object
        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (price !== undefined) updates.price = parseFloat(price);
        if (stock !== undefined) updates.stock = parseInt(stock);

        console.log('Applying updates:', updates);

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        console.log('Product updated successfully');
        return NextResponse.json({
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (error: any) {
        console.error('Update product error:', error);

        if (error.message === 'Unauthorized') {
            return unauthorizedResponse();
        }
        if (error.message === 'Admin access required') {
            return forbiddenResponse();
        }

        return NextResponse.json({
            error: 'Failed to update product',
            details: error.message
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        requireAdmin(request);
        await connectDB();

        const { id } = await params;

        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        await Product.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        if (error.message === 'Unauthorized') {
            return unauthorizedResponse();
        }
        if (error.message === 'Admin access required') {
            return forbiddenResponse();
        }
        console.error('Delete product error:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
