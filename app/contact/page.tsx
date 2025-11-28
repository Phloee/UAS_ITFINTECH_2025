// @ts-nocheck
'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
    const handleWhatsAppClick = () => {
        window.open('https://wa.me/6287870700600', '_blank');
    };

    return (
        <>
            <Navbar />

            <main className="contact-page">
                <style jsx>{`
          .contact-page {
            min-height: calc(100vh - 200px);
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: var(--spacing-3xl) var(--spacing-lg);
          }

          .contact-container {
            max-width: 800px;
            margin: 0 auto;
          }

          .contact-header {
            text-align: center;
            margin-bottom: var(--spacing-3xl);
          }

          .page-title {
            font-size: 3rem;
            font-weight: 700;
            background: var(--color-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: var(--spacing-md);
          }

          .page-subtitle {
            font-size: 1.125rem;
            color: var(--color-gray-600);
            max-width: 600px;
            margin: 0 auto;
          }

          .contact-card {
            background: white;
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-lg);
            padding: var(--spacing-3xl);
            text-align: center;
          }

          .contact-info {
            margin-bottom: var(--spacing-2xl);
          }

          .contact-label {
            font-size: 0.875rem;
            color: var(--color-gray-600);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: var(--spacing-sm);
          }

          .contact-name {
            font-size: 2rem;
            font-weight: 600;
            color: var(--color-gray-900);
            margin-bottom: var(--spacing-md);
          }

          .contact-phone {
            font-size: 1.25rem;
            color: var(--color-gray-700);
            margin-bottom: var(--spacing-xl);
          }

          .contact-description {
            font-size: 1rem;
            color: var(--color-gray-600);
            line-height: 1.6;
            margin-bottom: var(--spacing-2xl);
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
          }

          .whatsapp-btn {
            display: inline-flex;
            align-items: center;
            gap: var(--spacing-md);
            background: #25D366;
            color: white;
            padding: var(--spacing-lg) var(--spacing-2xl);
            border-radius: var(--radius-full);
            font-size: 1.125rem;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all var(--transition-base);
            box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
          }

          .whatsapp-btn:hover {
            background: #20BA5A;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(37, 211, 102, 0.4);
          }

          .whatsapp-icon {
            font-size: 1.5rem;
          }

          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--spacing-lg);
            margin-top: var(--spacing-3xl);
          }

          .feature-card {
            background: var(--color-gray-50);
            padding: var(--spacing-lg);
            border-radius: var(--radius-lg);
            text-align: center;
          }

          .feature-icon {
            font-size: 2rem;
            margin-bottom: var(--spacing-sm);
          }

          .feature-title {
            font-weight: 600;
            color: var(--color-gray-900);
            margin-bottom: var(--spacing-xs);
          }

          .feature-text {
            font-size: 0.875rem;
            color: var(--color-gray-600);
          }

          @media (max-width: 768px) {
            .page-title {
              font-size: 2rem;
            }

            .contact-card {
              padding: var(--spacing-xl);
            }

            .features-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

                <div className="contact-container">
                    <div className="contact-header">
                        <h1 className="page-title">Get in Touch</h1>
                        <p className="page-subtitle">
                            Have questions about our products? We're here to help and happy to hear from you!
                        </p>
                    </div>

                    <div className="contact-card">
                        <div className="contact-info">
                            <div className="contact-label">Customer Support</div>
                            <div className="contact-name">adrianotheking</div>
                            <div className="contact-phone">+62 878-7070-0600</div>
                        </div>

                        <p className="contact-description">
                            Our customer support team is ready to assist you with product inquiries,
                            order tracking, and any questions you may have about keeping your shoes fresh and odor-free.
                        </p>

                        <button className="whatsapp-btn" onClick={handleWhatsAppClick}>
                            <span className="whatsapp-icon">💬</span>
                            Chat on WhatsApp
                        </button>

                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">⚡</div>
                                <div className="feature-title">Fast Response</div>
                                <div className="feature-text">We typically reply within minutes</div>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon">🌟</div>
                                <div className="feature-title">Expert Advice</div>
                                <div className="feature-text">Get personalized product recommendations</div>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon">🛍️</div>
                                <div className="feature-title">Order Support</div>
                                <div className="feature-text">Track orders and get delivery updates</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
