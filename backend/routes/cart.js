const express = require('express');
const db = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
    try {
        const cart = await db.findOne('carts.json', { userId: req.user.id });

        if (!cart) {
            return res.json({ items: [], totalAmount: 0 });
        }

        // Enrich cart with product details
        const enrichedItems = await Promise.all(
            cart.items.map(async (item) => {
                const product = await db.findById('products.json', item.productId);
                return {
                    ...item,
                    productName: product?.name,
                    productImage: product?.image,
                    productPrice: product?.price
                };
            })
        );

        const totalAmount = enrichedItems.reduce(
            (sum, item) => sum + (item.productPrice * item.quantity),
            0
        );

        res.json({ items: enrichedItems, totalAmount });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        // Verify product exists and has stock
        const product = await db.findById('products.json', productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        // Find or create cart
        let cart = await db.findOne('carts.json', { userId: req.user.id });

        if (!cart) {
            cart = await db.insert('carts.json', {
                userId: req.user.id,
                items: []
            });
        }

        // Check if product already in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.productId === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                productId,
                quantity,
                addedAt: new Date().toISOString()
            });
        }

        const updatedCart = await db.update('carts.json', cart.id, { items: cart.items });

        res.json({
            message: 'Item added to cart',
            cart: updatedCart
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
});

// Update item quantity
router.put('/update', authenticateToken, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({ error: 'Product ID and quantity are required' });
        }

        if (quantity < 0) {
            return res.status(400).json({ error: 'Quantity cannot be negative' });
        }

        const cart = await db.findOne('carts.json', { userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Verify product stock
        const product = await db.findById('products.json', productId);
        if (product && quantity > product.stock) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        // Update quantity or remove if 0
        if (quantity === 0) {
            cart.items = cart.items.filter(item => item.productId !== productId);
        } else {
            const itemIndex = cart.items.findIndex(item => item.productId === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity = quantity;
            }
        }

        const updatedCart = await db.update('carts.json', cart.id, { items: cart.items });

        res.json({
            message: 'Cart updated',
            cart: updatedCart
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

// Remove item from cart
router.delete('/remove/:productId', authenticateToken, async (req, res) => {
    try {
        const cart = await db.findOne('carts.json', { userId: req.user.id });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.productId !== req.params.productId);
        const updatedCart = await db.update('carts.json', cart.id, { items: cart.items });

        res.json({
            message: 'Item removed from cart',
            cart: updatedCart
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
});

// Clear cart
router.delete('/clear', authenticateToken, async (req, res) => {
    try {
        const cart = await db.findOne('carts.json', { userId: req.user.id });

        if (cart) {
            await db.update('carts.json', cart.id, { items: [] });
        }

        res.json({ message: 'Cart cleared' });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

module.exports = router;
