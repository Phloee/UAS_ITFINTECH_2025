// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/backend/models/Order';
import { requireAdmin, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Check admin auth
        const adminCheck = await requireAdmin(request);
        if (adminCheck !== true) return adminCheck;

        await connectDB();

        // Count by status
        const statusCountsData = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusCounts: any = {
            pending: 0,
            'being processed': 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };

        statusCountsData.forEach((item: any) => {
            if (statusCounts.hasOwnProperty(item._id)) {
                statusCounts[item._id] = item.count;
            }
        });

        // Count by payment status
        const paymentStatusCountsData = await Order.aggregate([
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        const paymentStatusCounts: any = {
            pending: 0,
            paid: 0,
            failed: 0
        };

        paymentStatusCountsData.forEach((item: any) => {
            if (paymentStatusCounts.hasOwnProperty(item._id)) {
                paymentStatusCounts[item._id] = item.count;
            }
        });

        const totalOrders = await Order.countDocuments();

        return NextResponse.json({
            totalOrders,
            byStatus: statusCounts,
            byPaymentStatus: paymentStatusCounts
        });
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
            return unauthorizedResponse();
        }
        console.error('Order statistics error:', error);
        return NextResponse.json({ error: 'Failed to generate order statistics' }, { status: 500 });
    }
}
