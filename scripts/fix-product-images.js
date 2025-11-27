// @ts-nocheck
// Run this once to fix all product images in MongoDB
// Usage: node scripts/fix-product-images.js

const mongoose = require('mongoose');
const Product = require('../backend/models/Product');
require('dotenv').config({ path: '.env.local' });

async function fixProductImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({});
        console.log(`Found ${products.length} products`);

        for (const product of products) {
            if (!product.image || product.image === '/assets/products/placeholder.jpg') {
                if (product.folderName) {
                    const newImage = `/assets/products/${product.folderName}/${product.folderName}.png`;
                    product.image = newImage;
                    await product.save();
                    console.log(`✅ Fixed ${product.name}: ${newImage}`);
                } else {
                    console.log(`⚠️  ${product.name} has no folderName`);
                }
            } else {
                console.log(`✓ ${product.name} already has valid image`);
            }
        }

        console.log('\n✅ All products fixed!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixProductImages();
