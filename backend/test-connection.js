require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connection successful!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Connection failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    });
