// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { orders as ordersAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);
  // Auto-poll payment status when pending
  useEffect(() => {
    if (!order || order.paymentStatus !== 'pending') {
      return;
    }

    const interval = setInterval(async () => {
      await checkPaymentStatus(true);
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [order, params.id]);


  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getById(params.id);
      setOrder(response.data);
    } catch (error) {
      toast.error('Order not found');
      router.push('/profile');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (silent = false) => {
    if (!silent) {
      setCheckingStatus(true);
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${params.id}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();

      // Update order with new status
      setOrder((prev: any) => ({
        ...prev,
        status: data.status,
        paymentStatus: data.paymentStatus
      }));

      if (!silent && data.paymentStatus === 'paid') {
        toast.success('Payment confirmed!');
      }
    } catch (error) {
      if (!silent) {
        toast.error('Failed to check payment status');
      }
    } finally {
      if (!silent) {
        setCheckingStatus(false);
      }
    }
  };



  const getPaymentStatusColor = (status: string) => {
    const colors = {
      'paid': '#10b981',
      'pending': '#f59e0b',
      'failed': '#ef4444',
      'expired': '#ef4444'
    };
    return colors[status] || '#6b7280';
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

  const getStatusStep = (status: string) => {
    const steps = {
      'pending': 0,
      'being processed': 1,
      'shipped': 2,
      'delivered': 3,
      'cancelled': -1
    };
    return steps[status] || 0;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
      </>
    );
  }

  if (!order) return null;

  const currentStep = getStatusStep(order.status);

  return (
    <>
      <Navbar />

      <main className="order-detail-page">
        <style jsx>{`
          .order-detail-page {
            max-width: 900px;
            margin: 0 auto;
            padding: var(--spacing-3xl) var(--spacing-lg);
            min-height: calc(100vh - 200px);
          }
          
          .back-link {
            display: inline-block;
            margin-bottom: var(--spacing-lg);
            color: var(--color-gray-600);
            text-decoration: none;
            transition: color var(--transition-base);
          }
          
          .back-link:hover {
            color: var(--color-primary-teal);
          }
          
          .page-header {
            margin-bottom: var(--spacing-2xl);
          }
          
          .order-number {
            background: var(--color-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 2rem;
            margin-bottom: var(--spacing-sm);
          }
          
          .order-date {
            color: var(--color-gray-600);
          }
          
          .status-tracker {
            background: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
            padding: var(--spacing-xl);
            margin-bottom: var(--spacing-xl);
          }
          
          .tracker-title {
            font-weight: 600;
            margin-bottom: var(--spacing-lg);
          }
          
          .tracker-steps {
            display: flex;
            justify-content: space-between;
            position: relative;
            margin-bottom: var(--spacing-lg);
          }
          
          .tracker-line {
            position: absolute;
            top: 20px;
            left: 10%;
            right: 10%;
            height: 4px;
            background: var(--color-gray-200);
            z-index: 0;
          }
          
          .tracker-line-progress {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background: var(--color-gradient);
            transition: width 0.5s ease;
          }
          
          .tracker-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            z-index: 1;
            flex: 1;
          }
          
          .step-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: white;
            border: 4px solid var(--color-gray-300);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: var(--spacing-sm);
            transition: all var(--transition-base);
          }
          
          .step-circle.active {
            border-color: var(--color-primary-teal);
            background: var(--color-primary-teal);
            color: white;
          }
          
          .step-circle.completed {
            border-color: var(--color-primary-teal);
            background: var(--color-primary-teal);
            color: white;
          }
          
          .step-label {
            font-size: 0.875rem;
            text-align: center;
            color: var(--color-gray-600);
          }
          
          .step-label.active {
            color: var(--color-primary-teal);
            font-weight: 600;
          }
          
          .order-section {
            background: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
            padding: var(--spacing-xl);
            margin-bottom: var(--spacing-xl);
          }
          
          .section-title {
            font-weight: 600;
            font-size: 1.25rem;
            margin-bottom: var(--spacing-lg);
          }
          
          .order-item {
            display: flex;
            gap: var(--spacing-md);
            padding: var(--spacing-md) 0;
            border-bottom: 1px solid var(--color-gray-100);
          }
          
          .order-item:last-child {
            border-bottom: none;
          }
          
          .item-image {
            width: 80px;
            height: 80px;
            border-radius: var(--radius-md);
            overflow: hidden;
            background: var(--color-gray-100);
            position: relative;
          }
          
          .item-details {
            flex: 1;
          }
          
          .item-name {
            font-weight: 600;
            margin-bottom: var(--spacing-xs);
          }
          
          .item-quantity {
            color: var(--color-gray-600);
            font-size: 0.875rem;
          }
          
          .item-price {
            font-weight: 600;
            text-align: right;
          }
          
          .order-summary {
            border-top: 2px solid var(--color-gray-200);
            padding-top: var(--spacing-md);
            margin-top: var(--spacing-md);
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: var(--spacing-sm);
          }
          
          .summary-total {
            font-weight: 700;
            font-size: 1.25rem;
            margin-top: var(--spacing-md);
          }
          
          .total-amount {
            background: var(--color-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          @media (max-width: 768px) {
            .tracker-steps {
              flex-wrap: wrap;
            }
            
            .tracker-step {
              width: 50%;
              margin-bottom: var(--spacing-lg);
            }
            
            .step-label {
              font-size: 0.75rem;
            }
          }
        `}</style>

        <a href="/profile" className="back-link">← Back to Profile</a>

        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div>
              <h1 className="order-number">{order.orderNumber}</h1>
              <div className="order-date">
                Ordered on {new Date(order.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontWeight: '600',
                fontSize: '0.875rem',
                backgroundColor: `${getPaymentStatusColor(order.paymentStatus)}20`,
                color: getPaymentStatusColor(order.paymentStatus),
                border: `1px solid ${getPaymentStatusColor(order.paymentStatus)}`
              }}>
                Payment: {order.paymentStatus?.toUpperCase() || 'PENDING'}
              </div>
              {order.paymentStatus === 'pending' && (
                <>
                  <br />
                  <button
                    className="btn btn-sm"
                    onClick={() => checkPaymentStatus(false)}
                    disabled={checkingStatus}
                    style={{
                      marginTop: '0.5rem',
                      fontSize: '0.875rem',
                      background: 'var(--color-gradient)',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: checkingStatus ? 'not-allowed' : 'pointer',
                      opacity: checkingStatus ? 0.6 : 1
                    }}
                  >
                    {checkingStatus ? '⏳ Checking...' : '🔄 Refresh Payment Status'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="status-tracker">
          <div className="tracker-title">Order Status</div>

          <div className="tracker-steps">
            <div className="tracker-line">
              <div
                className="tracker-line-progress"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>

            {['Pending', 'Processing', 'Shipped', 'Delivered'].map((label, index) => (
              <div key={index} className="tracker-step">
                <div
                  className={`step-circle ${index < currentStep ? 'completed' : index === currentStep ? 'active' : ''
                    }`}
                >
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <div
                  className={`step-label ${index === currentStep ? 'active' : ''}`}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-section">
          <div className="section-title">Order Items</div>

          {order.items?.map((item) => (
            <div key={item.productId} className="order-item">
              <div className="item-image">
                <Image
                  src={item.image || '/assets/products/placeholder.jpg'}
                  alt={item.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="item-details">
                <div className="item-name">{item.name}</div>
                <div className="item-quantity">
                  Quantity: {item.quantity} × Rp {item.price?.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="item-price">
                Rp {((item.price || 0) * item.quantity).toLocaleString('id-ID')}
              </div>
            </div>
          ))}

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>Rp {order.totalAmount?.toLocaleString('id-ID')}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>FREE</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total:</span>
              <span className="total-amount">
                Rp {order.totalAmount?.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
