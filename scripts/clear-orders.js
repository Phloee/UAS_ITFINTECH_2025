require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const clearOrders = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env.local');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Define a minimal Order schema to interact with the collection
        const orderSchema = new mongoose.Schema({}, { strict: false });
        const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

        const result = await Order.deleteMany({});
        console.log(`Successfully deleted ${result.deletedCount} orders.`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error clearing orders:', error);
        process.exit(1);
    }
};

clearOrders();
