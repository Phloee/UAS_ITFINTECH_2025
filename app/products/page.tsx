// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { products as productsAPI } from '../utils/api';

export default function ProductsPage() {
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

            <main className="products-page">
                <style jsx>{`
          .products-page {
            min-height: 100vh;
            padding: var(--spacing-3xl) var(--spacing-lg);
          }
          
          .page-header {
            text-align: center;
            margin-bottom: var(--spacing-3xl);
          }
          
          .page-title {
            background: var(--color-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: var(--spacing-md);
          }
          
          .page-description {
            color: var(--color-gray-600);
            max-width: 600px;
            margin: 0 auto;
          }
          
          .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: var(--spacing-xl);
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .empty-state {
            text-align: center;
            padding: var(--spacing-3xl);
            color: var(--color-gray-500);
          }
          
          @media (max-width: 768px) {
            .products-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

                <div className="page-header animate-fade-in">
                    <h1 className="page-title">Our Products</h1>
                    <p className="page-description">
                        Premium shoe deodorant patches designed to keep your shoes fresh all day long.
                    </p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <h3>No products available</h3>
                        <p>Check back soon for new products!</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id || product.id}
                                product={product}
                                onAddToCart={fetchProducts}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </>
    );
}
