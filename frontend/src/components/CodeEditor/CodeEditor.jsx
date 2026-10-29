import React, { useRef, useEffect } from 'react';
import './CodeEditor.css';

export default function CodeEditor({
  language,
  onLanguageChange,
  code,
  onCodeChange,
  onLoadSample,
  onClear,
  onReview,
  isLoading,
  languages = [
    { id: 'python', label: 'Python', ext: '.py' },
    { id: 'javascript', label: 'JavaScript', ext: '.js' },
    { id: 'java', label: 'Java', ext: '.java' },
    { id: 'cpp', label: 'C++', ext: '.cpp' }
  ]
}) {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // Synchronize line numbers gutter scrolling with textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const lineCount = Math.max(code.split('\n').length, 1);
  const charCount = code.length;
  const isCodeEmpty = !code.trim();

  // Support Tab key inside the code textarea for beginner programmer convenience
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newCode = code.substring(0, selectionStart) + '  ' + code.substring(selectionEnd);
      onCodeChange(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = selectionStart + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="code-editor-card">
      {/* Editor Header Bar */}
      <div className="editor-top-bar">
        {/* Language Selector */}
        <div className="language-selector-group">
          <label htmlFor="lang-select" className="selector-label">Language:</label>
          <div className="lang-tabs" role="tablist" aria-label="Programming Language Selection">
            {languages.map((lang) => (
              <button
                key={lang.id}
                role="tab"
                aria-selected={language === lang.id}
                className={`lang-tab-btn ${language === lang.id ? 'active' : ''}`}
                onClick={() => onLanguageChange(lang.id)}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="editor-actions">
          <button
            type="button"
            className="editor-btn btn-secondary"
            onClick={onLoadSample}
            title="Load sample code featuring a classic beginner pitfall"
          >
            <span className="btn-icon">💡</span> Load Example
          </button>
          <button
            type="button"
            className="editor-btn btn-secondary"
            onClick={onClear}
            disabled={isCodeEmpty}
            title="Clear the code editor"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Editor Code Area */}
      <div className="editor-body">
        {/* Line Numbers Gutter */}
        <div className="line-numbers-gutter" ref={lineNumbersRef} aria-hidden="true">
          {Array.from({ length: lineCount }).map((_, index) => (
            <div key={index + 1} className="line-num">
              {index + 1}
            </div>
          ))}
        </div>

        {/* Main Text Area */}
        <div className="textarea-container">
          <textarea
            ref={textareaRef}
            id="code-input"
            className="code-textarea"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            placeholder={`// Write or paste your ${languages.find(l => l.id === language)?.label || ''} code here...
// Or click 'Load Example' above to see a sample beginner bug.`}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Code Editor Input"
          />
        </div>
      </div>

      {/* Editor Footer Bar */}
      <div className="editor-footer-bar">
        <div className="editor-meta">
          <span className="meta-pill">{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
          <span className="meta-pill">{charCount} chars</span>
          <span className="meta-pill lang-tag">.{languages.find(l => l.id === language)?.ext || ''}</span>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          className="btn-review"
          onClick={onReview}
          disabled={isCodeEmpty || isLoading}
          aria-label={isLoading ? 'Analyzing code...' : 'Review code'}
        >
          {isLoading ? (
            <>
              <span className="spinner" /> Analyzing Code...
            </>
          ) : (
            <>
              <span className="btn-icon">✨</span> Review Code
            </>
          )}
        </button>
      </div>
    </div>
  );
}
