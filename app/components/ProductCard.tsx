// @ts-nocheck
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cart as cartAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product, onAddToCart }) {
  const router = useRouter();
  const { user } = useAuth();

  const handleAddToCart = async () => {
    // Check if user is logged in
    if (!user || user.isAdmin) {
      toast.error('Please login to add items to cart');
      router.push('/auth/login');
      return;
    }

    try {
      await cartAPI.add({ productId: product._id || product.id, quantity: 1 });
      toast.success('Added to cart!');
      if (onAddToCart) onAddToCart();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add to cart');
    }
  };

  return (
    <div className="product-card card">
      <style jsx>{`
        .product-card {
          overflow: hidden;
          transition: all var(--transition-base);
        }
        
        .product-card:hover {
          transform: translateY(-4px);
        }
        
        .product-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          background: var(--color-gray-100);
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: var(--spacing-md);
        }
        
        .product-image {
          object-fit: cover;
        }
        
        .product-info h3 {
          margin-bottom: var(--spacing-sm);
          font-size: 1.25rem;
        }
        
        .product-description {
          color: var(--color-gray-600);
          font-size: 0.875rem;
          margin-bottom: var(--spacing-md);
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .product-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-md);
        }
        
        .product-price {
          font-size: 1.5rem;
          font-weight: 700;
          background: var(--color-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .stock-badge {
          font-size: 0.75rem;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-full);
          background: var(--color-gray-100);
          color: var(--color-gray-600);
        }
        
        .out-of-stock {
          background: var(--color-error);
          color: white;
        }
      `}</style>

      <Link href={`/products/${product._id || product.id}`}>
        <div className="product-image-wrapper">
          <Image
            src={product.image || '/assets/products/placeholder.jpg'}
            alt={product.name}
            fill
            className="product-image"
          />
        </div>
      </Link>

      <div className="product-info">
        <Link href={`/products/${product._id || product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        <p className="product-description">{product.description}</p>

        <div className="product-footer">
          <div>
            <div className="product-price">
              Rp {product.price.toLocaleString('id-ID')}
            </div>
            <div className={`stock-badge ${product.stock === 0 ? 'out-of-stock' : ''}`}>
              {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn btn-primary btn-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
