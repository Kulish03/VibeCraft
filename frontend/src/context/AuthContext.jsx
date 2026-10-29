import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'code_review_demo_user';

export function AuthProvider({ children }) {
  // Load demo user from storage if present (strictly sanitized: NEVER plaintext passwords)
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync sanitized user state to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Storage unavailable:', err);
    }
  }, [user]);

  /**
   * Demo Login Simulation
   * Validates input format and simulates session creation without saving passwords.
   */
  const login = async (email, password) => {
    setLoading(true);
    // Simulate brief network latency for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Basic format validation
    if (!email || !email.includes('@')) {
      setLoading(false);
      throw new Error('Please provide a valid email address.');
    }
    if (!password || password.length < 6) {
      setLoading(false);
      throw new Error('Password must be at least 6 characters.');
    }

    // Derive a friendly display name from email (e.g., alex@cse.edu -> Alex)
    const derivedName = email.split('@')[0];
    const capitalizedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

    const demoUser = {
      id: 'demo_' + Date.now().toString(36),
      name: capitalizedName || 'B.Tech Student',
      email: email.trim().toLowerCase(),
      role: 'Student Programmer',
      demoToken: 'demo_mock_jwt_' + Math.random().toString(36).substring(2),
      isDemo: true,
      reviewsCompleted: 3,
    };

    setUser(demoUser);
    setLoading(false);
    return demoUser;
  };

  /**
   * Demo Sign Up Simulation
   */
  const signup = async (name, email, password, confirmPassword) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!name || name.trim().length < 2) {
      setLoading(false);
      throw new Error('Please enter your full name (at least 2 characters).');
    }
    if (!email || !email.includes('@')) {
      setLoading(false);
      throw new Error('Please enter a valid university or personal email.');
    }
    if (!password || password.length < 6) {
      setLoading(false);
      throw new Error('Password must be at least 6 characters long.');
    }
    if (password !== confirmPassword) {
      setLoading(false);
      throw new Error('Passwords do not match. Please re-enter.');
    }

    const newUser = {
      id: 'demo_' + Date.now().toString(36),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'Student Programmer',
      demoToken: 'demo_mock_jwt_' + Math.random().toString(36).substring(2),
      isDemo: true,
      reviewsCompleted: 0,
    };

    setUser(newUser);
    setLoading(false);
    return newUser;
  };

  /**
   * Demo Logout
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
