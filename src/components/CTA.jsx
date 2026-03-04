import React from 'react';
import { ArrowRight, Shield } from 'lucide-react';
import './CTA.css';

const CTA = ({ onOpenLogin }) => {
    return (
        <section className="cta-section">
            <div className="container cta-content">
                <h2 className="cta-title">Ready for a Smarter Campus?</h2>
                <p className="cta-text">Join thousands of students and simplify your daily commute.</p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn-cta" onClick={() => onOpenLogin('student', 'register')}>
                        Apply for Bus Pass <ArrowRight size={20} className="cta-icon" />
                    </button>
                    <button className="btn-cta-secondary" style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '2px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        padding: '12px 25px',
                        borderRadius: '30px',
                        fontWeight: '700',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }} onClick={() => onOpenLogin('admin', 'register')}>
                        Admin Account <Shield size={18} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CTA;
