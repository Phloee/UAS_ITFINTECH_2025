// @ts-nocheck
'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useEffect, useState } from 'react';
import { products as productsAPI } from './utils/api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main>
        <style jsx>{`
          .hero {
            background: linear-gradient(135deg, #E8D56D 0%, #5FB3A3 100%);
            color: white;
            padding: var(--spacing-3xl) var(--spacing-lg);
            text-align: center;
          }
          
          .hero h1 {
            font-size: 3rem;
            margin-bottom: var(--spacing-lg);
            animation: fadeIn 0.8s ease-out;
          }
          
          .hero p {
            font-size: 1.25rem;
            margin-bottom: var(--spacing-xl);
            opacity: 0.95;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .hero-buttons {
            display: flex;
            gap: var(--spacing-md);
            justify-content: center;
            flex-wrap: wrap;
          }
          
          .hero-btn {
            background: white;
            color: var(--color-gray-900);
            padding: var(--spacing-md) var(--spacing-2xl);
            border-radius: var(--radius-md);
            font-weight: 600;
            font-size: 1.125rem;
            transition: all var(--transition-base);
            box-shadow: var(--shadow-lg);
          }
          
          .hero-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-xl);
          }
          
          .section {
            padding: var(--spacing-3xl) var(--spacing-lg);
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .section-title {
            text-align: center;
            margin-bottom: var(--spacing-2xl);
          }
          
          .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: var(--spacing-xl);
          }
          
          .product-card-home {
            background: white;
            border-radius: var(--radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-md);
            transition: all var(--transition-base);
          }
          
          .product-card-home:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-xl);
          }
          
          .product-image-wrapper {
            position: relative;
            width: 100%;
            aspect-ratio: 1;
            background: var(--color-gray-100);
          }
          
          .product-info {
            padding: var(--spacing-lg);
          }
          
          .product-name {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: var(--spacing-sm);
          }
          
          .product-price {
            font-size: 1.5rem;
            font-weight: 700;
            background: var(--color-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: var(--spacing-md);
          }
          
          .features {
            background: var(--color-gray-50);
            padding: var(--spacing-3xl) var(--spacing-lg);
          }
          
          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--spacing-xl);
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .feature-card {
            text-align: center;
            padding: var(--spacing-xl);
          }
          
          .feature-icon {
            font-size: 3rem;
            margin-bottom: var(--spacing-md);
          }
          
          .feature-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: var(--spacing-sm);
          }
          
          @media (max-width: 768px) {
            .hero h1 {
              font-size: 2rem;
            }
            
            .hero p {
              font-size: 1rem;
            }
            
            .products-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        {/* Hero Section */}
        <section className="hero">
          <h1>Keep Your Shoes Fresh with ScentFix</h1>
          <p>Premium shoe deodorant patches designed to eliminate odors and keep your shoes smelling fresh all day long.</p>
          <div className="hero-buttons">
            <Link href="/products" className="hero-btn">Shop Now</Link>
            <Link href="/auth/register" className="hero-btn">Sign Up Today</Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <h2 className="section-title">Why Choose ScentFix?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌿</div>
              <h3 className="feature-title">Natural Ingredients</h3>
              <p>Made with natural, eco-friendly materials that are safe for you and the environment.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3 className="feature-title">Long-Lasting</h3>
              <p>Each patch provides all-day protection against unpleasant odors.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3 className="feature-title">Easy to Use</h3>
              <p>Simply peel and stick inside your shoes for instant freshness.</p>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="section">
          <h2 className="section-title">Our Products</h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
            </div>
          ) : (
            <div className="products-grid">
              {products.slice(0, 3).map((product) => (
                <Link href={`/products/${product.id}`} key={product.id} className="product-card-home">
                  <div className="product-image-wrapper">
                    <Image
                      src={product.image || '/assets/products/placeholder.jpg'}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price">Rp {product.price.toLocaleString('id-ID')}</div>
                    <button className="btn btn-primary" style={{ width: '100%' }}>View Details</button>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
            <Link href="/products" className="btn btn-outline btn-lg">View All Products</Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
