import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useRouter, Link } from '../context/RouterContext.jsx';
import './Auth.css';

export default function SignUpPage() {
  const { signup, loading } = useAuth();
  const { navigate } = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Please provide your full name (minimum 2 characters).');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    try {
      await signup(
        formData.name,
        formData.email,
        formData.password,
        formData.confirmPassword
      );
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            <span>🎓</span>
          </div>
          <h2 className="auth-title">Create Student Account</h2>
          <p className="auth-subtitle">Join the pedagogical code review community</p>
        </div>

        {/* Demo Notice Banner */}
        <div className="demo-notice-alert" role="note">
          <span className="demo-alert-icon">🛡️</span>
          <div>
            <strong>Demo Authentication:</strong> All accounts run in a secure local demo environment. No plaintext passwords or personal credentials are persisted.
          </div>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Sign Up Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="signup-name" className="form-label">
              Full Name
            </label>
            <input
              id="signup-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Alex Johnson"
              className="form-input"
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email" className="form-label">
              College / University Email
            </label>
            <input
              id="signup-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="alex.johnson@university.edu"
              className="form-input"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <div className="label-with-action">
              <label htmlFor="signup-password" className="form-label">
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
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className="form-input"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-confirm-password" className="form-label">
              Confirm Password
            </label>
            <input
              id="signup-confirm-password"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              className="form-input"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading}
          >
            {loading ? 'Creating Demo Account...' : 'Complete Registration'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-switch-link">
              Sign In
            </Link>
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Prefer reviewing immediately?{' '}
            <Link to="/review" className="auth-switch-link">
              Direct Code Review →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
