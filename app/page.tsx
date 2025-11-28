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
          /* === HERO SECTION === */
          .hero {
            position: relative;
            background: linear-gradient(135deg, #E8D56D 0%, #5FB3A3 100%);
            color: white;
            padding: 120px var(--spacing-lg) 100px;
            overflow: hidden;
          }

          .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="2" fill="white" opacity="0.1"/></svg>');
            animation: float 20s linear infinite;
          }

          @keyframes float {
            from { background-position: 0 0; }
            to { background-position: 100px 100px; }
          }

          .hero-content {
            position: relative;
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-3xl);
            align-items: center;
          }

          .hero-text h1 {
            font-size: 3.5rem;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: var(--spacing-lg);
            animation: slideInLeft 0.8s ease-out;
          }

          .hero-text p {
            font-size: 1.25rem;
            line-height: 1.6;
            margin-bottom: var(--spacing-2xl);
            opacity: 0.95;
            animation: slideInLeft 0.8s ease-out 0.2s backwards;
          }

          .hero-buttons {
            display: flex;
            gap: var(--spacing-md);
            animation: slideInLeft 0.8s ease-out 0.4s backwards;
          }

          .hero-btn {
            padding: var(--spacing-md) var(--spacing-2xl);
            border-radius: var(--radius-full);
            font-weight: 600;
            font-size: 1.125rem;
            transition: all var(--transition-base);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .hero-btn-primary {
            background: white;
            color: var(--color-gray-900);
          }

          .hero-btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          }

          .hero-btn-secondary {
            background: transparent;
            color: white;
            border: 2px solid white;
          }

          .hero-btn-secondary:hover {
            background: white;
            color: var(--color-primary-teal);
            transform: translateY(-3px);
          }

          .hero-image {
            position: relative;
            animation: slideInRight 0.8s ease-out;
          }

          .hero-image-wrapper {
            position: relative;
            width: 100%;
            height: 400px;
            border-radius: var(--radius-xl);
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }

          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          /* === FEATURES SECTION === */
          .features {
            padding: var(--spacing-3xl) var(--spacing-lg);
            background: var(--color-gray-50);
          }

          .features-container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .section-header {
            text-align: center;
            margin-bottom: var(--spacing-3xl);
          }

          .section-badge {
            display: inline-block;
            background: linear-gradient(135deg, #E8D56D 0%, #5FB3A3 100%);
            color: white;
            padding: var(--spacing-xs) var(--spacing-lg);
            border-radius: var(--radius-full);
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: var(--spacing-md);
          }

          .section-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--color-gray-900);
            margin-bottom: var(--spacing-md);
          }

          .section-subtitle {
            font-size: 1.125rem;
            color: var(--color-gray-600);
            max-width: 600px;
            margin: 0 auto;
          }

          .features-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--spacing-xl);
          }

          .feature-card {
            background: white;
            padding: var(--spacing-2xl);
            border-radius: var(--radius-xl);
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            transition: all var(--transition-base);
            border: 2px solid transparent;
          }

          .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
            border-color: #5FB3A3;
          }

          .feature-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto var(--spacing-lg);
            background: linear-gradient(135deg, #E8D56D 0%, #5FB3A3 100%);
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
          }

          .feature-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: var(--spacing-sm);
            color: var(--color-gray-900);
          }

          .feature-description {
            color: var(--color-gray-600);
            line-height: 1.6;
          }

          /* === ABOUT SECTION === */
          .about-section {
            padding: var(--spacing-3xl) var(--spacing-lg);
            background: white;
          }

          .about-container {
            max-width: 900px;
            margin: 0 auto;
          }

          .about-content {
            background: var(--color-gray-50);
            padding: var(--spacing-3xl);
            border-radius: var(--radius-xl);
            border-left: 4px solid #5FB3A3;
          }

          .about-text h3 {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: var(--spacing-md);
            color: var(--color-gray-900);
          }

          .about-text p {
            font-size: 1.125rem;
            line-height: 1.8;
            color: var(--color-gray-700);
            margin-bottom: var(--spacing-lg);
          }

          /* === PRODUCTS SECTION === */
          .products-section {
            padding: var(--spacing-3xl) var(--spacing-lg);
            background: var(--color-gray-50);
          }

          .products-container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .products-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: var(--spacing-xl);
            margin-bottom: var(--spacing-2xl);
          }

          .product-card {
            background: white;
            border-radius: var(--radius-xl);
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            transition: all var(--transition-base);
            text-decoration: none;
            color: inherit;
          }

          .product-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          }

          .product-image-wrapper {
            position: relative;
            width: 100%;
            aspect-ratio: 1;
            background: var(--color-gray-100);
            overflow: hidden;
          }

          .product-image-wrapper img {
            transition: transform 0.4s ease;
          }

          .product-card:hover .product-image-wrapper img {
            transform: scale(1.1);
          }

          .product-info {
            padding: var(--spacing-lg);
          }

          .product-name {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: var(--spacing-sm);
            color: var(--color-gray-900);
          }

          .product-price {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #E8D56D 0%, #5FB3A3 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: var(--spacing-md);
          }

          .view-all-btn {
            display: block;
            max-width: 300px;
            margin: 0 auto;
            text-align: center;
            padding: var(--spacing-md) var(--spacing-2xl);
            background: white;
            color: #5FB3A3;
            border: 2px solid #5FB3A3;
            border-radius: var(--radius-full);
            font-weight: 600;
            font-size: 1.125rem;
            transition: all var(--transition-base);
          }

          .view-all-btn:hover {
            background: #5FB3A3;
            color: white;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(95, 179, 163, 0.3);
          }

          /* === RESPONSIVE === */
          @media (max-width: 1024px) {
            .hero-content {
              grid-template-columns: 1fr;
              gap: var(--spacing-2xl);
            }

            .hero-text {
              text-align: center;
            }

            .hero-buttons {
              justify-content: center;
            }

            .features-grid {
              grid-template-columns: 1fr;
            }

            .products-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 768px) {
            .hero {
              padding: 80px var(--spacing-md) 60px;
            }

            .hero-text h1 {
              font-size: 2.5rem;
            }

            .hero-text p {
              font-size: 1rem;
            }

            .hero-image-wrapper {
              height: 300px;
            }

            .section-title {
              font-size: 2rem;
            }

            .section-subtitle {
              font-size: 1rem;
            }

            .products-grid {
              grid-template-columns: 1fr;
            }

            .about-content {
              padding: var(--spacing-xl);
            }

            .hero-buttons {
              flex-direction: column;
            }

            .hero-btn {
              width: 100%;
              text-align: center;
            }
          }

          @media (max-width: 480px) {
            .hero-text h1 {
              font-size: 2rem;
            }

            .feature-card {
              padding: var(--spacing-lg);
            }

            .about-text h3 {
              font-size: 1.5rem;
            }
          }
        `}</style>

        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Keep Your Shoes Fresh with ScentFix</h1>
              <p>Premium shoe deodorant patches designed to eliminate odors and keep your shoes smelling fresh all day long.</p>
              <div className="hero-buttons">
                <Link href="/products" className="hero-btn hero-btn-primary">Shop Now</Link>
                <Link href="/auth/register" className="hero-btn hero-btn-secondary">Sign Up Free</Link>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-image-wrapper">
                <Image
                  src="/assets/hero-product.jpg"
                  alt="ScentFix Product"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features">
          <div className="features-container">
            <div className="section-header">
              <span className="section-badge">Why Choose Us</span>
              <h2 className="section-title">Premium Shoe Care</h2>
              <p className="section-subtitle">
                Discover what makes ScentFix the best choice for keeping your shoes fresh
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🌿</div>
                <h3 className="feature-title">Natural Ingredients</h3>
                <p className="feature-description">
                  Made with natural, eco-friendly materials that are safe for you and the environment.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⏰</div>
                <h3 className="feature-title">Long-Lasting</h3>
                <p className="feature-description">
                  Each patch provides all-day protection against unpleasant odors.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">✨</div>
                <h3 className="feature-title">Easy to Use</h3>
                <p className="feature-description">
                  Simply peel and stick inside your shoes for instant freshness.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="about-section">
          <div className="about-container">
            <div className="section-header">
              <span className="section-badge">Our Story</span>
              <h2 className="section-title">About ScentFix</h2>
            </div>

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
        <section className="products-section">
          <div className="products-container">
            <div className="section-header">
              <span className="section-badge">Our Products</span>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">
                Explore our premium selection of shoe deodorant patches
              </p>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.slice(0, 3).map((product) => (
                    <Link href={`/products/${product._id || product.id}`} key={product._id || product.id} className="product-card">
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

                <Link href="/products" className="view-all-btn">View All Products →</Link>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
