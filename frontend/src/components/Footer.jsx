import React from 'react';
import { Link } from '../context/RouterContext.jsx';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-info">
            <div className="footer-brand">
              <span className="brand-code-brackets">&lt;/&gt;</span>
              <h3>CodeReview Assistant</h3>
            </div>
            <p className="footer-desc">
              An educational full-stack code critique platform designed specifically to guide beginner
              programmers through algorithmic flaws, syntax issues, and clean code principles.
            </p>
            <div className="stack-badges">
              <span className="badge-chip">React 18</span>
              <span className="badge-chip">Vite 6</span>
              <span className="badge-chip">Express.js</span>
              <span className="badge-chip">ES Modules</span>
            </div>
          </div>

          <div className="footer-nav-col">
            <h4>Platform</h4>
            <Link to="/">Landing Overview</Link>
            <Link to="/review">Direct Code Review</Link>
            <Link to="/home">Student Workspace</Link>
          </div>

          <div className="footer-nav-col">
            <h4>Supported Languages</h4>
            <span>Python 3.x</span>
            <span>JavaScript (ES6+)</span>
            <span>Java (JDK 17+)</span>
            <span>C++ (C++17/20)</span>
          </div>

          <div className="footer-nav-col">
            <h4>CSE Mentorship</h4>
            <span className="demo-notice-text">
              Built as a pedagogical project for B.Tech Computer Science and Engineering students.
            </span>
            <div className="demo-tag">Demo Mode Enabled</div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Code Review Assistant for Beginners. Academic & Educational Project.</p>
          <div className="footer-bottom-links">
            <span className="security-note">Demo authentication is sandboxed. No real passwords stored.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
