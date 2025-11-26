const express = require('express');
const db = require('../utils/db');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Get financial summary
router.get('/financial', authenticateAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let orders = await db.findAll('orders.json');

        // Filter paid orders only
        orders = orders.filter(order => order.paymentStatus === 'paid');

        // Filter by date range if provided
        if (startDate || endDate) {
            orders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                if (startDate && orderDate < new Date(startDate)) return false;
                if (endDate && orderDate > new Date(endDate)) return false;
                return true;
            });
        }

        // Calculate metrics
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalOrders = orders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Revenue by status
        const statusBreakdown = {
            'being processed': 0,
            'shipped': 0,
            'delivered': 0
        };

        orders.forEach(order => {
            if (statusBreakdown.hasOwnProperty(order.status)) {
                statusBreakdown[order.status] += order.totalAmount;
            }
        });

        res.json({
            totalRevenue,
            totalOrders,
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
        const orders = await db.findAll('orders.json');

        // Count by status
        const statusCounts = {
            pending: 0,
            'being processed': 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };

        orders.forEach(order => {
            if (statusCounts.hasOwnProperty(order.status)) {
                statusCounts[order.status]++;
            }
        });

        // Count by payment status
        const paymentStatusCounts = {
            pending: 0,
            paid: 0,
            failed: 0
        };

        orders.forEach(order => {
            if (paymentStatusCounts.hasOwnProperty(order.paymentStatus)) {
                paymentStatusCounts[order.paymentStatus]++;
            }
        });

        res.json({
            totalOrders: orders.length,
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
        const orders = await db.findAll('orders.json');
        const products = await db.findAll('products.json');

        // Count sales per product
        const productSales = {};

        orders
            .filter(order => order.paymentStatus === 'paid')
            .forEach(order => {
                order.items.forEach(item => {
                    if (!productSales[item.productId]) {
                        productSales[item.productId] = {
                            productId: item.productId,
                            name: item.name,
                            totalQuantity: 0,
                            totalRevenue: 0,
                            orderCount: 0
                        };
                    }

                    productSales[item.productId].totalQuantity += item.quantity;
                    productSales[item.productId].totalRevenue += item.price * item.quantity;
                    productSales[item.productId].orderCount++;
                });
            });

        // Convert to array and sort by revenue
        const productPerformance = Object.values(productSales).sort(
            (a, b) => b.totalRevenue - a.totalRevenue
        );

        // Get current stock info
        const enrichedPerformance = productPerformance.map(perf => {
            const product = products.find(p => p.id === perf.productId);
            return {
                ...perf,
                currentStock: product?.stock || 0
            };
        });

        // Map to add productName field for frontend
        const performanceWithNames = enrichedPerformance.map(item => ({
            ...item,
            productName: item.name,
            totalSold: item.totalQuantity
        }));

        res.json(performanceWithNames);
    } catch (error) {
        console.error('Product performance error:', error);
        res.status(500).json({ error: 'Failed to generate product performance report' });
    }
});

// Get chart data
router.get('/charts', authenticateAdmin, async (req, res) => {
    try {
        const { period = 'daily', days = 30 } = req.query;

        const orders = await db.findAll('orders.json');
        const paidOrders = orders.filter(order => order.paymentStatus === 'paid');

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Revenue by day
        const dailyRevenue = {};
        const dailyOrders = {};

        paidOrders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            if (orderDate >= startDate && orderDate <= endDate) {
                const dateKey = orderDate.toISOString().split('T')[0];

                if (!dailyRevenue[dateKey]) {
                    dailyRevenue[dateKey] = 0;
                    dailyOrders[dateKey] = 0;
                }

                dailyRevenue[dateKey] += order.totalAmount;
                dailyOrders[dateKey]++;
            }
        });

        // Create complete date range
        const revenueChart = [];
        const ordersChart = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dateKey = currentDate.toISOString().split('T')[0];

            revenueChart.push({
                date: dateKey,
                revenue: dailyRevenue[dateKey] || 0
            });

            ordersChart.push({
                date: dateKey,
                orders: dailyOrders[dateKey] || 0
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Status distribution for pie chart
        const statusDistribution = {
            'being processed': 0,
            'shipped': 0,
            'delivered': 0
        };

        paidOrders.forEach(order => {
            if (statusDistribution.hasOwnProperty(order.status)) {
                statusDistribution[order.status]++;
            }
        });

        // Format status distribution for pie chart
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
