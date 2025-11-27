// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/backend/models/Product';

export async function GET() {
    try {
        await connectDB();
        const products = await Product.find({}).sort({ createdAt: -1 });
        return NextResponse.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check admin auth
        const { requireAdmin } = require('@/lib/auth');
        requireAdmin(request);

        await connectDB();

        const formData = await request.formData();
        const name = formData.get('name');
        const description = formData.get('description');
        const price = formData.get('price');
        const stock = formData.get('stock');
        const folderName = formData.get('folderName');

        // Note: File upload to local filesystem doesn't work on Vercel
        // We'll use a placeholder or the folder-based path if provided
        let image = '/assets/products/placeholder.jpg';
        if (folderName) {
            image = `/assets/products/${folderName}/${folderName}.png`;
        }

        const product = await Product.create({
            name,
            description,
            price: parseFloat(price as string),
            stock: parseInt(stock as string),
            folderName,
            image
        });

        return NextResponse.json({
            message: 'Product created successfully',
            product
        }, { status: 201 });
    } catch (error: any) {
        console.error('Create product error:', error);
        if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
