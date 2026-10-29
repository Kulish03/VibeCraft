import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../context/RouterContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

export default function Navbar() {
  const { currentRoute, navigate } = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null);

  // Probe Express backend health check
  useEffect(() => {
    let isMounted = true;
    const probeHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok && isMounted) {
          setBackendOnline(true);
        } else if (isMounted) {
          setBackendOnline(false);
        }
      } catch {
        if (isMounted) setBackendOnline(false);
      }
    };

    probeHealth();
    const interval = setInterval(probeHealth, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="brand-icon">
            <span className="brand-code-brackets">&lt;/&gt;</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">CodeReview</span>
            <span className="brand-tag">Beginner CSE</span>
          </div>
        </Link>

        {/* Backend API Health Status Indicator */}
        <div
          className={`api-pill ${backendOnline ? 'online' : backendOnline === false ? 'offline' : 'checking'}`}
          title={
            backendOnline
              ? 'Express Backend is running healthy on port 5000'
              : 'Express Backend not detected on port 5000 (run "npm run dev" in backend)'
          }
        >
          <span className="api-dot" />
          <span className="api-text">
            {backendOnline ? 'API Online' : backendOnline === false ? 'API Offline' : 'Connecting...'}
          </span>
        </div>

        {/* Mobile menu toggle button */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`} />
          <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`} />
          <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`} />
        </button>

        {/* Nav Links & Controls */}
        <nav className={`navbar-nav ${mobileMenuOpen ? 'is-open' : ''}`}>
          <Link to="/" className="nav-item" onClick={closeMenu}>
            Home
          </Link>
          <Link to="/review" className="nav-item" onClick={closeMenu}>
            Direct Review
          </Link>

          {isAuthenticated ? (
            <div className="nav-auth-group">
              <Link to="/home" className="nav-item nav-workspace-link" onClick={closeMenu}>
                <span className="user-avatar">{user.name.charAt(0)}</span>
                <span className="user-name">{user.name}</span>
              </Link>
              <button
                className="btn-nav btn-outline"
                onClick={handleLogout}
                aria-label="Log out of demo session"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="nav-auth-group">
              <Link to="/login" className="nav-item" onClick={closeMenu}>
                Log In
              </Link>
              <Link to="/signup" className="btn-nav btn-signup" onClick={closeMenu}>
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
