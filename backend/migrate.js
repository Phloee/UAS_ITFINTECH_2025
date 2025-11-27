require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

const connectDB = require('./config/database');

// Read JSON files
const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/users.json'), 'utf-8'));
const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf-8'));
const cartsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/carts.json'), 'utf-8'));
const ordersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/orders.json'), 'utf-8'));

async function migrateData() {
    try {
        // Connect to MongoDB
        await connectDB();

        console.log('🔄 Starting data migration...\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Product.deleteMany({});
        await Cart.deleteMany({});
        await Order.deleteMany({});
        console.log('✅ Existing data cleared\n');

        // Migrate Users
        console.log('👥 Migrating users...');
        const userIdMap = {}; // Map old IDs to new ObjectIds

        for (const user of usersData) {
            const oldId = user.id;
            delete user.id; // Remove old ID
            const newUser = await User.create(user);
            userIdMap[oldId] = newUser._id;
            console.log(`   ✓ User: ${user.email}`);
        }
        console.log(`✅ Migrated ${usersData.length} users\n`);

        // Migrate Products
        console.log('📦 Migrating products...');
        const productIdMap = {}; // Map old IDs to new ObjectIds

        for (const product of productsData) {
            const oldId = product.id;
            delete product.id; // Remove old ID
            const newProduct = await Product.create(product);
            productIdMap[oldId] = newProduct._id;
            console.log(`   ✓ Product: ${product.name}`);
        }
        console.log(`✅ Migrated ${productsData.length} products\n`);

        // Migrate Carts
        console.log('🛒 Migrating carts...');
        for (const cart of cartsData) {
            if (userIdMap[cart.userId]) {
                const mappedItems = cart.items.map(item => ({
                    productId: productIdMap[item.productId],
                    quantity: item.quantity
                }));

                await Cart.create({
                    userId: userIdMap[cart.userId],
                    items: mappedItems
                });
                console.log(`   ✓ Cart for user: ${cart.userId}`);
            }
        }
        console.log(`✅ Migrated ${cartsData.length} carts\n`);

        // Migrate Orders
        console.log('📋 Migrating orders...');
        for (const order of ordersData) {
            if (userIdMap[order.userId]) {
                const oldId = order.id;
                delete order.id; // Remove old ID

                // Map product IDs in order items
                const mappedItems = order.items.map(item => ({
                    ...item,
                    productId: productIdMap[item.productId] || item.productId
                }));

                await Order.create({
                    ...order,
                    userId: userIdMap[order.userId],
                    items: mappedItems
                });
                console.log(`   ✓ Order: ${oldId}`);
            }
        }
        console.log(`✅ Migrated ${ordersData.length} orders\n`);

        console.log('🎉 Migration completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Users: ${await User.countDocuments()}`);
        console.log(`   - Products: ${await Product.countDocuments()}`);
        console.log(`   - Carts: ${await Cart.countDocuments()}`);
        console.log(`   - Orders: ${await Order.countDocuments()}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateData();
