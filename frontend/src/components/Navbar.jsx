import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, ArrowRight, LayoutDashboard } from 'lucide-react';
import '../styles/navbar.css';

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="public-navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon-wrapper">
            <Code2 size={20} strokeWidth={2.5} />
          </div>
          <span className="brand-text">VIBECRAFT</span>
        </Link>

        <nav className="navbar-nav">
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#languages" className="nav-link">Languages</a>
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">
              <LayoutDashboard size={16} />
              <span>Dashboard ({user?.name?.split(' ')[0] || 'Account'})</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
