// @ts-nocheck
'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { cart as cartAPI } from '../utils/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
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
          position: relative;
          z-index: 102;
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

        .hamburger {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          z-index: 102;
          position: relative;
        }

        .hamburger span {
          width: 24px;
          height: 3px;
          background: var(--color-gray-900);
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }

        .mobile-icons {
          display: none;
        }

        .mobile-profile-icon {
          font-size: 1.5rem;
          padding: 0.5rem;
          text-decoration: none;
          transition: transform var(--transition-base);
        }

        .mobile-profile-icon:hover {
          transform: scale(1.1);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }

        .mobile-menu-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 99;
        }

        .mobile-menu-overlay.open {
          display: block;
        }

        @media (max-width: 768px) {
          .nav-content {
            padding: 0 var(--spacing-md);
          }

          .mobile-icons {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            position: absolute;
            right: 60px;
            z-index: 102;
          }

          .hamburger {
            display: flex;
          }

          .nav-links {
            position: fixed;
            top: 0;
            right: -100%;
            height: 100vh;
            width: 280px;
            max-width: 80vw;
            background: white;
            flex-direction: column;
            align-items: stretch;
            gap: 0;
            padding: 80px var(--spacing-lg) var(--spacing-xl);
            box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
            transition: right 0.3s ease;
            z-index: 101;
            overflow-y: auto;
          }

          .nav-links.open {
            right: 0;
          }

          .nav-link {
            padding: var(--spacing-lg) var(--spacing-xl);
            font-size: 1.125rem;
            margin: var(--spacing-md) 0;
            border-radius: var(--radius-md);
            transition: all var(--transition-base);
            background: white;
            border: 2px solid var(--color-gray-300);
            text-align: center;
            font-weight: 500;
            display: block;
          }
          
          .nav-link:hover,
          .nav-link:active {
            background: var(--color-gray-50);
            border-color: var(--color-primary-teal);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          
          .cart-badge {
            position: relative;
          }

          .nav-links .btn {
            margin-top: var(--spacing-xl);
            text-align: center;
            width: 100%;
            min-height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.125rem;
            font-weight: 600;
          }

          .logo-text {
            font-size: 1.5rem;
            padding: 0.3rem 1rem;
          }
        }

        @media (max-width: 480px) {
          .logo-text {
            font-size: 1.25rem;
            padding: 0.25rem 0.8rem;
          }

          .nav-links {
            width: 260px;
          }
        }
      `}</style>

      <div className="nav-content">
        <Link href="/" className="logo" onClick={handleLinkClick}>
          <span className="logo-text">scentfix.</span>
        </Link>

        <div className="mobile-icons">
          {user && !user.isAdmin && (
            <Link href="/profile" className="mobile-profile-icon" onClick={handleLinkClick} title="Profile">
              👤
            </Link>
          )}
        </div>

        <button
          className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div
          className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          {!user && (
            <>
              <Link href="/products" className="nav-link" onClick={handleLinkClick}>Products</Link>
              <Link href="/auth/login" className="nav-link" onClick={handleLinkClick}>Login</Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm" onClick={handleLinkClick}>Sign Up</Link>
            </>
          )}

          {user && !user.isAdmin && (
            <>
              <Link href="/products" className="nav-link" onClick={handleLinkClick}>Products</Link>
              <Link href="/cart" className="nav-link cart-badge" onClick={handleLinkClick}>
                🛒 Cart
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>
              <Link href="/profile" className="nav-link" onClick={handleLinkClick}>Orders</Link>
              <Link href="/profile" className="nav-link" onClick={handleLinkClick} title="Profile" style={{ color: '#2ecc71', fontSize: '1.5rem' }}>
                👤
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
            </>
          )}

          {user && user.isAdmin && (
            <>
              <Link href="/admin/dashboard" className="nav-link" onClick={handleLinkClick}>Dashboard</Link>
              <Link href="/admin/products" className="nav-link" onClick={handleLinkClick}>Products</Link>
              <Link href="/admin/orders" className="nav-link" onClick={handleLinkClick}>Orders</Link>
              <Link href="/admin/reports" className="nav-link" onClick={handleLinkClick}>Reports</Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
