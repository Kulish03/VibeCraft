import React from 'react';
import { Link } from '../context/RouterContext.jsx';
import CodeReviewWorkspace from '../components/CodeReview/CodeReviewWorkspace.jsx';
import './DirectReviewPage.css';

export default function DirectReviewPage() {
  return (
    <div className="direct-review-page">
      {/* Guest Mode Banner */}
      <section className="direct-review-header">
        <div className="direct-header-container">
          <div className="direct-header-text">
            <span className="direct-badge">⚡ Instant Direct Access</span>
            <h1 className="direct-title">Direct Code Review Workspace</h1>
            <p className="direct-subtitle">
              Reviewing as a guest. Test beginner code snippets in Python, JavaScript, Java, and C++ with instant pedagogical feedback.
            </p>
          </div>

          <div className="direct-cta-card">
            <span className="direct-cta-tag">Student Account</span>
            <p className="direct-cta-desc">Want to track your review milestones & learning progress?</p>
            <div className="direct-cta-buttons">
              <Link to="/signup" className="btn-direct-signup">
                Sign Up Demo
              </Link>
              <Link to="/login" className="btn-direct-login">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="direct-workspace-wrap">
        <CodeReviewWorkspace
          title=""
          subtitle=""
          showBanner={false}
        />
      </main>
    </div>
  );
}
