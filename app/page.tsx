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
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: var(--spacing-xl);
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .feature-card {
            position: relative;
            text-align: center;
            padding: var(--spacing-3xl) var(--spacing-xl);
            border-radius: var(--radius-lg);
            overflow: hidden;
            min-height: 300px;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            background-size: cover;
            background-position: center;
            box-shadow: var(--shadow-md);
            transition: all var(--transition-base);
          }

          .feature-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-xl);
          }

          .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7));
            z-index: 1;
          }
          
          .feature-card > * {
            position: relative;
            z-index: 2;
            color: white;
          }
          
          .feature-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: var(--spacing-sm);
            color: white;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }

          .feature-card p {
            color: rgba(255,255,255,0.95);
            font-size: 1rem;
            line-height: 1.6;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
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

            .feature-card {
              min-height: 250px;
            }
          }

          .about-section {
            padding: var(--spacing-3xl) var(--spacing-lg);
            background: white;
          }

          .about-container {
            max-width: 900px;
            margin: 0 auto;
          }

          .about-content {
            margin-top: var(--spacing-xl);
          }

          .about-text h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: var(--spacing-md);
            color: var(--color-gray-900);
          }

          .about-text p {
            font-size: 1.125rem;
            line-height: 1.8;
            color: var(--color-gray-700);
            margin-bottom: var(--spacing-lg);
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
            <div className="feature-card" style={{ backgroundImage: 'url(/assets/features/natural.jpg)' }}>
              <h3 className="feature-title">Natural Ingredients</h3>
              <p>Made with natural, eco-friendly materials that are safe for you and the environment.</p>
            </div>
            <div className="feature-card" style={{ backgroundImage: 'url(/assets/features/clock.jpg)' }}>
              <h3 className="feature-title">Long-Lasting</h3>
              <p>Each patch provides all-day protection against unpleasant odors.</p>
            </div>
            <div className="feature-card" style={{ backgroundImage: 'url(/assets/features/shoes.jpg)' }}>
              <h3 className="feature-title">Easy to Use</h3>
              <p>Simply peel and stick inside your shoes for instant freshness.</p>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="about-section">
          <div className="about-container">
            <h2 className="section-title">About ScentFix</h2>
            <div className="about-content">
              <div className="about-text">
                <h3>Our Story</h3>
                <p>
                  ScentFix was born from a simple idea: everyone deserves fresh, odor-free shoes.
                  We understand the embarrassment and discomfort that smelly shoes can cause,
                  and we're here to provide a simple, effective solution.
                </p>
                <p>
                  Our premium shoe deodorant patches are carefully crafted using natural ingredients
                  that neutralize odors at their source. Unlike traditional sprays and powders,
                  our patches provide long-lasting protection that keeps your shoes fresh all day long.
                </p>
                <h3 style={{ marginTop: 'var(--spacing-xl)' }}>Our Mission</h3>
                <p>
                  To make fresh, confident steps accessible to everyone through innovative,
                  eco-friendly shoe care solutions. We believe that small details make a big difference
                  in your daily confidence and comfort.
                </p>
              </div>
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
                <Link href={`/products/${product._id || product.id}`} key={product._id || product.id} className="product-card-home">
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
