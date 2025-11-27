const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Get financial summary
router.get('/financial', authenticateAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Build match query
        const matchQuery = { paymentStatus: 'paid' };

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

        const statusBreakdown = {
            'being processed': 0,
            'shipped': 0,
            'delivered': 0
        };

        statusBreakdownData.forEach(item => {
            if (statusBreakdown.hasOwnProperty(item._id)) {
                statusBreakdown[item._id] = item.revenue;
            }
        });

        res.json({
            totalRevenue: result.totalRevenue,
            totalOrders: result.totalOrders,
            averageOrderValue,
            statusBreakdown
        });
    } catch (error) {
        console.error('Financial report error:', error);
        res.status(500).json({ error: 'Failed to generate financial report' });
    }
});

// Get order statistics
router.get('/orders', authenticateAdmin, async (req, res) => {
    try {
        // Count by status
        const statusCountsData = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusCounts = {
            pending: 0,
            'being processed': 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };

        statusCountsData.forEach(item => {
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

        const paymentStatusCounts = {
            pending: 0,
            paid: 0,
            failed: 0
        };

        paymentStatusCountsData.forEach(item => {
            if (paymentStatusCounts.hasOwnProperty(item._id)) {
                paymentStatusCounts[item._id] = item.count;
            }
        });

        const totalOrders = await Order.countDocuments();

        res.json({
            totalOrders,
            byStatus: statusCounts,
            byPaymentStatus: paymentStatusCounts
        });
    } catch (error) {
        console.error('Order statistics error:', error);
        res.status(500).json({ error: 'Failed to generate order statistics' });
    }
});

// Get product performance
router.get('/products', authenticateAdmin, async (req, res) => {
    try {
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
        const enrichedPerformance = await Promise.all(productPerformance.map(async (perf) => {
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

        res.json(enrichedPerformance);
    } catch (error) {
        console.error('Product performance error:', error);
        res.status(500).json({ error: 'Failed to generate product performance report' });
    }
});

// Get chart data
router.get('/charts', authenticateAdmin, async (req, res) => {
    try {
        const { period = 'daily', days = 30 } = req.query;

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

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
        const dailyMap = {};
        dailyData.forEach(item => {
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

        const statusDistribution = {
            'being processed': 0,
            'shipped': 0,
            'delivered': 0
        };

        statusDistributionData.forEach(item => {
            if (statusDistribution.hasOwnProperty(item._id)) {
                statusDistribution[item._id] = item.count;
            }
        });

        const formattedDistribution = Object.entries(statusDistribution).map(([status, count]) => ({
            status,
            count
        }));

        res.json({
            revenueOverTime: revenueChart,
            ordersOverTime: ordersChart,
            statusDistribution: formattedDistribution
        });
    } catch (error) {
        console.error('Chart data error:', error);
        res.status(500).json({ error: 'Failed to generate chart data' });
    }
});

module.exports = router;
