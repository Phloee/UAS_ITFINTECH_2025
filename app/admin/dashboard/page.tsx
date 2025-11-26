// @ts-nocheck
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push('/admin/login');
    }
  }, [user]);

  if (!user || !user.isAdmin) return null;

  return (
    <div className="admin-dashboard">
      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: white;
        }
        
        .admin-header {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          padding: var(--spacing-lg) var(--spacing-xl);
          border-bottom: 3px solid var(--color-primary-teal);
        }
        
        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          font-size: 1.75rem;
          font-weight: 700;
          background: var(--color-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
        }
        
        .welcome-text {
          color: var(--color-gray-700);
          font-weight: 500;
        }
        
        .dashboard-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--spacing-3xl) var(--spacing-xl);
        }
        
        .page-header {
          margin-bottom: var(--spacing-3xl);
        }
        
        .page-title {
          font-size: 2.5rem;
          margin-bottom: var(--spacing-xs);
          font-weight: 700;
          color: var(--color-gray-900);
        }
        
        .page-subtitle {
          color: var(--color-gray-600);
          font-size: 1.125rem;
        }
        
        .nav-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: var(--spacing-xl);
        }
        
        .nav-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--spacing-2xl);
          border: 3px solid var(--color-gray-300);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          position: relative;
        }
        
        .nav-card:hover {
          transform: translateY(-6px) scale(1.02);
          border-color: var(--color-primary-teal);
          box-shadow: 0 12px 28px rgba(95, 179, 163, 0.3);
          background: linear-gradient(135deg, #ffffff 0%, #f0fdfb 100%);
        }

        .nav-card:active {
          transform: translateY(-2px) scale(0.98);
        }
        
        .nav-icon {
          font-size: 4rem;
          margin-bottom: var(--spacing-lg);
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }
        
        .nav-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: var(--spacing-md);
          color: var(--color-gray-900);
        }
        
        .nav-description {
          color: var(--color-gray-600);
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: var(--spacing-lg);
        }

        .nav-button {
          margin-top: auto;
          padding: var(--spacing-sm) var(--spacing-xl);
          background: var(--color-gradient);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 1rem;
          border: none;
          transition: all 0.3s ease;
        }

        .nav-card:hover .nav-button {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(95, 179, 163, 0.4);
        }

        @media (max-width: 768px) {
          .nav-grid {
            grid-template-columns: 1fr;
          }

          .page-title {
            font-size: 2rem;
          }

          .nav-card {
            padding: var(--spacing-xl);
          }

          .nav-icon {
            font-size: 3rem;
          }

          .nav-title {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <div className="admin-header">
        <div className="header-content">
          <div className="logo">ScentFix Admin</div>
          <div className="header-actions">
            <span className="welcome-text">Welcome, {user.username}</span>
            <button className="btn btn-outline btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Manage your ScentFix e-commerce platform</p>
        </div>

        <div className="nav-grid">
          <Link href="/admin/products" className="nav-card">
            <div className="nav-icon">📦</div>
            <div className="nav-title">Products</div>
            <div className="nav-description">
              Manage product catalog, add new items, edit details, and upload images
            </div>
            <div className="nav-button">Manage Products</div>
          </Link>

          <Link href="/admin/orders" className="nav-card">
            <div className="nav-icon">🛒</div>
            <div className="nav-title">Orders</div>
            <div className="nav-description">
              View and manage customer orders, update order status
            </div>
            <div className="nav-button">View Orders</div>
          </Link>

          <Link href="/admin/reports" className="nav-card">
            <div className="nav-icon">📊</div>
            <div className="nav-title">Reports & Analytics</div>
            <div className="nav-description">
              View sales reports, financial data, and performance analytics
            </div>
            <div className="nav-button">View Reports</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
