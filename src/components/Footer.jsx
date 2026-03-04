import React from 'react';
import './Footer.css';
import srecLogo from '../assets/srec_logo.png';

const Footer = ({ onOpenLogin }) => {
    return (
        <footer id="contact" className="footer-section">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <img src={srecLogo} alt="SREC Logo" className="footer-logo-img" />
                        <p className="tagline">Scan. Verify. Ride.</p>
                        <p className="footer-desc">
                            Transforming campus transportation with secure, paperless QR bus passes.
                        </p>
                    </div>

                    <div className="footer-links">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><button className="footer-link-btn" onClick={() => onOpenLogin('student', 'register')}>Student Registration</button></li>
                            <li><button className="footer-link-btn" onClick={() => onOpenLogin('driver', 'register')}>Driver Registration</button></li>
                            <li><button className="footer-link-btn" onClick={() => onOpenLogin('admin', 'register')}>Admin Registration</button></li>
                        </ul>
                    </div>

                    <div className="footer-contact">
                        <h3>Contact</h3>
                        <p>support@qride.edu</p>
                        <p>+91 98765 43210</p>
                        <p>College Campus, Gate 4</p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} QRide – SREC Campus Bus System. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
