import React, { useState } from 'react';
import CodeEditor from '../CodeEditor/CodeEditor.jsx';
import FeedbackView from '../ReviewFeedback/FeedbackView.jsx';
import { STARTER_CODE } from '../../data/sampleFeedback.js';
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

  // Call backend API to get a real AI review
  const handleReviewCode = async () => {
    // Prevent duplicate submissions while a request is in progress
    if (status === 'loading') return;

    if (!code.trim()) {
      setStatus('error');
      setErrorMessage('Cannot review empty code. Please type or paste a code snippet first.');
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });

      if (!response.ok) {
        // Backend returned an error status; try to extract JSON error message
        let errMsg = `Server responded with ${response.status}`;
        try {
          const errBody = await response.json();
          errMsg = errBody.error?.message || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      // Expected shape: { success:true, data:{...review...}, meta:{...} }
      if (data.success) {
        setReviewResult(data.data);
        setStatus('success');
      } else {
        throw new Error(data.error?.message || 'Unexpected response from server');
      }
    } catch (err) {
      // Network or parsing error
      setErrorMessage(err.message || 'Failed to communicate with the review service.');
      setStatus('error');
    }
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
