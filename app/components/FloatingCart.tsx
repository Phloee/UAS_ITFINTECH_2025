// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { cart as cartAPI } from '../utils/api';

export default function FloatingCart() {
    const { user } = useAuth();
    const router = useRouter();
    const [cartCount, setCartCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (user && !user.isAdmin) {
            setIsVisible(true);
            fetchCartCount();

            // Poll for cart updates every 3 seconds
            const interval = setInterval(fetchCartCount, 3000);
            return () => clearInterval(interval);
        } else {
            setIsVisible(false);
        }
    }, [user]);

    const fetchCartCount = async () => {
        try {
            const response = await cartAPI.get();
            const items = response.data?.items || [];
            const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
            setCartCount(totalItems);
        } catch (error) {
            console.error('Failed to fetch cart count');
        }
    };

    const handleClick = () => {
        router.push('/cart');
    };

    if (!isVisible) return null;

    return (
        <>
            <style jsx>{`
        .floating-cart {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 999;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cart-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--color-gradient);
          border: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .cart-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .cart-button:active {
          transform: scale(0.95);
        }

        .cart-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .cart-pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @media (max-width: 768px) {
          .floating-cart {
            bottom: 16px;
            right: 16px;
          }

          .cart-button {
            width: 56px;
            height: 56px;
            font-size: 1.25rem;
          }

          .cart-badge {
            width: 22px;
            height: 22px;
            font-size: 0.7rem;
          }
        }

        @media (max-width: 480px) {
          .cart-button {
            width: 52px;
            height: 52px;
          }
        }
      `}</style>

            <div className="floating-cart">
                <button
                    className={`cart-button ${cartCount > 0 ? 'cart-pulse' : ''}`}
                    onClick={handleClick}
                    aria-label={`Shopping cart with ${cartCount} items`}
                >
                    🛒
                    {cartCount > 0 && (
                        <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
                    )}
                </button>
            </div>
        </>
    );
}
