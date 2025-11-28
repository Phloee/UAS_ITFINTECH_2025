// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { orders as ordersAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!user || !user.isAdmin) {
            router.push('/admin/login');
            return;
        }
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        try {
            const response = await ordersAPI.getAll();
            setOrders(response.data);
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await ordersAPI.updateStatus(orderId, newStatus);
            toast.success('Order status updated');
            await fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': '#f59e0b',
            'being processed': '#3b82f6',
            'shipped': '#8b5cf6',
            'delivered': '#10b981',
            'cancelled': '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(order => order.status === filter);

    if (!user || !user.isAdmin) return null;

    return (
        <div className="admin-orders-page">
            <style jsx>{`
        .admin-orders-page {
          min-height: 100vh;
          background: var(--color-gray-50);
        }
        
        .admin-header {
          background: white;
          box-shadow: var(--shadow-md);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
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
          cursor: pointer;
        }
        
        .orders-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--spacing-lg) var(--spacing-3xl);
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xl);
        }
        
        .filters {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xl);
        }
        
        .filter-btn {
          padding: var(--spacing-sm) var(--spacing-lg);
          border: 2px solid var(--color-gray-300);
          background: white;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
          font-weight: 500;
        }
        
        .filter-btn.active {
          background: var(--color-gradient);
          color: white;
          border-color: transparent;
        }
        
        .orders-table {
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          overflow: hidden;
        }
        
        .table-header {
          display: grid;
          grid-template-columns: 150px 200px 1fr 150px 120px 120px 200px;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: var(--color-gray-100);
          font-weight: 600;
        }
        
        .table-row {
          display: grid;
          grid-template-columns: 150px 200px 1fr 150px 120px 120px 200px;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--color-gray-200);
          align-items: center;
        }
        
        .table-row:last-child {
          border-bottom: none;
        }
        
        .order-number {
          font-weight: 600;
          color: var(--color-primary-teal);
        }
        
        .status-select {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-gray-300);
          font-size: 0.875rem;
          cursor: pointer;
        }
        
        .customer-name {
          font-weight: 500;
        }
        
        .order-date {
          color: var(--color-gray-600);
          font-size: 0.875rem;
        }
        
        @media (max-width: 1200px) {
          .table-header, .table-row {
            grid-template-columns: 1fr;
            gap: var(--spacing-sm);
          }
          
          .table-header {
            display: none;
          }
          
          .table-row {
            padding: var(--spacing-md);
          }
        }
      `}</style>

            <div className="admin-header">
                <div className="header-content">
                    <div className="logo" onClick={() => router.push('/admin/dashboard')}>
                        ScentFix Admin
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="orders-content">
                <div className="page-header">
                    <h1>Order Management</h1>
                </div>

                <div className="filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Orders
                    </button>
                    <button
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`filter-btn ${filter === 'being processed' ? 'active' : ''}`}
                        onClick={() => setFilter('being processed')}
                    >
                        Processing
                    </button>
                    <button
                        className={`filter-btn ${filter === 'shipped' ? 'active' : ''}`}
                        onClick={() => setFilter('shipped')}
                    >
                        Shipped
                    </button>
                    <button
                        className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
                        onClick={() => setFilter('delivered')}
                    >
                        Delivered
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                    </div>
                ) : (
                    <div className="orders-table">
                        <div className="table-header">
                            <div>Order Number</div>
                            <div>Customer</div>
                            <div>Items</div>
                            <div>Total</div>
                            <div>Payment</div>
                            <div>Date</div>
                            <div>Status</div>
                        </div>

                        {filteredOrders.map((order) => (
                            <div key={order._id} className="table-row">
                                <div className="order-number">{order.orderNumber}</div>
                                <div className="customer-name">
                                    {order.userId?.name || 'Unknown Customer'}
                                </div>
                                <div>
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} style={{ fontSize: '0.875rem' }}>
                                            {item.productId?.name || 'Product'} x{item.quantity}
                                        </div>
                                    ))}
                                </div>
                                <div>Rp {order.totalAmount?.toLocaleString('id-ID')}</div>
                                <div>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        backgroundColor: order.paymentStatus === 'paid' ? '#d1fae5' : order.paymentStatus === 'failed' ? '#fee2e2' : '#fef3c7',
                                        color: order.paymentStatus === 'paid' ? '#059669' : order.paymentStatus === 'failed' ? '#dc2626' : '#d97706'
                                    }}>
                                        {order.paymentStatus?.toUpperCase() || 'PENDING'}
                                    </span>
                                </div>
                                <div className="order-date">
                                    {new Date(order.createdAt).toLocaleDateString('id-ID')}
                                </div>
                                <div>
                                    <select
                                        className="status-select"
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                        style={{
                                            borderColor: getStatusColor(order.status),
                                            color: getStatusColor(order.status)
                                        }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="being processed">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
