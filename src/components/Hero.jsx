import React from 'react';
import { ArrowRight, Bus, QrCode } from 'lucide-react';
import './Hero.css';

const Hero = ({ onOpenLogin }) => {
    return (
        <section id="home" className="hero-section">
            <div className="container hero-content">
                <div className="hero-text">
                    <h1 className="hero-title fade-in-up">
                        <span className="hero-gradient">Campus.</span> Verified. Riding.
                    </h1>
                    <p className="hero-subtitle fade-in-up delay-1">
                        The ultimate smart, secure, and paperless bus pass solution for your college commute.
                    </p>
                    <div className="hero-actions fade-in-up delay-2">
                        <button className="btn-primary" onClick={() => onOpenLogin('student', 'register')}>
                            Apply for Bus Pass <ArrowRight size={18} />
                        </button>
                        <button className="btn-secondary" onClick={() => document.getElementById('routes')?.scrollIntoView({ behavior: 'smooth' })}>
                            View Bus Routes
                        </button>
                    </div>
                </div>

                <div className="hero-visual fade-in-up delay-3">
                    <div className="visual-circle"></div>
                    <div className="phone-mockup">
                        <div className="screen">
                            <div className="pass-header">SREC Campus Pass</div>
                            <div className="qr-box">
                                <QrCode size={80} color="#1F7A5A" />
                            </div>
                            <div className="pass-details">
                                <div className="line"></div>
                                <div className="line short"></div>
                            </div>
                            <div className="verified-badge">
                                Verified
                            </div>
                        </div>
                    </div>
                    <div className="bus-floater">
                        <Bus size={32} color="white" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
