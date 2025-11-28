// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { reports as reportsAPI } from '../../utils/api';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

export default function AdminReportsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [financial, setFinancial] = useState(null);
    const [orderStats, setOrderStats] = useState(null);
    const [productPerformance, setProductPerformance] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.isAdmin) {
            router.push('/admin/login');
            return;
        }
        fetchReports();
    }, [user]);

    const fetchReports = async () => {
        try {
            const [financialRes, orderStatsRes, productPerfRes, chartsRes] = await Promise.all([
                reportsAPI.getFinancial(),
                reportsAPI.getOrderStats(),
                reportsAPI.getProductPerformance(),
                reportsAPI.getChartData()
            ]);

            setFinancial(financialRes.data);
            setOrderStats(orderStatsRes.data);
            setProductPerformance(productPerfRes.data);
            setChartData(chartsRes.data);
        } catch (error) {
            toast.error('Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#E8D56D', '#5FB3A3', '#3b82f6', '#8b5cf6', '#10b981'];

    if (!user || !user.isAdmin) return null;

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
            </div>
        );
    }

    return (
        <div className="admin-reports-page">
            <style jsx>{`
        .admin-reports-page {
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
        
        .reports-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--spacing-lg) var(--spacing-3xl);
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-2xl);
        }
        
        .metric-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          box-shadow: var(--shadow-md);
        }
        
        .metric-label {
          font-size: 0.875rem;
          color: var(--color-gray-600);
          margin-bottom: var(--spacing-sm);
        }
        
        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          background: var(--color-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .charts-grid {
          display: grid;
          gap: var(--spacing-xl);
        }
        
        .chart-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          box-shadow: var(--shadow-md);
        }
        
        .chart-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: var(--spacing-lg);
        }
        
        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: 1fr;
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

            <div className="reports-content">
                <h1 style={{ marginBottom: 'var(--spacing-2xl)' }}>Reports & Analytics</h1>

                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-label">Total Revenue</div>
                        <div className="metric-value">
                            Rp {financial?.totalRevenue?.toLocaleString('id-ID') || 0}
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-label">Total Orders</div>
                        <div className="metric-value">{financial?.totalOrders || 0}</div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-label">Average Order Value</div>
                        <div className="metric-value">
                            Rp {financial?.averageOrderValue?.toLocaleString('id-ID') || 0}
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-label">Pending Orders</div>
                        <div className="metric-value">
                            {orderStats?.byStatus?.pending || 0}
                        </div>
                    </div>
                </div>

                <div className="charts-grid">
                    <div className="chart-card">
                        <div className="chart-title">Revenue Over Time</div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData?.revenueOverTime || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#5FB3A3"
                                    strokeWidth={3}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <div className="chart-title">Product Performance</div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={productPerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="productName" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="totalSold" fill="#E8D56D" name="Units Sold" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <div className="chart-title">Order Status Distribution</div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData?.statusDistribution || []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.status}: ${entry.count}`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {chartData?.statusDistribution?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
