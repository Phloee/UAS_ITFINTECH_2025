// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/backend/models/Order';
import { requireAdmin, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Check admin auth
        requireAdmin(request);

        await connectDB();

        const searchParams = request.nextUrl.searchParams;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build match query
        const matchQuery: any = { paymentStatus: 'paid' };

        if (startDate || endDate) {
            matchQuery.createdAt = {};
            if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
            if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
        }

        // Aggregate financial data
        const financialData = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        const result = financialData[0] || { totalRevenue: 0, totalOrders: 0 };
        const averageOrderValue = result.totalOrders > 0 ? result.totalRevenue / result.totalOrders : 0;

        // Revenue by status
        const statusBreakdownData = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$status',
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ]);

        const statusBreakdown: any = {
            'being processed': 0,
            'shipped': 0,
            'delivered': 0
        };

        statusBreakdownData.forEach((item: any) => {
            if (statusBreakdown.hasOwnProperty(item._id)) {
                statusBreakdown[item._id] = item.revenue;
            }
        });

        return NextResponse.json({
            totalRevenue: result.totalRevenue,
            totalOrders: result.totalOrders,
            averageOrderValue,
            statusBreakdown
        });
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
            return unauthorizedResponse();
        }
        console.error('Financial report error:', error);
        return NextResponse.json({ error: 'Failed to generate financial report' }, { status: 500 });
    }
}
