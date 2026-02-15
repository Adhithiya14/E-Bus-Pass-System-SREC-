import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
// Removed UserModules import
import BusRoutes from './components/BusRoutes';
// Removed TechStack import
import CTA from './components/CTA';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import ScrollToTop from './components/ScrollToTop';
import GlobalHeader from './components/GlobalHeader';
import GlobalFooter from './components/GlobalFooter';
import NotFound from './components/NotFound';
import CheckerVerification from './components/CheckerVerification';

// Landing Page Component to group all landing sections
const LandingPage = ({ onOpenLogin }) => {
  const location = useLocation();

  useEffect(() => {
    // Handle hash scrolling
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <>
      <div id="home"><Hero onOpenLogin={onOpenLogin} /></div>
      <div id="features"><Features /></div>
      <div id="about"><HowItWorks /></div>
      {/* Removed UserModules section */}
      <div id="routes"><BusRoutes /></div>
      {/* Removed TechStack section */}
      <div id="contact"><CTA onOpenLogin={() => onOpenLogin('student', 'register')} /></div>
      <Footer />
    </>
  );
};

function InnerApp() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [initialRole, setInitialRole] = useState('student');
  const [initialMode, setInitialMode] = useState('login');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('qride_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('qride_token') || null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
  }, []);

  const handleOpenLogin = (role = 'student', mode = 'login') => {
    setInitialRole(role);
    setInitialMode(mode);
    setLoginOpen(true);
  };

  const handleLogin = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('qride_user', JSON.stringify(userData));
    localStorage.setItem('qride_token', tokenData);
    setLoginOpen(false);
    navigate(userData.role === 'admin' ? '/admin' : '/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('qride_user');
    localStorage.removeItem('qride_token');
    navigate('/');
  };

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <GlobalHeader />
      <Navbar
        user={user}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
      />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage onOpenLogin={handleOpenLogin} />} />
          <Route
            path="/dashboard"
            element={user && user.role !== 'admin' ? <StudentDashboard user={user} onLogout={handleLogout} onUpdateUser={setUser} /> : <Navigate to="/" />}
          />
          <Route
            path="/admin"
            element={user && user.role === 'admin' ? <AdminDashboard user={user} onLogout={handleLogout} onUpdateUser={setUser} /> : <Navigate to="/" />}
          />
          <Route path="/verify-checker/:checkerId" element={<CheckerVerification />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <LoginModal
        isOpen={loginOpen}
        initialRole={initialRole}
        initialMode={initialMode}
        onClose={() => setLoginOpen(false)}
        onLogin={handleLogin}
      />
      <ScrollToTop />
      <GlobalFooter />
    </div>
  );
}

function App() {
  return (
    <Router>
      <InnerApp />
    </Router>
  );
}

export default App;
