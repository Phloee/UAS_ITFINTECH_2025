// @ts-nocheck
'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        birthdate: '',
        gender: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await register(formData);
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
            padding: var(--spacing-xl);
          }
          
          .auth-card {
            max-width: 500px;
            margin: 0 auto;
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
          
          .grid-cols-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-lg);
          }
          
          @media (max-width: 640px) {
            .grid-cols-2 {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

                <div className="auth-card animate-fade-in">
                    <h1 className="auth-title">Create Account</h1>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="grid-cols-2">
                            <div className="form-group">
                                <label>Birthdate</label>
                                <input
                                    type="date"
                                    name="birthdate"
                                    value={formData.birthdate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="your@email.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="08123456789"
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                minLength="6"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    <p className="auth-link">
                        Already have an account? <Link href="/auth/login">Login</Link>
                    </p>
                </div>
            </div>
            <Footer />
        </>
    );
}
