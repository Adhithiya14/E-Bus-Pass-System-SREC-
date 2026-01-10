import React from 'react';
import { Home, Map } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            fontFamily: "'Inter', sans-serif",
            padding: '20px',
            textAlign: 'center'
        }}>
            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '32px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                maxWidth: '480px',
                width: '100%'
            }}>
                <div style={{
                    fontSize: '80px',
                    fontWeight: '900',
                    color: '#e2e8f0',
                    lineHeight: '1',
                    marginBottom: '20px'
                }}>
                    404
                </div>

                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: '#0f172a',
                    marginBottom: '12px'
                }}>
                    Page Not Found
                </h1>

                <p style={{
                    color: '#64748b',
                    marginBottom: '32px',
                    lineHeight: '1.6'
                }}>
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <Link
                    to="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px 28px',
                        background: '#1F7A5A',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '16px',
                        fontWeight: '600',
                        fontSize: '16px',
                        boxShadow: '0 4px 12px rgba(31, 122, 90, 0.2)',
                        transition: 'transform 0.2s'
                    }}
                >
                    <Home size={20} />
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
