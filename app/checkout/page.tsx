// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { cart as cartAPI, orders as ordersAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [snapLoaded, setSnapLoaded] = useState(false);

  useEffect(() => {
    // Check if Snap is already loaded globally
    if (typeof window !== 'undefined' && (window as any).snap) {
      console.log('Midtrans Snap already loaded');
      setSnapLoaded(true);
    }

    // Fallback: If script takes too long (e.g. 3s), allow user to retry or force enable
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).snap) {
        setSnapLoaded(true);
      }
    }, 3000);

    // Debug client key and production mode
    console.log('Midtrans Client Key:', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ? 'Present' : 'Missing');
    console.log('Production Mode:', process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION);

    if (!user || user.isAdmin) {
      toast.error('Please login to checkout');
      router.push('/auth/login');
      return;
    }
    fetchCart();

    return () => clearTimeout(timer);
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get();
      if (response.data.items.length === 0) {
        toast.error('Your cart is empty');
        router.push('/cart');
        return;
      }
      const items = response.data.items || [];
      // Calculate total using populated product data
      const totalAmount = items.reduce((sum, item) => {
        const price = item.productId?.price || 0;
        return sum + (price * item.quantity);
      }, 0);
      setCart({ items, totalAmount });
    } catch (error) {
      toast.error('Failed to fetch cart');
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!snapLoaded) {
      toast.error('Payment system is loading, please wait...');
      return;
    }

    setProcessing(true);
    try {
      // Create order
      const orderResponse = await ordersAPI.create({});
      const order = orderResponse.data.order;

      // Initiate payment
      const paymentResponse = await ordersAPI.initiatePayment(order._id || order.id);
      const { token } = paymentResponse.data;

      // Open Midtrans Snap
      (window as any).snap.pay(token, {
        onSuccess: function (result: any) {
          toast.success('Payment successful!');
          router.push(`/orders/${order._id || order.id}`);
        },
        onPending: function (result: any) {
          toast.info('Payment pending');
          router.push(`/orders/${order._id || order.id}`);
        },
        onError: function (result: any) {
          toast.error('Payment failed');
          setProcessing(false);
        },
        onClose: function () {
          setProcessing(false);
        }
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Checkout failed');
      setProcessing(false);
    }
  };

  if (loading || !user) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
          ? "https://app.midtrans.com/snap/snap.js"
          : "https://app.sandbox.midtrans.com/snap/snap.js"}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
        onLoad={() => {
          console.log('Midtrans Snap script loaded successfully');
          setSnapLoaded(true);
        }}
        onError={(e) => {
          console.error('Midtrans Snap script failed to load', e);
          toast.error('Failed to load payment system. Please check your connection.');
        }}
      />

      <Navbar />

      <main className="checkout-page">
        <style jsx>{`
          .checkout-page {
            max-width: 800px;
            margin: 0 auto;
            padding: var(--spacing-3xl) var(--spacing-lg);
            min-height: calc(100vh - 200px);
          }
          
          .page-title {
            background: var(--color-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: var(--spacing-2xl);
          }
          
          .checkout-section {
            background: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
            padding: var(--spacing-xl);
            margin-bottom: var(--spacing-xl);
          }
          
          .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: var(--spacing-lg);
            padding-bottom: var(--spacing-sm);
            border-bottom: 2px solid var(--color-gray-200);
          }
          
          .order-item {
            display: flex;
            justify-content: space-between;
            padding: var(--spacing-md) 0;
            border-bottom: 1px solid var(--color-gray-100);
          }
          
          .order-item:last-child {
            border-bottom: none;
          }
          
          .item-info {
            flex: 1;
          }
          
          .item-name {
            font-weight: 600;
            margin-bottom: var(--spacing-xs);
          }
          
          .item-quantity {
            color: var(--color-gray-600);
            font-size: 0.875rem;
          }
          
          .item-price {
            font-weight: 600;
            color: var(--color-gray-900);
          }
          
          .order-summary {
            margin-top: var(--spacing-lg);
            padding-top: var(--spacing-lg);
            border-top: 2px solid var(--color-gray-200);
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: var(--spacing-sm);
          }
          
          .summary-total {
            font-size: 1.5rem;
            font-weight: 700;
            margin-top: var(--spacing-md);
          }
          
          .total-amount {
            background: var(--color-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .shipping-info {
            padding: var(--spacing-md);
            background: var(--color-gray-50);
            border-radius: var(--radius-md);
            margin-bottom: var(--spacing-lg);
          }
          
          .shipping-info p {
            margin: 0;
            color: var(--color-gray-700);
          }
          
          .shipping-badge {
            display: inline-block;
            background: var(--color-success);
            color: white;
            padding: var(--spacing-xs) var(--spacing-md);
            border-radius: var(--radius-full);
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: var(--spacing-sm);
          }
          
          .checkout-actions {
            display: flex;
            gap: var(--spacing-md);
          }
          
          .payment-info {
            background: #eff6ff;
            border: 1px solid #3b82f6;
            border-radius: var(--radius-md);
            padding: var(--spacing-md);
            margin-bottom: var(--spacing-lg);
            font-size: 0.875rem;
          }
          
          .payment-info strong {
            color: #1e40af;
          }

          @media (max-width: 768px) {
            .checkout-page {
              padding: var(--spacing-xl) var(--spacing-md);
            }

            .page-title {
              font-size: 1.75rem;
            }
          }

          @media (max-width: 480px) {
            .checkout-actions {
              flex-direction: column;
            }

            .checkout-actions .btn {
              width: 100%;
              min-height: 48px;
            }

            .page-title {
              font-size: 1.5rem;
            }

            .checkout-section {
              padding: var(--spacing-md);
            }
          }
        `}</style>

        <h1 className="page-title">Checkout</h1>

        <div className="checkout-section">
          <h2 className="section-title">Order Summary</h2>

          {cart.items.map((item) => {
            // Access populated product data safely
            const product = item.productId || {};
            const price = product.price || 0;
            const name = product.name || 'Unknown Product';
            const productId = product._id || item._id;

            return (
              <div key={productId} className="order-item">
                <div className="item-info">
                  <div className="item-name">{name}</div>
                  <div className="item-quantity">Quantity: {item.quantity}</div>
                </div>
                <div className="item-price">
                  Rp {(price * item.quantity).toLocaleString('id-ID')}
                </div>
              </div>
            );
          })}

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>Rp {cart.totalAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>FREE</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total:</span>
              <span className="total-amount">Rp {cart.totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="checkout-section">
          <h2 className="section-title">Shipping Information</h2>

          <div className="shipping-info">
            <div className="shipping-badge">FREE SHIPPING</div>
            <p><strong>Delivery Time:</strong> 3-5 business days</p>
            <p><strong>Status Updates:</strong> You'll receive WhatsApp notifications for order updates</p>
          </div>
        </div>

        <div className="checkout-section">
          <h2 className="section-title">Payment Method</h2>

          <div className="payment-info">
            <strong>Secure Payment via Midtrans</strong>
            <p>You'll be redirected to our secure payment partner to complete your purchase. We accept credit cards, bank transfers, and e-wallets.</p>
          </div>

          <div className="checkout-actions">
            <button
              className="btn btn-secondary"
              onClick={() => router.push('/cart')}
              disabled={processing}
              style={{ flex: 1 }}
            >
              Back to Cart
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleCheckout}
              disabled={processing || !snapLoaded}
              style={{ flex: 2 }}
            >
              {processing ? 'Processing...' : !snapLoaded ? 'Loading Payment...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
