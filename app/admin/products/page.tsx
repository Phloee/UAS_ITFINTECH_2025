// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { products as productsAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!user || !user.isAdmin) {
            router.push('/admin/login');
            return;
        }
        fetchProducts();
    }, [user]);

    const fetchProducts = async () => {
        try {
            const response = await productsAPI.getAll();
            setProducts(response.data);
        } catch (error) {
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const formPayload = new FormData();
            formPayload.append('name', formData.name);
            formPayload.append('description', formData.description);
            formPayload.append('price', formData.price);
            formPayload.append('stock', formData.stock);

            if (imageFile) {
                formPayload.append('image', imageFile);
            }

            if (editingProduct) {
                await productsAPI.update(editingProduct._id || editingProduct.id, formPayload);
                toast.success('Product updated successfully');
            } else {
                await productsAPI.create(formPayload);
                toast.success('Product created successfully');
            }

            setShowForm(false);
            setEditingProduct(null);
            setFormData({ name: '', description: '', price: '', stock: '' });
            setImageFile(null);
            await fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save product');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            stock: product.stock.toString()
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await productsAPI.delete(id);
            toast.success('Product deleted successfully');
            await fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingProduct(null);
        setFormData({ name: '', description: '', price: '', stock: '' });
        setImageFile(null);
    };

    if (!user || !user.isAdmin) return null;

    return (
        <div className="admin-products-page">
            <style jsx>{`
        .admin-products-page {
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
        
        .products-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 var(--spacing-lg) var(--spacing-3xl);
        }
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-2xl);
        }
        
        .products-grid {
          display: grid;
          gap: var(--spacing-md);
        }
        
        .product-row {
          background: white;
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
          display: grid;
          grid-template-columns: 100px 1fr auto;
          gap: var(--spacing-lg);
          align-items: center;
        }
        
        @media (max-width: 768px) {
          .product-row {
            grid-template-columns: 80px 1fr;
            gap: var(--spacing-md);
          }
          
          .product-image {
            width: 80px;
            height: 80px;
          }
          
          .product-actions {
            grid-column: 1 / -1;
            justify-content: flex-end;
            margin-top: var(--spacing-sm);
          }
        }
        
        .product-image {
          width: 100px;
          height: 100px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--color-gray-100);
          position: relative;
        }
        
        .product-info {
          flex: 1;
        }
        
        .product-name {
          font-weight: 600;
          font-size: 1.125rem;
          margin-bottom: var(--spacing-xs);
        }
        
        .product-meta {
          color: var(--color-gray-600);
          font-size: 0.875rem;
        }
        
        .product-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--spacing-lg);
        }
        
        .modal-content {
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--spacing-2xl);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-header {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: var(--spacing-xl);
        }
        
        .form-actions {
          display: flex;
          gap: var(--spacing-md);
          margin-top: var(--spacing-xl);
        }
        
        .file-input-wrapper {
          position: relative;
          border: 2px dashed var(--color-gray-300);
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-base);
        }
        
        .file-input-wrapper:hover {
          border-color: var(--color-primary-teal);
        }
        
        .file-input-wrapper input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
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

            <div className="products-content">
                <div className="page-header">
                    <h1>Product Management</h1>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        + Add Product
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((product) => (
                            <div key={product._id || product.id} className="product-row">
                                <div className="product-image">
                                    <Image
                                        src={product.image || '/assets/products/placeholder.jpg'}
                                        alt={product.name}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="product-info">
                                    <div className="product-name">{product.name}</div>
                                    <div className="product-meta">
                                        Rp {product.price.toLocaleString('id-ID')} • Stock: {product.stock}
                                    </div>
                                </div>
                                <div className="product-actions">
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleEdit(product)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleDelete(product._id || product.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={cancelForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-header">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows={4}
                                />
                            </div>

                            <div className="form-group">
                                <label>Price (Rp)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Stock</label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Product Image</label>
                                <div className="file-input-wrapper">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                    />
                                    <div>
                                        {imageFile ? imageFile.name : 'Click to upload image'}
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={cancelForm}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                    style={{ flex: 1 }}
                                >
                                    {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
