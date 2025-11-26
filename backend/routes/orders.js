const express = require('express');
const db = require('../utils/db');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');
const paymentService = require('../utils/payment');
const whatsappService = require('../utils/whatsapp');

const router = express.Router();

// Create order
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { shippingAddress } = req.body;

        // Get user's cart
        const cart = await db.findOne('carts.json', { userId: req.user.id });

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Get user details
        const user = await db.findById('users.json', req.user.id);

        // Prepare order items with product details
        const orderItems = await Promise.all(
            cart.items.map(async (item) => {
                const product = await db.findById('products.json', item.productId);

                if (!product) {
                    throw new Error(`Product not found: ${item.productId}`);
                }

                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for: ${product.name}`);
                }

                return {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    image: product.image
                };
            })
        );

        // Calculate total
        const totalAmount = orderItems.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
        );

        // Generate order number
        const orderNumber = 'SF-' + Date.now();

        // Create order
        const order = await db.insert('orders.json', {
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
        const order = await db.findById('orders.json', req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.userId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ error: 'Order already paid' });
        }

        // Get user details
        const user = await db.findById('users.json', req.user.id);

        // Create Midtrans transaction
        const payment = await paymentService.createTransaction(order, user);

        // Update order with payment token
        await db.update('orders.json', order.id, {
            paymentToken: payment.token
        });

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


// Check payment status manually (for localhost development)
router.get('/:id/status', authenticateToken, async (req, res) => {
    try {
        const order = await db.findById('orders.json', req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.userId !== req.user.id && !req.user.isAdmin) {
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

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'accept' || !fraudStatus) {
                paymentStatus = 'paid';
                newStatus = 'being processed';

                // Reduce product stock if not already done
                if (order.paymentStatus !== 'paid') {
                    for (const item of order.items) {
                        const product = await db.findById('products.json', item.productId);
                        if (product) {
                            await db.update('products.json', item.productId, {
                                stock: product.stock - item.quantity
                            });
                        }
                    }

                    // Clear user's cart
                    const cart = await db.findOne('carts.json', { userId: order.userId });
                    if (cart) {
                        await db.update('carts.json', cart.id, { items: [] });
                    }

                    // Send order confirmation WhatsApp notification
                    const user = await db.findById('users.json', order.userId);
                    if (user) {
                        try {
                            const updatedOrder = { ...order, status: newStatus, paymentStatus };
                            await whatsappService.sendOrderConfirmation(user, updatedOrder);
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
        }

        // Update order if status changed
        if (paymentStatus !== order.paymentStatus) {
            await db.update('orders.json', order.id, {
                status: newStatus,
                paymentStatus,
                transactionStatus,
                fraudStatus: fraudStatus || null
            });
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
        const orders = await db.findAll('orders.json');
        const order = orders.find(o => o.orderNumber === orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update order status based on transaction status
        let newStatus = order.status;
        let paymentStatus = order.paymentStatus;

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'accept' || !fraudStatus) {
                paymentStatus = 'paid';
                newStatus = 'being processed';

                // Reduce product stock
                for (const item of order.items) {
                    const product = await db.findById('products.json', item.productId);
                    if (product) {
                        await db.update('products.json', item.productId, {
                            stock: product.stock - item.quantity
                        });
                    }
                }

                // Clear user's cart
                const cart = await db.findOne('carts.json', { userId: order.userId });
                if (cart) {
                    await db.update('carts.json', cart.id, { items: [] });
                }

                // Send WhatsApp confirmation
                const user = await db.findById('users.json', order.userId);
                if (user) {
                    try {
                        await whatsappService.sendOrderConfirmation(user, order);
                    } catch (err) {
                        console.error('WhatsApp notification error:', err);
                    }
                }
            }
        } else if (transactionStatus === 'pending') {
            paymentStatus = 'pending';
            newStatus = 'pending';
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            paymentStatus = 'failed';
            newStatus = 'cancelled';
        }

        await db.update('orders.json', order.id, {
            status: newStatus,
            paymentStatus,
            transactionStatus,
            fraudStatus: fraudStatus || null
        });

        res.json({ message: 'Notification processed' });
    } catch (error) {
        console.error('Notification processing error:', error);
        res.status(500).json({ error: 'Failed to process notification' });
    }
});

// Get user orders
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const orders = await db.findAll('orders.json', { userId: req.user.id });

        // Sort by creation date (newest first)
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(orders);
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get single order
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const order = await db.findById('orders.json', req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.userId !== req.user.id && !req.user.isAdmin) {
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
        const orders = await db.findAll('orders.json');

        // Sort by creation date (newest first)
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

        const order = await db.findById('orders.json', req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const updatedOrder = await db.update('orders.json', req.params.id, { status });

        // Send WhatsApp notification for status update
        const user = await db.findById('users.json', order.userId);
        if (user && status !== 'pending' && status !== 'cancelled') {
            try {
                await whatsappService.sendOrderStatusUpdate(user, updatedOrder, status);
            } catch (err) {
                console.error('WhatsApp notification error:', err);
            }
        }

        res.json({
            message: 'Order status updated',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

module.exports = router;
