// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { orders as ordersAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.isAdmin) {
            router.push('/auth/login');
            return;
        }
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        try {
            const response = await ordersAPI.getUserOrders();
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors = {
            'pending': '#f59e0b',
            'being processed': '#3b82f6',
            'shipped': '#8b5cf6',
            'delivered': '#10b981',
            'cancelled': '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    if (!user) return null;

    return (
        <>
            <Navbar />

            <main className="profile-page">
                <style jsx>{`
          .profile-page {
            max-width: 1000px;
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
          
          .profile-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: var(--spacing-xl);
            margin-bottom: var(--spacing-3xl);
          }
          
          .profile-card {
            background: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
            padding: var(--spacing-xl);
          }
          
          .profile-header {
            text-align: center;
            margin-bottom: var(--spacing-xl);
          }
          
          .profile-avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: var(--color-gradient);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            color: white;
            font-weight: 700;
            margin: 0 auto var(--spacing-md);
          }
          
          .profile-name {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: var(--spacing-xs);
          }
          
          .profile-email {
            color: var(--color-gray-600);
          }
          
          .info-group {
            margin-bottom: var(--spacing-lg);
          }
          
          .info-label {
            font-size: 0.875rem;
            color: var(--color-gray-600);
            margin-bottom: var(--spacing-xs);
          }
          
          .info-value {
            font-weight: 500;
            color: var(--color-gray-900);
          }
          
          .logout-btn {
            width: 100%;
            margin-top: var(--spacing-lg);
          }
          
          .orders-section {
            background: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
            padding: var(--spacing-xl);
          }
          
          .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: var(--spacing-lg);
          }
          
          .order-card {
            border: 2px solid var(--color-gray-200);
            border-radius: var(--radius-md);
            padding: var(--spacing-lg);
            margin-bottom: var(--spacing-md);
            cursor: pointer;
            transition: all var(--transition-base);
          }
          
          .order-card:hover {
            border-color: var(--color-primary-teal);
            box-shadow: var(--shadow-md);
          }
          
          .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-md);
          }
          
          .order-number {
            font-weight: 600;
            font-size: 1.125rem;
          }
          
          .order-status {
            padding: var(--spacing-xs) var(--spacing-md);
            border-radius: var(--radius-full);
            font-size: 0.875rem;
            font-weight: 600;
            color: white;
          }
          
          .order-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: var(--color-gray-600);
            font-size: 0.875rem;
          }
          
          .order-total {
            font-weight: 700;
            font-size: 1.125rem;
            color: var(--color-gray-900);
          }
          
          .empty-orders {
            text-align: center;
            padding: var(--spacing-3xl);
            color: var(--color-gray-500);
          }
          
          @media (max-width: 768px) {
            .profile-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

                <h1 className="page-title">My Profile</h1>

                <div className="profile-grid">
                    <div className="profile-card">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="profile-name">{user.name}</div>
                            <div className="profile-email">{user.email}</div>
                        </div>

                        <div className="info-group">
                            <div className="info-label">Phone Number</div>
                            <div className="info-value">{user.phone || '-'}</div>
                        </div>

                        <div className="info-group">
                            <div className="info-label">Gender</div>
                            <div className="info-value">
                                {user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : '-'}
                            </div>
                        </div>

                        <div className="info-group">
                            <div className="info-label">Birthdate</div>
                            <div className="info-value">
                                {user.birthdate ? new Date(user.birthdate).toLocaleDateString('id-ID') : '-'}
                            </div>
                        </div>

                        <button className="btn btn-outline logout-btn" onClick={logout}>
                            Logout
                        </button>
                    </div>

                    <div className="orders-section">
                        <h2 className="section-title">Order History</h2>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div className="spinner" style={{ margin: '0 auto' }}></div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="empty-orders">
                                <h3>No orders yet</h3>
                                <p>Start shopping to see your orders here!</p>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="order-card"
                                    onClick={() => router.push(`/orders/${order.id}`)}
                                >
                                    <div className="order-header">
                                        <div className="order-number">{order.orderNumber}</div>
                                        <div
                                            className="order-status"
                                            style={{ backgroundColor: getStatusColor(order.status) }}
                                        >
                                            {order.status}
                                        </div>
                                    </div>
                                    <div className="order-details">
                                        <div>
                                            {order.items?.length || 0} item(s) • {' '}
                                            {new Date(order.createdAt).toLocaleDateString('id-ID')}
                                        </div>
                                        <div className="order-total">
                                            Rp {order.totalAmount?.toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
