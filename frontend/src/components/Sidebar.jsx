import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Code2, 
  LayoutDashboard, 
  FileCode2, 
  History, 
  LogOut, 
  Menu, 
  X,
  Sparkles 
} from 'lucide-react';
import '../styles/sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/review', label: 'New Review', icon: FileCode2, badge: 'AI' },
    { to: '/history', label: 'Review History', icon: History },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="mobile-topbar">
        <div className="sidebar-brand">
          <div className="brand-icon-wrapper" style={{ width: '2rem', height: '2rem' }}>
            <Code2 size={16} />
          </div>
          <span className="brand-text">VIBECRAFT</span>
        </div>
        <button 
          className="btn-secondary" 
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar Container */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/" className="sidebar-brand">
            <div className="brand-icon-wrapper">
              <Code2 size={20} strokeWidth={2.5} />
            </div>
            <span className="brand-text">VIBECRAFT</span>
          </NavLink>
        </div>

        <div className="sidebar-nav">
          <div className="sidebar-section-title">Navigation</div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && <span className="sidebar-badge">{item.badge}</span>}
              </NavLink>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div className="user-profile-widget">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'Developer'}</div>
              <div className="user-email">{user?.email || 'dev@vibecraft.io'}</div>
            </div>
            <button 
              className="btn-logout" 
              onClick={handleLogout} 
              title="Sign Out"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default React.memo(Sidebar);
