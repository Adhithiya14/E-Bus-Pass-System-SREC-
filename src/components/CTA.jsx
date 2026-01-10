import React from 'react';
import { ArrowRight } from 'lucide-react';
import './CTA.css';

const CTA = ({ onOpenLogin }) => {
    return (
        <section className="cta-section">
            <div className="container cta-content">
                <h2 className="cta-title">Ready for a Smarter Campus?</h2>
                <p className="cta-text">Join thousands of students and simplify your daily commute.</p>
                <button className="btn-cta" onClick={() => onOpenLogin('student')}>
                    Register for Bus Pass <ArrowRight size={20} className="cta-icon" />
                </button>
            </div>
        </section>
    );
};

export default CTA;
