import React, { useState } from 'react';
import './FeedbackView.css';

export default function FeedbackView({
  status, // 'idle', 'loading', 'success', 'error'
  result, // reviewResult object
  error,  // error message string
  onRetry,
  onLoadSample
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'issues', 'explanation', 'hints', 'improvements'
  const [copied, setCopied] = useState(false);
  const [revealedHints, setRevealedHints] = useState({});

  const handleCopyCode = () => {
    if (result?.improvedCode) {
      navigator.clipboard.writeText(result.improvedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleHint = (index) => {
    setRevealedHints((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // 1. EMPTY / IDLE STATE
  if (status === 'idle') {
    return (
      <div className="feedback-card empty-state">
        <div className="empty-illustration">
          <div className="empty-icon-circle">
            <span className="empty-icon">🔍</span>
          </div>
        </div>
        <h3 className="empty-title">Ready to Review Your Code</h3>
        <p className="empty-desc">
          Paste your programming snippet in the editor on the left and click <strong>"Review Code"</strong> to receive constructive, beginner-friendly feedback.
        </p>
        <div className="empty-tips">
          <div className="tip-item">
            <span className="tip-badge">1</span>
            <span>Select Python, JavaScript, Java, or C++</span>
          </div>
          <div className="tip-item">
            <span className="tip-badge">2</span>
            <span>Catch off-by-one errors, memory leaks & crashes</span>
          </div>
          <div className="tip-item">
            <span className="tip-badge">3</span>
            <span>Receive step-by-step Socratic hints & clean refactoring</span>
          </div>
        </div>
        <button type="button" className="btn-load-sample-empty" onClick={onLoadSample}>
          💡 Or Load a Beginner Pitfall Example
        </button>
      </div>
    );
  }

  // 2. LOADING STATE
  if (status === 'loading') {
    return (
      <div className="feedback-card loading-state" role="status" aria-live="polite">
        <div className="loading-animation-container">
          <div className="code-scan-line" />
          <div className="loading-spinner-large" />
        </div>
        <h3 className="loading-title">Analyzing Your Code...</h3>
        <p className="loading-subtitle">Inspecting syntax, scoping rules, and algorithmic edge cases</p>
        <div className="loading-steps">
          <div className="step-pill active">
            <span className="step-dot" /> 1. Scanning AST & logic
          </div>
          <div className="step-pill active">
            <span className="step-dot" /> 2. Checking boundary conditions
          </div>
          <div className="step-pill active">
            <span className="step-dot" /> 3. Synthesizing pedagogical hints
          </div>
        </div>
      </div>
    );
  }

  // 3. ERROR STATE
  if (status === 'error') {
    return (
      <div className="feedback-card error-state" role="alert">
        <div className="error-icon-circle">
          <span className="error-icon">⚠️</span>
        </div>
        <h3 className="error-title">Analysis Could Not Complete</h3>
        <p className="error-desc">
          {error || 'An unexpected issue occurred while analyzing the code snippet.'}
        </p>
        <button type="button" className="btn-retry" onClick={onRetry}>
          Try Again
        </button>
      </div>
    );
  }

  // 4. SUCCESS STATE
  if (status === 'success' && result) {
    return (
      <div className="feedback-card success-state">
        {/* Header Summary */}
        <div className="feedback-header">
          <div className="feedback-badge-row">
            <span className="badge-review-complete">Review Complete</span>
            <span className="badge-issue-count">
              {result.issues?.length || 0} {result.issues?.length === 1 ? 'Finding' : 'Findings'}
            </span>
          </div>
          <p className="review-summary-text">{result.summary}</p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="section-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`section-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Sections
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'issues'}
            className={`section-tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            Issues Found ({result.issues?.length || 0})
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'explanation'}
            className={`section-tab-btn ${activeTab === 'explanation' ? 'active' : ''}`}
            onClick={() => setActiveTab('explanation')}
          >
            Explanation
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'hints'}
            className={`section-tab-btn ${activeTab === 'hints' ? 'active' : ''}`}
            onClick={() => setActiveTab('hints')}
          >
            Debugging Hints
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'improvements'}
            className={`section-tab-btn ${activeTab === 'improvements' ? 'active' : ''}`}
            onClick={() => setActiveTab('improvements')}
          >
            Suggested Improvements
          </button>
        </div>

        {/* SECTION 1: ISSUES FOUND */}
        {(activeTab === 'all' || activeTab === 'issues') && (
          <section className="feedback-section" aria-labelledby="section-issues-title">
            <div className="section-header">
              <h4 id="section-issues-title" className="section-heading">
                <span className="section-icon">🐞</span> 1. Issues Found
              </h4>
            </div>
            <div className="issues-list">
              {result.issues && result.issues.length > 0 ? (
                result.issues.map((issue) => (
                  <div key={issue.id} className={`issue-card severity-${issue.type.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="issue-meta-row">
                      <span className={`issue-tag tag-${issue.type.toLowerCase().replace(/\s+/g, '-')}`}>
                        {issue.type}
                      </span>
                      {issue.line && (
                        <span className="issue-line-badge">Line {issue.line}</span>
                      )}
                    </div>
                    <h5 className="issue-title">{issue.title}</h5>
                    <p className="issue-description">{issue.description}</p>
                  </div>
                ))
              ) : (
                <p className="no-issues-text">No critical syntax or boundary issues detected.</p>
              )}
            </div>
          </section>
        )}

        {/* SECTION 2: EXPLANATION */}
        {(activeTab === 'all' || activeTab === 'explanation') && (
          <section className="feedback-section" aria-labelledby="section-explanation-title">
            <div className="section-header">
              <h4 id="section-explanation-title" className="section-heading">
                <span className="section-icon">📖</span> 2. Pedagogical Explanation
              </h4>
            </div>
            <div className="explanation-body">
              <p className="explanation-paragraph">{result.explanation}</p>
            </div>
          </section>
        )}

        {/* SECTION 3: DEBUGGING HINTS */}
        {(activeTab === 'all' || activeTab === 'hints') && (
          <section className="feedback-section" aria-labelledby="section-hints-title">
            <div className="section-header">
              <h4 id="section-hints-title" className="section-heading">
                <span className="section-icon">💡</span> 3. Debugging Hints (Socratic Guidance)
              </h4>
              <span className="hints-subhead">Test your understanding before reading the final solution</span>
            </div>
            <div className="hints-list">
              {result.hints && result.hints.map((hint, idx) => (
                <div key={idx} className="hint-card">
                  <div className="hint-card-header" onClick={() => toggleHint(idx)}>
                    <span className="hint-number">Hint #{idx + 1}</span>
                    <button
                      type="button"
                      className="hint-toggle-btn"
                      aria-expanded={!!revealedHints[idx]}
                    >
                      {revealedHints[idx] ? 'Hide Hint ▲' : 'Reveal Hint ▼'}
                    </button>
                  </div>
                  {revealedHints[idx] ? (
                    <div className="hint-card-content animated-reveal">
                      <p>{hint}</p>
                    </div>
                  ) : (
                    <div className="hint-card-placeholder" onClick={() => toggleHint(idx)}>
                      <span>Click to reveal guidance question...</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 4: SUGGESTED IMPROVEMENTS */}
        {(activeTab === 'all' || activeTab === 'improvements') && (
          <section className="feedback-section" aria-labelledby="section-improvements-title">
            <div className="section-header">
              <h4 id="section-improvements-title" className="section-heading">
                <span className="section-icon">✨</span> 4. Suggested Improvements & Refactoring
              </h4>
              <button
                type="button"
                className="btn-copy-code"
                onClick={handleCopyCode}
                title="Copy refactored code to clipboard"
              >
                {copied ? '✓ Copied!' : '📋 Copy Refactored Code'}
              </button>
            </div>

            {result.improvedCode && (
              <div className="code-improvement-block">
                <pre className="improved-code-pre">
                  <code>{result.improvedCode}</code>
                </pre>
              </div>
            )}

            {result.takeaways && result.takeaways.length > 0 && (
              <div className="takeaways-box">
                <h5 className="takeaways-title">Key Learning Takeaways:</h5>
                <ul className="takeaways-list">
                  {result.takeaways.map((point, index) => (
                    <li key={index} className="takeaway-item">
                      <span className="takeaway-bullet">✓</span> {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </div>
    );
  }

  return null;
}
