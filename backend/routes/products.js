const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Product = require('../models/Product');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const productName = req.body.name || 'temp';
        const folderName = productName.toLowerCase().replace(/\s+/g, '-');
        const uploadPath = path.join(__dirname, '../../public/assets/products', folderName);

        try {
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `main${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Get all products (public)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Add product (admin only)
router.post('/', authenticateAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;

        if (!name || !description || !price || !stock) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const folderName = name.toLowerCase().replace(/\s+/g, '-');
        const imagePath = req.file
            ? `/assets/products/${folderName}/main${path.extname(req.file.originalname)}`
            : null;

        const product = await Product.create({
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            image: imagePath,
            folderName
        });

        res.status(201).json({
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product (admin only)
router.put('/:id', authenticateAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const updates = {
            name: name || product.name,
            description: description || product.description,
            price: price ? parseFloat(price) : product.price,
            stock: stock ? parseInt(stock) : product.stock
        };

        // Handle new image upload
        if (req.file) {
            const folderName = updates.name.toLowerCase().replace(/\s+/g, '-');
            updates.image = `/assets/products/${folderName}/main${path.extname(req.file.originalname)}`;
            updates.folderName = folderName;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        res.json({
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Delete product folder
        if (product.folderName) {
            const folderPath = path.join(__dirname, '../../public/assets/products', product.folderName);
            try {
                await fs.rm(folderPath, { recursive: true, force: true });
            } catch (err) {
                console.error('Error deleting product folder:', err);
            }
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

module.exports = router;
