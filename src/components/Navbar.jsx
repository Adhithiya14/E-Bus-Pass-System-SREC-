import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import srecLogo from '../assets/srec_logo.png';

const Navbar = ({ user, onOpenLogin, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (hash) => {
    setMobileMenuOpen(false);
    // If not on home page, navigate to home with hash
    if (location.pathname !== '/') {
      navigate('/' + hash);
    } else {
      // If already on home, just scroll
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Update URL without reload
        window.history.pushState(null, null, hash);
      }
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-content">
        <Link to="/" className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={srecLogo} alt="SREC Logo" className="srec-logo-nav" />
          <span className="premium-tag">Smart Campus</span>
        </Link>

        <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <li><button className="nav-btn-link" onClick={() => handleNavClick('#home')}>Home</button></li>
          <li><button className="nav-btn-link" onClick={() => handleNavClick('#routes')}>Routes</button></li>
          <li><button className="nav-btn-link" onClick={() => handleNavClick('#about')}>Pass Status</button></li>
          {/* 'About' section in code is 'HowItWorks', often labeled Steps or About */}
          <li><button className="nav-btn-link" onClick={() => handleNavClick('#about')}>About</button></li>
          <li><button className="nav-btn-link" onClick={() => handleNavClick('#contact')}>Contact</button></li>
          <li className="mobile-only">
            {user ? (
              <button className="btn-outline" onClick={onLogout}>Logout</button>
            ) : (
              <div className="hero-actions fade-in-up delay-2">
                <button className="btn-primary" onClick={() => onOpenLogin('student', 'register')}>
                  Apply for Bus Pass <ArrowRight size={18} />
                </button>
                <button className="btn-secondary" onClick={() => onOpenLogin('driver', 'register')}>
                  Driver Registration
                </button>
                <button className="btn-outline" style={{ border: '2px solid rgba(255, 255, 255, 0.2)', color: 'white', opacity: 0.8 }} onClick={() => onOpenLogin('admin', 'register')}>
                  Admin Registration
                </button>
              </div>
            )}
          </li>
        </ul>

        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              {user.profile_pic ? (
                <img src={user.profile_pic} alt="Profile" className="nav-avatar" />
              ) : null}
              {/* Navigate to dashboard if clicked on name */}
              <span className="user-name" onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')} style={{ cursor: 'pointer' }}>
                Hi, {user.name}
              </span>
              <button className="btn-outline" onClick={onLogout}>Logout</button>
            </div>
          ) : (
            <>
              <button className="btn-outline" onClick={() => onOpenLogin('student')}>Student Login</button>
              <button className="btn-outline" onClick={() => onOpenLogin('driver')}>Driver Login</button>
              <button className="btn-filled" onClick={() => onOpenLogin('admin')}>Admin Login</button>
            </>
          )}
        </div>

        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
