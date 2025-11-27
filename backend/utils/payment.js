const axios = require('axios');

class MidtransService {
    constructor() {
        // Trim keys to remove any accidental whitespace
        this.serverKey = process.env.MIDTRANS_SERVER_KEY ? process.env.MIDTRANS_SERVER_KEY.trim() : '';
        this.clientKey = process.env.MIDTRANS_CLIENT_KEY ? process.env.MIDTRANS_CLIENT_KEY.trim() : '';
        // Robust check for production mode (handle spaces, case sensitivity)
        const isProdEnv = String(process.env.MIDTRANS_IS_PRODUCTION || '').trim().toLowerCase();
        this.isProduction = isProdEnv === 'true';

        // Snap API URL
        this.snapUrl = this.isProduction
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        // Core API URL (for status checks)
        this.apiUrl = this.isProduction
            ? 'https://api.midtrans.com/v2'
            : 'https://api.sandbox.midtrans.com/v2';

        // Safe logging for debugging
        console.log('Midtrans Config Init:', {
            isProduction: this.isProduction,
            rawEnv: process.env.MIDTRANS_IS_PRODUCTION,
            url: this.snapUrl,
            serverKeyPrefix: this.serverKey ? this.serverKey.substring(0, 8) + '...' : 'MISSING'
        });
    }

    async createTransaction(order, customer) {
        try {
            const auth = Buffer.from(this.serverKey + ':').toString('base64');

            const payload = {
                transaction_details: {
                    order_id: order.orderNumber,
                    gross_amount: order.totalAmount
                },
                customer_details: {
                    first_name: customer.name.split(' ')[0],
                    last_name: customer.name.split(' ').slice(1).join(' ') || '-',
                    email: customer.email,
                    phone: customer.phone
                },
                item_details: order.items.map(item => ({
                    id: item.productId,
                    price: item.price,
                    quantity: item.quantity,
                    name: item.name
                })),
                callbacks: {
                    finish: `${process.env.NEXT_URL}/orders/${order.id}`,
                    error: `${process.env.NEXT_URL}/checkout?error=payment_failed`,
                    pending: `${process.env.NEXT_URL}/orders/${order.id}`
                },
                expiry: {
                    unit: 'minutes',
                    duration: 60
                }
            };

            const response = await axios.post(this.snapUrl, payload, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${auth}`
                }
            });

            return {
                token: response.data.token,
                redirectUrl: response.data.redirect_url
            };
        } catch (error) {
            console.error('Midtrans error details:');
            console.error('Status:', error.response?.status);
            console.error('Data:', JSON.stringify(error.response?.data, null, 2));
            console.error('Message:', error.message);
            console.error('Server Key configured:', !!this.serverKey);
            console.error('Snap URL:', this.snapUrl);
            const errorMessage = error.response?.data?.error_messages?.join(', ') || error.message;
            throw new Error(`Midtrans Error: ${errorMessage}`);
        }
    }

    async getTransactionStatus(orderId) {
        try {
            const auth = Buffer.from(this.serverKey + ':').toString('base64');
            const response = await axios.get(`${this.apiUrl}/${orderId}/status`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${auth}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Midtrans status check error:', error.response?.data || error.message);
            throw error;
        }
    }

    verifySignature(orderId, statusCode, grossAmount, serverKey) {
        const crypto = require('crypto');
        const signatureKey = orderId + statusCode + grossAmount + serverKey;
        return crypto.createHash('sha512').update(signatureKey).digest('hex');
    }
}

module.exports = new MidtransService();
