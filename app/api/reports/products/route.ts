// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/backend/models/Order';
import Product from '@/backend/models/Product';
import { requireAdmin, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Check admin auth
        requireAdmin(request);

        await connectDB();

        // Aggregate product sales from paid orders
        const productPerformance = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    name: { $first: '$items.name' },
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        // Get current stock info
        const enrichedPerformance = await Promise.all(productPerformance.map(async (perf: any) => {
            const product = await Product.findById(perf._id);
            return {
                productId: perf._id,
                name: perf.name,
                totalQuantity: perf.totalQuantity,
                totalRevenue: perf.totalRevenue,
                orderCount: perf.orderCount,
                currentStock: product?.stock || 0,
                productName: perf.name,
                totalSold: perf.totalQuantity
            };
        }));

        return NextResponse.json(enrichedPerformance);
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
            return unauthorizedResponse();
        }
        console.error('Product performance error:', error);
        return NextResponse.json({ error: 'Failed to generate product performance report' }, { status: 500 });
    }
}
