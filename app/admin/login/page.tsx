// @ts-nocheck
'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { adminLogin } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await adminLogin(username, password);
            router.push('/admin/dashboard');
        } catch (error) {
            // Error handled by AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <style jsx>{`
        .admin-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-gradient);
          padding: var(--spacing-lg);
        }
        
        .login-card {
          max-width: 450px;
          width: 100%;
          background: white;
          padding: var(--spacing-3xl);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
        }
        
        .login-title {
          text-align: center;
          font-size: 2rem;
          margin-bottom: var(--spacing-xs);
        }
        
        .login-subtitle {
          text-align: center;
          color: var(--color-gray-600);
          margin-bottom: var(--spacing-2xl);
        }
        
        .logo {
          text-align: center;
          margin-bottom: var(--spacing-xl);
          font-size: 2.5rem;
          font-weight: 700;
          background: var(--color-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

            <div className="login-card animate-fade-in">
                <div className="logo">ScentFix</div>
                <h1 className="login-title">Admin Panel</h1>
                <p className="login-subtitle">Sign in to access admin dashboard</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Enter admin username"
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter password"
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', color: 'var(--color-gray-600)', fontSize: '0.875rem' }}>
                    <a href="/" style={{ color: 'var(--color-primary-teal)' }}>← Back to website</a>
                </p>
            </div>
        </div>
    );
}
