// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { products as productsAPI, cart as cartAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(params.id);
      setProduct(response.data);
    } catch (error) {
      toast.error('Product not found');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    // Check if user is logged in
    if (!user || user.isAdmin) {
      toast.error('Please login to add items to cart');
      router.push('/auth/login');
      return;
    }

    try {
      await cartAPI.add({ productId: product._id || product.id, quantity });
      toast.success(`Added ${quantity} item(s) to cart!`);
      router.push('/cart');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add to cart');
    }
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

  if (!product) return null;

  return (
    <>
      <Navbar />

      <main className="product-detail">
        <style jsx>{`
          .product-detail {
            max-width: 1200px;
            margin: 0 auto;
            padding: var(--spacing-3xl) var(--spacing-lg);
            min-height: calc(100vh - 200px);
          }
          
          .product-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-3xl);
            align-items: start;
          }
          
          .image-section {
            position: sticky;
            top: 100px;
          }
          
          .product-image-wrapper {
            position: relative;
            width: 100%;
            aspect-ratio: 1;
            background: var(--color-gray-100);
            border-radius: var(--radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-lg);
          }
          
          .product-info {
            padding: var(--spacing-lg);
          }
          
          .product-name {
            font-size: 2.5rem;
            margin-bottom: var(--spacing-md);
          }
          
          .product-price {
            font-size: 2rem;
            font-weight: 700;
            background: var(--color-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: var(--spacing-lg);
          }
          
          .stock-info {
            display: inline-block;
            padding: var(--spacing-sm) var(--spacing-md);
            background: var(--color-gray-100);
            border-radius: var(--radius-full);
            font-size: 0.875rem;
            color: var(--color-gray-700);
            margin-bottom: var(--spacing-xl);
          }
          
          .stock-info.out-of-stock {
            background: #fee2e2;
            color: #991b1b;
          }
          
          .product-description {
            color: var(--color-gray-700);
            line-height: 1.8;
            margin-bottom: var(--spacing-xl);
            padding: var(--spacing-lg);
            background: var(--color-gray-50);
            border-radius: var(--radius-md);
          }
          
          .quantity-selector {
            margin-bottom: var(--spacing-xl);
          }
          
          .quantity-label {
            font-weight: 600;
            margin-bottom: var(--spacing-sm);
            display: block;
          }
          
          .quantity-controls {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
          }
          
          .quantity-btn {
            width: 40px;
            height: 40px;
            border: 2px solid var(--color-gray-300);
            background: white;
            border-radius: var(--radius-md);
            cursor: pointer;
            font-size: 1.25rem;
            transition: all var(--transition-base);
          }
          
          .quantity-btn:hover:not(:disabled) {
            border-color: var(--color-primary-teal);
            color: var(--color-primary-teal);
          }
          
          .quantity-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }
          
          .quantity-display {
            font-size: 1.25rem;
            font-weight: 600;
            min-width: 40px;
            text-align: center;
          }
          
          .actions {
            display: flex;
            gap: var(--spacing-md);
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
          
          @media (max-width: 768px) {
            .product-container {
              grid-template-columns: 1fr;
              gap: var(--spacing-xl);
            }
            
            .image-section {
              position: relative;
              top: 0;
            }
            
            .product-name {
              font-size: 2rem;
            }
          }
        `}</style>

        <a href="/products" className="back-link">← Back to Products</a>

        <div className="product-container animate-fade-in">
          <div className="image-section">
            <div className="product-image-wrapper">
              <Image
                src={product.image || '/assets/products/placeholder.jpg'}
                alt={product.name}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          </div>

          <div className="product-info">
            <h1 className="product-name">{product.name}</h1>

            <div className="product-price">
              Rp {product.price.toLocaleString('id-ID')}
            </div>

            <div className={`stock-info ${product.stock === 0 ? 'out-of-stock' : ''}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="quantity-selector">
              <label className="quantity-label">Quantity:</label>
              <div className="quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="quantity-display">{quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{ flex: 1 }}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
