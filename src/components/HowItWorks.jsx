import React from 'react';
import { Scan, CheckCircle, Bus } from 'lucide-react';
import './HowItWorks.css';

const HowItWorks = () => {
    return (
        <section id="status" className="how-section">
            <div className="container">
                <div className="section-header text-center">
                    <h2 className="section-title">How It Works</h2>
                    <div className="title-underline"></div>
                </div>

                <div className="timeline-container">
                    <div className="timeline-line"></div>

                    <div className="timeline-step" data-aos="zoom-in">
                        <div className="step-circle">1</div>
                        <div className="step-icon">
                            <Scan size={32} />
                        </div>
                        <div className="step-content">
                            <h3>Scan</h3>
                            <p>Apply online and receive your unique QR bus pass.</p>
                        </div>
                    </div>

                    <div className="timeline-step" data-aos="zoom-in" data-aos-delay="200">
                        <div className="step-circle">2</div>
                        <div className="step-icon">
                            <CheckCircle size={32} />
                        </div>
                        <div className="step-content">
                            <h3>Verify</h3>
                            <p>Bus admin scans your QR code to validate your status instantly.</p>
                        </div>
                    </div>

                    <div className="timeline-step" data-aos="zoom-in" data-aos-delay="400">
                        <div className="step-circle">3</div>
                        <div className="step-icon">
                            <Bus size={32} />
                        </div>
                        <div className="step-content">
                            <h3>Ride</h3>
                            <p>Enjoy a safe, secure, and hassle-free commute to campus.</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
