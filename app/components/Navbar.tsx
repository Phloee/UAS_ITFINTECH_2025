// @ts-nocheck
'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { cart as cartAPI } from '../utils/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user && !user.isAdmin) {
      fetchCartCount();
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

  return (
    <nav className="navbar">
      <style jsx>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--color-white);
          box-shadow: var(--shadow-md);
          padding: var(--spacing-md) 0;
        }
        
        .nav-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-lg);
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          text-decoration: none;
        }
        
        .logo-text {
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #f4d03f 0%, #16a085 100%);
          padding: 0.4rem 1.2rem;
          border-radius: 8px;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          text-transform: lowercase;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .nav-links {
          display: flex;
          align-items: center;
          gap: var(--spacing-xl);
        }
        
        .nav-link {
          font-weight: 500;
          transition: color var(--transition-base);
        }
        
        .nav-link:hover {
          color: var(--color-primary-teal);
        }
        
        .cart-badge {
          position: relative;
        }
        
        .cart-count {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--color-gradient);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        @media (max-width: 768px) {
          .nav-links {
            gap: var(--spacing-md);
            font-size: 0.875rem;
          }
          
          .logo {
            font-size: 1.25rem;
          }
        }
      `}</style>

      <div className="nav-content">
        <Link href="/" className="logo">
          <span className="logo-text">scentfix.</span>
        </Link>

        <div className="nav-links">
          {!user && (
            <>
              <Link href="/products" className="nav-link">Products</Link>
              <Link href="/auth/login" className="nav-link">Login</Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}

          {user && !user.isAdmin && (
            <>
              <Link href="/products" className="nav-link">Products</Link>
              <Link href="/profile" className="nav-link">Profile</Link>
              <Link href="/cart" className="nav-link cart-badge">
                🛒 Cart
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>
              <button onClick={logout} className="btn btn-outline btn-sm">Logout</button>
            </>
          )}

          {user && user.isAdmin && (
            <>
              <Link href="/admin/dashboard" className="nav-link">Dashboard</Link>
              <Link href="/admin/products" className="nav-link">Products</Link>
              <Link href="/admin/orders" className="nav-link">Orders</Link>
              <Link href="/admin/reports" className="nav-link">Reports</Link>
              <button onClick={logout} className="btn btn-outline btn-sm">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
