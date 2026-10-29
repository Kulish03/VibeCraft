import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useRouter, Link } from '../context/RouterContext.jsx';
import './Auth.css';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const { navigate } = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Front-end validation
    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address (e.g., student@university.edu).');
      return;
    }
    if (!formData.password) {
      setError('Please enter your password.');
      return;
    }

    try {
      await login(formData.email, formData.password);
      // Navigate to Home / Workspace upon successful demo authentication
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  // Quick fill button for demo testing convenience
  const handleDemoFill = () => {
    setFormData({
      email: 'alex.student@cse.edu',
      password: 'demoPassword123',
    });
    setError(null);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            <span>🔐</span>
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your Student Code Review Workspace</p>
        </div>

        {/* Demo Notice Banner */}
        <div className="demo-notice-alert" role="note">
          <span className="demo-alert-icon">🛡️</span>
          <div>
            <strong>Demo Authentication:</strong> Passwords are used only for simulated validation and are <em>never stored in plaintext</em>.
          </div>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              University / Personal Email
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="alex.student@cse.edu"
              className="form-input"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <div className="label-with-action">
              <label htmlFor="login-password" className="form-label">
                Password
              </label>
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️ Hide' : '👁️ Show'}
              </button>
            </div>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-input"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
          </button>
        </form>

        {/* Demo Helper Actions */}
        <div className="demo-fill-box">
          <button
            type="button"
            className="btn-demo-quickfill"
            onClick={handleDemoFill}
          >
            ✨ Quick Fill Demo Credentials
          </button>
        </div>

        {/* Footer Link */}
        <div className="auth-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/signup" className="auth-switch-link">
              Sign Up for Demo Access
            </Link>
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Or review without an account:{' '}
            <Link to="/review" className="auth-switch-link">
              Direct Code Review →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
