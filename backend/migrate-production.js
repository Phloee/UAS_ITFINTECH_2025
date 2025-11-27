require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const User = require('./models/User');
const Product = require('./models/Product');

const connectDB = require('./config/database');

// Read JSON files
const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/products.json'), 'utf-8'));
const adminsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/admins.json'), 'utf-8'));

async function migrateProduction() {
    try {
        // Connect to MongoDB
        await connectDB();

        console.log('🔄 Starting PRODUCTION data migration...\n');
        console.log('⚠️  This will clear ALL existing data and start fresh!\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Product.deleteMany({});
        await mongoose.connection.collection('carts').deleteMany({});
        await mongoose.connection.collection('orders').deleteMany({});
        console.log('✅ Existing data cleared\n');

        // Migrate Admin
        console.log('👤 Creating admin account...');
        const admin = adminsData[0];
        await User.create({
            name: admin.username,
            email: admin.email,
            password: admin.password,
            birthdate: '1990-01-01',
            gender: 'other',
            phone: '000000000',
            isAdmin: true
        });
        console.log('   ✓ Admin: ' + admin.email);
        console.log('✅ Admin account created\n');

        // Migrate Products
        console.log('📦 Migrating products...');
        for (const product of productsData) {
            delete product.id;
            await Product.create(product);
            console.log('   ✓ Product: ' + product.name);
        }
        console.log('✅ Migrated ' + productsData.length + ' products\n');

        console.log('🎉 Production migration completed successfully!');
        console.log('\n📊 Summary:');

        const adminCount = await User.countDocuments({ isAdmin: true });
        const productCount = await Product.countDocuments();

        console.log('   - Admin accounts: ' + adminCount);
        console.log('   - Products: ' + productCount);
        console.log('   - Users: 0 (fresh start)');
        console.log('   - Orders: 0 (fresh start)');
        console.log('   - Carts: 0 (fresh start)');

        console.log('\n✅ Your database is ready for production!');
        console.log('🔑 Admin login: admin@scentfix.com / admin');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateProduction();
