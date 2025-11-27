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
        const days = parseInt(searchParams.get('days') || '30');

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Revenue by day aggregation
        const dailyData = await Order.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            }
        ]);

        // Convert to map for easy lookup
        const dailyMap: any = {};
        dailyData.forEach((item: any) => {
            dailyMap[item._id] = item;
        });

        // Create complete date range
        const revenueChart = [];
        const ordersChart = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dateKey = currentDate.toISOString().split('T')[0];
            const data = dailyMap[dateKey] || { revenue: 0, orders: 0 };

            revenueChart.push({
                date: dateKey,
                revenue: data.revenue
            });

            ordersChart.push({
                date: dateKey,
                orders: data.orders
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Status distribution for pie chart
        const statusDistributionData = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusDistribution: any = {
            'being processed': 0,
            'shipped': 0,
            'delivered': 0
        };

        statusDistributionData.forEach((item: any) => {
            if (statusDistribution.hasOwnProperty(item._id)) {
                statusDistribution[item._id] = item.count;
            }
        });

        const formattedDistribution = Object.entries(statusDistribution).map(([status, count]) => ({
            status,
            count
        }));

        return NextResponse.json({
            revenueOverTime: revenueChart,
            ordersOverTime: ordersChart,
            statusDistribution: formattedDistribution
        });
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
            return unauthorizedResponse();
        }
        console.error('Chart data error:', error);
        return NextResponse.json({ error: 'Failed to generate chart data' }, { status: 500 });
    }
}
