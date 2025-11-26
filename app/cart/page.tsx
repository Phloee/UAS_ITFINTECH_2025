// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { cart as cartAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });

  useEffect(() => {
    if (!user || user.isAdmin) {
      toast.error('Please login to view your cart');
      router.push('/auth/login');
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get();
      console.log('Cart response:', response.data);
      setCart(response.data || { items: [], totalAmount: 0 });
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      await cartAPI.update({ productId, quantity: newQuantity });
      await fetchCart();
      toast.success('Cart updated');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update cart');
    }
  };

  const removeItem = async (productId) => {
    try {
      await cartAPI.remove(productId);
      await fetchCart();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearClick = () => {
    setShowClearConfirm(true);
  };

  const confirmClearCart = async () => {
    try {
      await cartAPI.clear();
      await fetchCart();
      toast.success('Cart cleared');
      setShowClearConfirm(false);
    } catch (error) {
      toast.error('Failed to clear cart');
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
      <Navbar />

      <main className="cart-page">
        <style jsx>{`
          .cart-page {
            max-width: 1000px;
            margin: 0 auto;
            padding: var(--spacing-3xl) var(--spacing-lg);
            min-height: calc(100vh - 200px);
            position: relative;
          }
          
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-2xl);
          }
          
          .page-title {
            background: var(--color-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .clear-btn {
            color: var(--color-error);
            background: none;
            border: none;
            cursor: pointer;
            text-decoration: underline;
            font-size: 0.875rem;
          }
          
          .cart-items {
            background: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
            margin-bottom: var(--spacing-xl);
          }
          
          .cart-item {
            display: grid;
            grid-template-columns: 100px 1fr auto;
            gap: var(--spacing-lg);
            padding: var(--spacing-lg);
            border-bottom: 1px solid var(--color-gray-200);
          }
          
          .cart-item:last-child {
            border-bottom: none;
          }
          
          .item-image {
            position: relative;
            width: 100px;
            height: 100px;
            border-radius: var(--radius-md);
            overflow: hidden;
            background: var(--color-gray-100);
          }
          
          .item-details {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          
          .item-name {
            font-weight: 600;
            font-size: 1.125rem;
            margin-bottom: var(--spacing-xs);
          }
          
          .item-price {
            color: var(--color-gray-600);
            font-size: 0.875rem;
          }
          
          .item-actions {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: space-between;
          }
          
          .quantity-controls {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
          }
          
          .quantity-btn {
            width: 32px;
            height: 32px;
            border: 1px solid var(--color-gray-300);
            background: white;
            border-radius: var(--radius-sm);
            cursor: pointer;
            font-size: 1rem;
            transition: all var(--transition-base);
          }
          
          .quantity-btn:hover {
            border-color: var(--color-primary-teal);
            color: var(--color-primary-teal);
          }
          
          .quantity-display {
            min-width: 30px;
            text-align: center;
            font-weight: 600;
          }
          
          .remove-btn {
            color: var(--color-error);
            background: none;
            border: none;
            cursor: pointer;
            font-size: 0.875rem;
            text-decoration: underline;
          }
          
          .item-total {
            font-weight: 700;
            font-size: 1.125rem;
          }
          
          .cart-summary {
            background: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
            padding: var(--spacing-xl);
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: var(--spacing-md);
            font-size: 1.125rem;
          }
          
          .summary-total {
            border-top: 2px solid var(--color-gray-200);
            padding-top: var(--spacing-md);
            font-weight: 700;
            font-size: 1.5rem;
          }
          
          .total-amount {
            background: var(--color-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .checkout-actions {
            display: flex;
            gap: var(--spacing-md);
            margin-top: var(--spacing-xl);
          }
          
          .empty-cart {
            text-align: center;
            padding: var(--spacing-3xl);
          }
          
          .empty-cart h3 {
            color: var(--color-gray-600);
            margin-bottom: var(--spacing-md);
          }

          /* Modal Styles */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal-content {
            background: white;
            padding: var(--spacing-xl);
            border-radius: var(--radius-lg);
            width: 90%;
            max-width: 400px;
            box-shadow: var(--shadow-xl);
            text-align: center;
          }

          .modal-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: var(--spacing-md);
          }

          .modal-actions {
            display: flex;
            gap: var(--spacing-md);
            justify-content: center;
            margin-top: var(--spacing-xl);
          }
          
          @media (max-width: 768px) {
            .cart-item {
              grid-template-columns: 80px 1fr;
              gap: var(--spacing-md);
            }
            
            .item-image {
              width: 80px;
              height: 80px;
            }
            
            .item-actions {
              grid-column: 1 / -1;
              flex-direction: row;
              justify-content: space-between;
            }
          }
        `}</style>

        <div className="page-header">
          <h1 className="page-title">Shopping Cart</h1>
          {cart.items.length > 0 && (
            <button className="clear-btn" onClick={handleClearClick}>
              Clear Cart
            </button>
          )}
        </div>

        {cart.items.length === 0 ? (
          <div className="empty-cart card">
            <h3>Your cart is empty</h3>
            <p>Add some products to get started!</p>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/products')}
              style={{ marginTop: 'var(--spacing-lg)' }}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.items.map((item) => (
                <div key={item.productId} className="cart-item">
                  <div className="item-image">
                    <Image
                      src={item.productImage || '/assets/products/placeholder.jpg'}
                      alt={item.productName || 'Product Image'}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>

                  <div className="item-details">
                    <div className="item-name">{item.productName || 'Unknown Product'}</div>
                    <div className="item-price">
                      Rp {(item.productPrice || 0).toLocaleString('id-ID')} each
                    </div>
                  </div>

                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <div className="item-total">
                      Rp {((item.productPrice || 0) * item.quantity).toLocaleString('id-ID')}
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row summary-total">
                <span>Total:</span>
                <span className="total-amount">
                  Rp {cart.totalAmount.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="checkout-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => router.push('/products')}
                  style={{ flex: 1 }}
                >
                  Continue Shopping
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => router.push('/checkout')}
                  style={{ flex: 1 }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}

        {showClearConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Clear Cart?</h3>
              <p>Are you sure you want to remove all items from your cart?</p>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ background: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                  onClick={confirmClearCart}
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
