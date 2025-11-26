const bcrypt = require('bcryptjs');
const db = require('./utils/db');

async function initializeDatabase() {
    console.log('🔧 Initializing database...');

    try {
        // Initialize admin user
        const admins = await db.read('admins.json');
        if (admins.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.insert('admins.json', {
                username: 'admin',
                password: hashedPassword,
                email: 'admin@scentfix.com'
            });
            console.log('✅ Admin user created (username: admin, password: admin123)');
        }

        // Initialize sample products (3 variants)
        const products = await db.read('products.json');
        if (products.length === 0) {
            const sampleProducts = [
                {
                    name: 'ScentFix Classic',
                    description: 'Our classic shoe deodorant patch with fresh scent. Perfect for daily use and keeps your shoes smelling fresh all day long.',
                    price: 45000,
                    stock: 100,
                    image: '/assets/products/scentfix-classic/main.jpg',
                    folderName: 'scentfix-classic'
                },
                {
                    name: 'ScentFix Sport',
                    description: 'Extra strength formula designed for athletic shoes and active lifestyles. Long-lasting protection against odor.',
                    price: 55000,
                    stock: 80,
                    image: '/assets/products/scentfix-sport/main.jpg',
                    folderName: 'scentfix-sport'
                },
                {
                    name: 'ScentFix Premium',
                    description: 'Premium blend with essential oils for a luxurious scent experience. Our highest quality formula for discerning customers.',
                    price: 75000,
                    stock: 60,
                    image: '/assets/products/scentfix-premium/main.jpg',
                    folderName: 'scentfix-premium'
                }
            ];

            for (const product of sampleProducts) {
                product.id = db.generateId();
                product.createdAt = new Date().toISOString();
            }

            await db.write('products.json', sampleProducts);
            console.log('✅ Sample products created (3 variants)');
        }

        // Initialize empty collections if they don't exist
        await db.read('users.json');
        await db.read('carts.json');
        await db.read('orders.json');

        console.log('✅ Database initialization complete!');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
}

initializeDatabase();
