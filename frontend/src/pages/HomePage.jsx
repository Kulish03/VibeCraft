import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useRouter } from '../context/RouterContext.jsx';
import CodeReviewWorkspace from '../components/CodeReview/CodeReviewWorkspace.jsx';
import './HomePage.css';

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { navigate } = useRouter();

  return (
    <div className="home-page-container">
      {/* Student Welcome Header Card */}
      <section className="student-dashboard-header">
        <div className="header-container">
          <div className="welcome-meta">
            <span className="student-badge">
              {isAuthenticated ? '🎓 Enrolled CSE Student' : '👤 Guest Reviewer'}
            </span>
            <h1 className="student-welcome-title">
              {isAuthenticated
                ? `Welcome back, ${user.name}! 🚀`
                : 'Welcome to Your Code Review Workspace'}
            </h1>
            <p className="student-welcome-subtitle">
              {isAuthenticated
                ? `Logged in as ${user.email}. Analyze code snippets for syntax errors, boundary flaws, and pedagogical best practices.`
                : 'You are using the workspace in direct mode. Create a free demo account to track your review metrics!'}
            </p>
          </div>

          <div className="student-stats-row">
            <div className="stat-card">
              <span className="stat-label">Review Level</span>
              <span className="stat-value">Beginner I</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Languages</span>
              <span className="stat-value">Python, JS, Java, C++</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Mode</span>
              <span className="stat-value demo-highlight">
                {isAuthenticated ? 'Demo Student' : 'Guest'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Code Review Workspace */}
      <main className="home-workspace-section">
        <CodeReviewWorkspace
          title="Interactive Code Review Sandbox"
          subtitle="Choose your target language, inspect the editor, and click 'Review Code' for Socratic hints."
          showBanner={true}
        />
      </main>
    </div>
  );
}
