const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');
const paymentService = require('../utils/payment');
const whatsappService = require('../utils/whatsapp');

const router = express.Router();

// Create order
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { shippingAddress } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Get user details
        const user = await User.findById(req.user.id);

        // Prepare order items with product details and check stock
        const orderItems = [];
        for (const item of cart.items) {
            if (!item.productId) {
                continue; // Skip items where product was deleted
            }

            const product = item.productId; // Populated product

            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for: ${product.name}` });
            }

            orderItems.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.image
            });
        }

        if (orderItems.length === 0) {
            return res.status(400).json({ error: 'No valid items in cart' });
        }

        // Calculate total
        const totalAmount = orderItems.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
        );

        // Generate order number
        const orderNumber = 'SF-' + Date.now();

        // Create order
        const order = await Order.create({
            userId: req.user.id,
            orderNumber,
            items: orderItems,
            totalAmount,
            shippingAddress: shippingAddress || user.address || '',
            status: 'pending',
            paymentStatus: 'pending'
        });

        res.status(201).json({
            message: 'Order created successfully',
            order
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: error.message || 'Failed to create order' });
    }
});

// Initiate payment for order
router.post('/:id/payment', authenticateToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ error: 'Order already paid' });
        }

        // Get user details
        const user = await User.findById(req.user.id);

        // Create Midtrans transaction
        // Note: paymentService needs to be compatible with Mongoose objects or plain objects
        const payment = await paymentService.createTransaction(order, user);

        // Update order with payment token
        order.paymentToken = payment.token;
        await order.save();

        res.json({
            message: 'Payment initiated',
            token: payment.token,
            redirectUrl: payment.redirectUrl
        });
    } catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
});

// Cancel order (user initiated)
router.post('/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ error: 'Cannot cancel non-pending order' });
        }

        order.status = 'cancelled';
        order.paymentStatus = 'cancelled';
        await order.save();

        res.json({
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
});


// Check payment status manually (for localhost development)
router.get('/:id/status', authenticateToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.userId.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // If already paid, just return status
        if (order.paymentStatus === 'paid') {
            return res.json({ status: order.status, paymentStatus: order.paymentStatus });
        }

        // Check status with Midtrans
        const statusResponse = await paymentService.getTransactionStatus(order.orderNumber);
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        let newStatus = order.status;
        let paymentStatus = order.paymentStatus;
        let statusChanged = false;

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'accept' || !fraudStatus) {
                paymentStatus = 'paid';
                newStatus = 'being processed';
                statusChanged = true;

                // Reduce product stock if not already done
                if (order.paymentStatus !== 'paid') {
                    for (const item of order.items) {
                        const product = await Product.findById(item.productId);
                        if (product) {
                            product.stock = Math.max(0, product.stock - item.quantity);
                            await product.save();
                        }
                    }

                    // Clear user's cart
                    await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });

                    // Send order confirmation WhatsApp notification
                    const user = await User.findById(order.userId);
                    if (user) {
                        try {
                            // Create a plain object for the updated order to pass to service
                            const updatedOrderObj = order.toObject();
                            updatedOrderObj.status = newStatus;
                            updatedOrderObj.paymentStatus = paymentStatus;

                            await whatsappService.sendOrderConfirmation(user, updatedOrderObj);
                            console.log('📱 Order confirmation sent to:', user.phone);
                        } catch (err) {
                            console.error('WhatsApp order confirmation error:', err);
                        }
                    }
                }
            }
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            paymentStatus = 'failed';
            newStatus = 'cancelled';
            statusChanged = true;
        }

        // Update order if status changed
        if (statusChanged || paymentStatus !== order.paymentStatus) {
            order.status = newStatus;
            order.paymentStatus = paymentStatus;
            order.transactionStatus = transactionStatus;
            order.fraudStatus = fraudStatus || null;
            await order.save();
        }

        res.json({ status: newStatus, paymentStatus });
    } catch (error) {
        console.error('Check status error:', error);
        // If transaction doesn't exist yet on Midtrans, it might throw 404
        if (error.response && error.response.status === 404) {
            return res.json({ status: 'pending', paymentStatus: 'pending' });
        }
        res.status(500).json({ error: 'Failed to check status' });
    }
});

// Midtrans payment notification webhook
router.post('/notification', async (req, res) => {
    try {
        const notification = req.body;

        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        // Find order by order number
        const order = await Order.findOne({ orderNumber: orderId });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update order status based on transaction status
        let newStatus = order.status;
        let paymentStatus = order.paymentStatus;
        let statusChanged = false;

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'accept' || !fraudStatus) {
                // Only process if not already paid to avoid double processing
                if (paymentStatus !== 'paid') {
                    paymentStatus = 'paid';
                    newStatus = 'being processed';
                    statusChanged = true;

                    // Reduce product stock
                    for (const item of order.items) {
                        const product = await Product.findById(item.productId);
                        if (product) {
                            product.stock = Math.max(0, product.stock - item.quantity);
                            await product.save();
                        }
                    }

                    // Clear user's cart
                    await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });

                    // Send WhatsApp confirmation
                    const user = await User.findById(order.userId);
                    if (user) {
                        try {
                            const updatedOrderObj = order.toObject();
                            updatedOrderObj.status = newStatus;
                            updatedOrderObj.paymentStatus = paymentStatus;

                            await whatsappService.sendOrderConfirmation(user, updatedOrderObj);
                        } catch (err) {
                            console.error('WhatsApp notification error:', err);
                        }
                    }
                }
            }
        } else if (transactionStatus === 'pending') {
            // Keep as pending
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            paymentStatus = 'failed';
            newStatus = 'cancelled';
            statusChanged = true;
        }

        if (statusChanged || paymentStatus !== order.paymentStatus) {
            order.status = newStatus;
            order.paymentStatus = paymentStatus;
            order.transactionStatus = transactionStatus;
            order.fraudStatus = fraudStatus || null;
            await order.save();
        }

        res.json({ message: 'Notification processed' });
    } catch (error) {
        console.error('Notification processing error:', error);
        res.status(500).json({ error: 'Failed to process notification' });
    }
});

// Get user orders
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get single order
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.userId.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json(order);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Get all orders (admin only)
router.get('/', authenticateAdmin, async (req, res) => {
    try {
        const orders = await Order.find({})
            .sort({ createdAt: -1 })
            .populate('userId', 'name email'); // Populate user details

        res.json(orders);
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Update order status (admin only)
router.put('/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ['pending', 'being processed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.status = status;
        await order.save();

        // Send WhatsApp notification for status update
        const user = await User.findById(order.userId);
        if (user && status !== 'pending' && status !== 'cancelled') {
            try {
                await whatsappService.sendOrderStatusUpdate(user, order, status);
            } catch (err) {
                console.error('WhatsApp notification error:', err);
            }
        }

        res.json({
            message: 'Order status updated',
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

module.exports = router;
