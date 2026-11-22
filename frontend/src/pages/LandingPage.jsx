import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Bug, 
  ShieldAlert, 
  Zap, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  Code2, 
  Layers, 
  Terminal,
  Check
} from 'lucide-react';
import Navbar from '../components/Navbar';
import '../styles/landing.css';

const LandingPage = () => {
  const features = [
    {
      icon: Bug,
      title: 'Bugs & Logical Invariants',
      description: 'Pinpoints off-by-one loops, unhandled edge cases, null dereferences, and state inconsistencies.',
      bg: '#FEF2F2',
      color: '#EF4444',
    },
    {
      icon: ShieldAlert,
      title: 'Security Vulnerability Audits',
      description: 'Flags buffer overflows, memory leaks, unsafe deserialization, and untrusted inputs before deployment.',
      bg: '#FFF1F2',
      color: '#E11D48',
    },
    {
      icon: Clock,
      title: 'Algorithmic Big-O Analysis',
      description: 'Calculates precise Time & Space complexity metrics so you eliminate computational bottlenecks.',
      bg: '#F5F3FF',
      color: '#8B5CF6',
    },
    {
      icon: Zap,
      title: 'Quality & Optimization Hints',
      description: 'Provides idiomatic refactoring recommendations and performance tuning targeted for each language.',
      bg: '#FFFBEB',
      color: '#D97706',
    },
    {
      icon: Terminal,
      title: 'Multi-Language Support',
      description: 'First-class support for C++, Java, Python, and JavaScript with language-specific syntax rules.',
      bg: '#EFF6FF',
      color: '#2563EB',
    },
    {
      icon: Layers,
      title: 'Persistent Review History',
      description: 'Track your review history, bookmark key audits, search by keyword, and inspect previous revisions.',
      bg: '#ECFDF5',
      color: '#059669',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Submit Code',
      description: 'Paste your C++, Java, Python, or JavaScript snippet into the integrated Monaco Editor.',
    },
    {
      step: '02',
      title: 'AI Code Analysis',
      description: 'Our engine parses semantic structure, checks security vulnerabilities, and evaluates asymptotic bounds.',
    },
    {
      step: '03',
      title: 'Act on Actionable Insights',
      description: 'Inspect highlighted bugs, understand Big-O complexity, and review optimized clean code.',
    },
  ];

  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero Section */}
      <section className="landing-hero">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="hero-pill">
            <Sparkles size={16} />
            <span>Next-Generation Intelligent Code Review</span>
          </div>

          <h1 className="hero-title">
            Ship Flawless Code with <br />
            <span className="gradient-text">VIBECRAFT</span> Assistant
          </h1>

          <p className="hero-subtitle">
            An intelligent developer companion designed to audit, optimize, and secure your
            C++, Java, Python, and JavaScript codebases before they hit production.
          </p>

          <div className="hero-cta-group">
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              Start Reviewing Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              Sign In to Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Visual Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="hero-visual-wrapper"
        >
          <div className="hero-visual-header">
            <div className="window-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
              review_session_py.py — VIBECRAFT Workspace
            </div>
            <span className="badge badge-success">Audit Complete (94/100)</span>
          </div>

          <div className="hero-visual-grid">
            {/* Code Left */}
            <div className="hero-code-pane">
              <span style={{ color: '#888' }}>1</span> <span style={{ color: '#0070F3' }}>def</span> <span style={{ color: '#7928CA' }}>find_peak_element</span>(nums):<br />
              <span style={{ color: '#888' }}>2</span> &nbsp;&nbsp;&nbsp;&nbsp;left, right = 0, len(nums) - 1<br />
              <span style={{ color: '#888' }}>3</span> &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#0070F3' }}>while</span> left &lt; right:<br />
              <span style={{ color: '#888' }}>4</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mid = (left + right) // 2<br />
              <span style={{ color: '#888' }}>5</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#0070F3' }}>if</span> nums[mid] &gt; nums[mid + 1]:<br />
              <span style={{ color: '#888' }}>6</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;right = mid<br />
              <span style={{ color: '#888' }}>7</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#0070F3' }}>else</span>:<br />
              <span style={{ color: '#888' }}>8</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;left = mid + 1<br />
              <span style={{ color: '#888' }}>9</span> &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#0070F3' }}>return</span> left
            </div>

            {/* Analysis Right */}
            <div className="hero-analysis-pane">
              <div className="hero-insight-card" style={{ borderLeft: '4px solid var(--success)' }}>
                <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Optimal Asymptotic Complexity</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Time: O(log n) | Space: O(1) auxiliary</div>
                </div>
              </div>

              <div className="hero-insight-card" style={{ borderLeft: '4px solid var(--warning)' }}>
                <Zap size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Input Validation Advisory</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Guard against empty array inputs (`nums == []`)</div>
                </div>
              </div>

              <div className="hero-insight-card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
                <ShieldAlert size={18} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Security Baseline: Passed</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>No memory leaks or integer overflows detected.</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="section container">
        <div className="section-header">
          <span className="section-tag">Core Capabilities</span>
          <h2 className="section-title">Built for Modern Engineering Standards</h2>
          <p className="section-subtitle">
            Comprehensive automated code reviews designed to augment your pull-request workflows with immediate feedback.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="feature-card"
              >
                <div className="feature-icon-wrapper" style={{ background: feat.bg, color: feat.color }}>
                  <Icon size={24} />
                </div>
                <h3>{feat.title}</h3>
                <p>{feat.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Workflow</span>
            <h2 className="section-title">How VIBECRAFT Reviews Your Code</h2>
            <p className="section-subtitle">
              From source code to high-confidence audit in seconds.
            </p>
          </div>

          <div className="steps-container">
            {steps.map((st, i) => (
              <div key={i} className="step-card">
                <div className="step-number">{st.step}</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  {st.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
                  {st.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Languages */}
      <section id="languages" className="section container" style={{ textAlign: 'center' }}>
        <div className="section-header">
          <span className="section-tag">Ecosystem</span>
          <h2 className="section-title">Supported Programming Languages</h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {[
            { name: 'C++', desc: 'Modern C++17/20, STL & memory safety', badge: 'badge-cpp' },
            { name: 'Java', desc: 'Object-oriented patterns & concurrency', badge: 'badge-java' },
            { name: 'Python', desc: 'Idiomatic PEP8, type hints & efficiency', badge: 'badge-python' },
            { name: 'JavaScript', desc: 'ES6+, async pipelines & edge cases', badge: 'badge-javascript' },
          ].map((lang, idx) => (
            <div key={idx} className="card" style={{ padding: '1.75rem 2rem', minWidth: '220px', textAlign: 'center' }}>
              <span className={`badge ${lang.badge}`} style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                {lang.name}
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                {lang.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 800 }}>
            <div className="brand-icon-wrapper" style={{ width: '1.75rem', height: '1.75rem' }}>
              <Code2 size={14} />
            </div>
            <span style={{ color: 'var(--text-primary)' }}>VIBECRAFT</span>
          </div>
          <p>© 2026 VIBECRAFT. Premium AI-Powered Code Review Assistant.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
