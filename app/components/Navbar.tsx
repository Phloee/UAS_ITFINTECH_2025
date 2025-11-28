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
