// @ts-nocheck
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { AuthProvider } from './contexts/AuthContext';
import FloatingCart from './components/FloatingCart';

export const metadata = {
    title: 'ScentFix - Premium Shoe Deodorant Patches',
    description: 'Fresh, odor-free shoes with ScentFix premium deodorant patches',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    {children}
                    <FloatingCart />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: '#fff',
                                color: '#1a1a1a',
                                padding: '16px',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#5FB3A3',
                                    secondary: '#fff',
                                },
                            },
                        }}
                    />
                </AuthProvider>
            </body>
        </html>
    );
}
