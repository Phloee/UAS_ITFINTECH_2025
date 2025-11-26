// @ts-nocheck
'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            router.push('/products');
        } catch (error) {
            // Error handled by AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="auth-container">
                <style jsx>{`
          .auth-container {
            min-height: calc(100vh - 200px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--spacing-xl);
          }
          
          .auth-card {
            max-width: 450px;
            width: 100%;
            background: white;
            padding: var(--spacing-2xl);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl);
          }
          
          .auth-title {
            text-align: center;
            background: var(--color-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: var(--spacing-xl);
          }
          
          .auth-link {
            text-align: center;
            margin-top: var(--spacing-lg);
            color: var(--color-gray-600);
          }
          
          .auth-link a {
            color: var(--color-primary-teal);
            font-weight: 600;
          }
        `}</style>

                <div className="auth-card animate-fade-in">
                    <h1 className="auth-title">Welcome Back</h1>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="your@email.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <p className="auth-link">
                        Don't have an account? <Link href="/auth/register">Sign up</Link>
                    </p>
                </div>
            </div>
            <Footer />
        </>
    );
}
