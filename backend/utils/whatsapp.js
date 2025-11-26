const axios = require('axios');

const FONNTE_API_URL = 'https://api.fonnte.com/send';

class WhatsAppService {
    constructor() {
        this.token = process.env.FONNTE_TOKEN;
    }

    async sendMessage(phoneNumber, message) {
        try {
            // Clean phone number (remove + and spaces)
            const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');

            const response = await axios.post(
                FONNTE_API_URL,
                {
                    target: cleanPhone,
                    message: message,
                    countryCode: '62' // Indonesia country code
                },
                {
                    headers: {
                        'Authorization': this.token,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('WhatsApp sending error:', error.response?.data || error.message);
            throw new Error('Failed to send WhatsApp message');
        }
    }

    async sendOrderConfirmation(customer, order) {
        const message = `🎉 *Terima kasih atas pesanan Anda!*

*ScentFix - Order Confirmation*
━━━━━━━━━━━━━━━━━━
📦 Order ID: ${order.orderNumber}
👤 Nama: ${customer.name}

*Detail Pesanan:*
${order.items.map(item => `• ${item.name} (${item.quantity}x) - Rp ${item.price.toLocaleString('id-ID')}`).join('\n')}

💰 *Total: Rp ${order.totalAmount.toLocaleString('id-ID')}*

Status: ${this.getStatusEmoji(order.status)} ${this.translateStatus(order.status)}

Kami akan segera memproses pesanan Anda. Terima kasih telah berbelanja di ScentFix! 🌟`;

        return await this.sendMessage(customer.phone, message);
    }

    async sendWelcomeMessage(customer) {
        const message = `🌟 *Selamat datang di ScentFix!*

Halo ${customer.name}! 👋

Terima kasih telah mendaftar di ScentFix - toko parfum terpercaya Anda.

Kami senang Anda bergabung dengan kami! 🎉

*Keuntungan berbelanja di ScentFix:*
✨ Produk parfum berkualitas
🚚 Gratis ongkir
💳 Berbagai metode pembayaran
📦 Tracking pesanan real-time

Jelajahi koleksi parfum kami dan temukan aroma favoritmu!

Selamat berbelanja! 🛍️

- Tim ScentFix`;

        return await this.sendMessage(customer.phone, message);
    }

    async sendOrderStatusUpdate(customer, order, newStatus) {
        const message = `📦 *Update Status Pesanan*

*ScentFix*
━━━━━━━━━━━━━━━━━━
Order ID: ${order.orderNumber}
Nama: ${customer.name}

Status: ${this.getStatusEmoji(newStatus)} *${this.translateStatus(newStatus)}*

${this.getStatusMessage(newStatus)}

Terima kasih telah berbelanja di ScentFix! 🌟`;

        return await this.sendMessage(customer.phone, message);
    }

    translateStatus(status) {
        const translations = {
            'pending': 'Menunggu Pembayaran',
            'being processed': 'Sedang Diproses',
            'shipped': 'Dikirim',
            'delivered': 'Terkirim'
        };
        return translations[status] || status;
    }

    getStatusEmoji(status) {
        const emojis = {
            'pending': '⏳',
            'being processed': '📦',
            'shipped': '🚚',
            'delivered': '✅'
        };
        return emojis[status] || '📌';
    }

    getStatusMessage(status) {
        const messages = {
            'being processed': 'Pesanan Anda sedang kami persiapkan dengan baik.',
            'shipped': 'Pesanan Anda sedang dalam perjalanan! Mohon tunggu paket Anda.',
            'delivered': 'Pesanan Anda telah terkirim! Terima kasih telah berbelanja di ScentFix.'
        };
        return messages[status] || '';
    }
}

module.exports = new WhatsAppService();
