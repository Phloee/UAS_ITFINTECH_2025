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
          background: var(--color-gray-50);
        }
        
        .admin-header {
          background: white;
          box-shadow: var(--shadow-md);
          padding: var(--spacing-lg);
        }
        
        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          font-size: 1.5rem;
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
        }
        
        .dashboard-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--spacing-3xl) var(--spacing-lg);
        }
        
        .page-title {
          font-size: 2.5rem;
          margin-bottom: var(--spacing-xs);
        }
        
        .page-subtitle {
          color: var(--color-gray-600);
          margin-bottom: var(--spacing-3xl);
        }
        
        .nav-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--spacing-xl);
        }
        
        .nav-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          box-shadow: var(--shadow-md);
          transition: all var(--transition-base);
          text-decoration: none;
          display: block;
        }
        
        .nav-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }
        
        .nav-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
        }
        
        .nav-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: var(--spacing-sm);
          color: var(--color-gray-900);
        }
        
        .nav-description {
          color: var(--color-gray-600);
          font-size: 0.875rem;
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
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Manage your ScentFix e-commerce platform</p>

                <div className="nav-grid">
                    <Link href="/admin/products" className="nav-card">
                        <div className="nav-icon">📦</div>
                        <div className="nav-title">Products</div>
                        <div className="nav-description">
                            Manage product catalog, add new items, edit details, and upload images
                        </div>
                    </Link>

                    <Link href="/admin/orders" className="nav-card">
                        <div className="nav-icon">🛒</div>
                        <div className="nav-title">Orders</div>
                        <div className="nav-description">
                            View and manage customer orders, update order status
                        </div>
                    </Link>

                    <Link href="/admin/reports" className="nav-card">
                        <div className="nav-icon">📊</div>
                        <div className="nav-title">Reports & Analytics</div>
                        <div className="nav-description">
                            View sales reports, financial data, and performance analytics
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
