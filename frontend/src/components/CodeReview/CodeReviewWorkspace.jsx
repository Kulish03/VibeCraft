import React, { useState } from 'react';
import CodeEditor from '../CodeEditor/CodeEditor.jsx';
import FeedbackView from '../ReviewFeedback/FeedbackView.jsx';
import { STARTER_CODE, SAMPLE_REVIEWS, generateHeuristicReview } from '../../data/sampleFeedback.js';
import './Workspace.css';

export default function CodeReviewWorkspace({ title, subtitle, showBanner = true }) {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(STARTER_CODE.python);
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [reviewResult, setReviewResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Switch language and load its default pitfall code snippet
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(STARTER_CODE[newLang] || '');
    setStatus('idle');
    setReviewResult(null);
    setErrorMessage(null);
  };

  const handleLoadSample = () => {
    setCode(STARTER_CODE[language] || '');
    setStatus('idle');
    setReviewResult(null);
    setErrorMessage(null);
  };

  const handleClear = () => {
    setCode('');
    setStatus('idle');
    setReviewResult(null);
    setErrorMessage(null);
  };

  // Perform review simulation using sample feedback (No AI API yet!)
  const handleReviewCode = () => {
    if (!code.trim()) {
      setStatus('error');
      setErrorMessage('Cannot review empty code. Please type or paste a code snippet first.');
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    // Simulate review progress and network response
    setTimeout(() => {
      try {
        // If code matches the starter template, provide the hand-crafted review
        const starter = STARTER_CODE[language]?.trim();
        const current = code.trim();

        if (starter && current === starter) {
          setReviewResult(SAMPLE_REVIEWS[language]);
        } else {
          // Dynamic beginner-friendly heuristic review for custom code
          const customReview = generateHeuristicReview(code, language);
          setReviewResult(customReview);
        }
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.message || 'Analysis failed. Please try again.');
      }
    }, 1200);
  };

  return (
    <div className="workspace-container">
      {/* Workspace Header */}
      <div className="workspace-header">
        {title && <h2 className="workspace-title">{title}</h2>}
        {subtitle && <p className="workspace-subtitle">{subtitle}</p>}
      </div>

      {showBanner && (
        <div className="demo-mode-banner">
          <span className="banner-icon">ℹ️</span>
          <span>
            <strong>Mentorship Sandbox:</strong> Currently evaluating with curated pedagogical test suites. Full AI API integration will hook in next without UI disruption.
          </span>
        </div>
      )}

      {/* Main Workspace Layout (Editor on Left, Feedback on Right) */}
      <div className="workspace-grid">
        <div className="workspace-pane editor-pane">
          <CodeEditor
            language={language}
            onLanguageChange={handleLanguageChange}
            code={code}
            onCodeChange={(newCode) => {
              setCode(newCode);
              if (status === 'error') setStatus('idle');
            }}
            onLoadSample={handleLoadSample}
            onClear={handleClear}
            onReview={handleReviewCode}
            isLoading={status === 'loading'}
          />
        </div>

        <div className="workspace-pane feedback-pane">
          <FeedbackView
            status={status}
            result={reviewResult}
            error={errorMessage}
            onRetry={handleReviewCode}
            onLoadSample={handleLoadSample}
          />
        </div>
      </div>
    </div>
  );
}
