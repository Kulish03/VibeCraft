import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  Bug, 
  ShieldAlert, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  FileCode2,
  Copy,
  Check,
  Sliders,
  Award,
  Layers,
  Zap,
  BookOpen,
  MessageSquareCode,
  ArrowRight,
  Info
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import ReviewChatDrawer from '../components/ReviewChatDrawer';
import { useToast } from '../context/ToastContext';
import '../styles/editor.css';

const CODE_TEMPLATES = {
  python: `def binary_search(arr, target):
    """
    Search for target in a sorted array using binary search.
    """
    if not arr:
        return -1
    
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1

# Example test
data = [1, 3, 5, 7, 9, 11]
print(binary_search(data, 7))`,

  javascript: `/**
 * Safe deep clone utility for plain objects
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  const copy = {};
  for (const key of Object.keys(obj)) {
    copy[key] = deepClone(obj[key]);
  }
  return copy;
}

const user = { id: 1, profile: { name: 'Ada', tags: ['dev', 'ai'] } };
console.log(deepClone(user));`,

  cpp: `#include <iostream>
#include <vector>
#include <algorithm>

// Reverses elements of a vector in place
void reverseVector(std::vector<int>& arr) {
    if (arr.empty()) return;
    int left = 0;
    int right = static_cast<int>(arr.size()) - 1;
    while (left < right) {
        std::swap(arr[left], arr[right]);
        left++;
        right--;
    }
}

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    reverseVector(numbers);
    for (int n : numbers) std::cout << n << " ";
    return 0;
}`,

  java: `public class PalindromeValidator {
    /**
     * Validates whether string is palindrome in O(1) auxiliary space.
     */
    public static boolean isPalindrome(String s) {
        if (s == null) return false;
        int left = 0;
        int right = s.length() - 1;
        while (left < right) {
            if (s.charAt(left) != s.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("radar")); // true
    }
}`
};

const ReviewPage = () => {
  const { showToast } = useToast();
  const [language, setLanguage] = useState('python');
  const [reviewMode, setReviewMode] = useState('detailed');
  const [title, setTitle] = useState('');
  const [reviewInstructions, setReviewInstructions] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [code, setCode] = useState(CODE_TEMPLATES.python);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [activeTab, setActiveTab] = useState('overall');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleLanguageChange = (e) => {
    const selected = e.target.value;
    setLanguage(selected);
    setCode(CODE_TEMPLATES[selected] || '');
    setReviewResult(null);
    setError('');
  };

  const handleClear = () => {
    setCode('');
    setReviewResult(null);
    setError('');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast('Source code copied to clipboard.', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyze = async () => {
    setError('');
    if (!code || code.trim().length === 0) {
      setError('Please provide some source code before requesting a review.');
      showToast('Source code cannot be empty.', 'error');
      return;
    }

    try {
      setIsAnalyzing(true);
      const res = await api.post('/reviews', {
        title: title.trim() || `${language.toUpperCase()} (${reviewMode}) Review`,
        programmingLanguage: language,
        reviewMode,
        sourceCode: code,
        reviewInstructions: reviewInstructions.trim(),
      });

      if (res.data.success) {
        setReviewResult(res.data.review);
        setActiveTab('overall');
        showToast('Code review successfully completed!', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete AI review. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const rr = reviewResult?.reviewResult || null;
  const oa = rr?.overallAssessment || {};
  const bugs = rr?.bugsAndErrors || [];
  const sec = rr?.securityAnalysis || {};
  const cq = rr?.codeQuality || {};
  const perf = rr?.performanceAnalysis || {};
  const comp = rr?.complexityAnalysis || {};
  const learn = rr?.learningAssistance || {};

  const getQualityBadgeColor = (level) => {
    switch (level) {
      case 'Excellent': return 'badge-success';
      case 'Good': return 'badge-purple';
      case 'Needs Improvement': return 'badge-warning';
      case 'Critical Issues': return 'badge-danger';
      default: return 'badge-success';
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <div className="editor-workspace">
          {/* Workspace Toolbar */}
          <div className="workspace-toolbar">
            <div className="toolbar-left">
              <input
                type="text"
                placeholder="Review Title (e.g. Binary Search Audit)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="review-title-input"
              />

              {/* Language Selector */}
              <select
                value={language}
                onChange={handleLanguageChange}
                className="select-control"
                title="Select Programming Language"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>

              {/* Review Mode Selector */}
              <select
                value={reviewMode}
                onChange={(e) => setReviewMode(e.target.value)}
                className="select-control"
                title="Select Review Mode"
              >
                <option value="detailed">📋 Detailed Review (All 7 Sections)</option>
                <option value="basic">⚡ Basic Review (Concise)</option>
                <option value="security">🛡️ Security Audit</option>
                <option value="performance">🚀 Performance & Complexity</option>
              </select>

              <button
                className={`btn btn-secondary ${showInstructions ? 'btn-outline' : ''}`}
                onClick={() => setShowInstructions(!showInstructions)}
                style={{ fontSize: '0.825rem', padding: '0.45rem 0.85rem' }}
                title="Add optional custom instructions"
              >
                <Sliders size={14} />
                <span>Instructions {reviewInstructions ? '•' : ''}</span>
              </button>
            </div>

            <div className="toolbar-right">
              <button
                className="btn btn-secondary"
                onClick={handleCopyCode}
                title="Copy code to clipboard"
              >
                {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                className="btn btn-secondary"
                onClick={handleClear}
                disabled={isAnalyzing}
              >
                <RotateCcw size={16} />
                <span>Clear</span>
              </button>

              <button
                className="btn btn-primary"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ display: 'inline-flex' }}
                    >
                      <Sparkles size={16} />
                    </motion.div>
                    <span>Auditing Code...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Review Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Optional Review Instructions Collapsible */}
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card"
              style={{ padding: '0.85rem 1.25rem', background: '#FBFDFF' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <Sliders size={15} color="var(--primary-600)" />
                <span>Custom Review Focus & Guidelines</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Focus on concurrency safety and memory leaks, or Check for SQL injection"
                value={reviewInstructions}
                onChange={(e) => setReviewInstructions(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  fontSize: '0.875rem',
                }}
              />
            </motion.div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="auth-alert auth-alert-error">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Grid Layout: Editor on Left, 7-Section Analysis on Right */}
          <div className="workspace-grid">
            {/* Left: Monaco Code Editor */}
            <div className="editor-card">
              <div className="editor-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileCode2 size={16} color="var(--primary-600)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Source Code Input</span>
                </div>
                <div className="editor-status-text">
                  {language.toUpperCase()} • {code.split('\n').length} lines
                </div>
              </div>

              <div className="monaco-container">
                <Editor
                  height="100%"
                  language={language === 'cpp' ? 'cpp' : language}
                  value={code}
                  theme="vs"
                  onChange={(val) => setCode(val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    padding: { top: 12, bottom: 12 },
                  }}
                />
              </div>
            </div>

            {/* Right: AI Review Results Panel */}
            <div className="analysis-results-card">
              <div className="analysis-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color="var(--primary-600)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Structured Review Pipeline</span>
                </div>
                {reviewResult && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${getQualityBadgeColor(oa.qualityLevel)}`}>
                      {oa.qualityLevel || 'Audited'}
                    </span>
                    <span className="badge badge-success">
                      Score: {reviewResult.overallScore}/100
                    </span>
                  </div>
                )}
              </div>

              {/* 7-Section Tab Navigation (when review is present) */}
              {reviewResult && (
                <div className="analysis-nav-tabs">
                  <button
                    className={`analysis-nav-tab ${activeTab === 'overall' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overall')}
                  >
                    <Award size={14} /> 1. Assessment
                  </button>
                  <button
                    className={`analysis-nav-tab ${activeTab === 'bugs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bugs')}
                  >
                    <Bug size={14} /> 2. Bugs ({bugs.length})
                  </button>
                  <button
                    className={`analysis-nav-tab ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                  >
                    <ShieldAlert size={14} /> 3. Security
                  </button>
                  <button
                    className={`analysis-nav-tab ${activeTab === 'quality' ? 'active' : ''}`}
                    onClick={() => setActiveTab('quality')}
                  >
                    <Layers size={14} /> 4. Quality
                  </button>
                  <button
                    className={`analysis-nav-tab ${activeTab === 'performance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('performance')}
                  >
                    <Zap size={14} /> 5. Performance
                  </button>
                  <button
                    className={`analysis-nav-tab ${activeTab === 'complexity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('complexity')}
                  >
                    <Clock size={14} /> 6. Complexity
                  </button>
                  <button
                    className={`analysis-nav-tab ${activeTab === 'learning' ? 'active' : ''}`}
                    onClick={() => setActiveTab('learning')}
                  >
                    <BookOpen size={14} /> 7. Learning
                  </button>
                  <button
                    className={`analysis-nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chat')}
                  >
                    <MessageSquareCode size={14} /> 8. AI Chat
                  </button>
                </div>
              )}

              <div className="analysis-card-body">
                {isAnalyzing ? (
                  <div className="placeholder-pane">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="placeholder-icon-circle"
                    >
                      <Sparkles size={24} />
                    </motion.div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                      Executing Structured Code Review...
                    </h3>
                    <p style={{ fontSize: '0.875rem' }}>
                      Auditing syntax, logical bugs, security vulnerabilities, quality, performance, complexity, and educational hints.
                    </p>
                  </div>
                ) : !reviewResult ? (
                  <div className="placeholder-pane">
                    <div className="placeholder-icon-circle">
                      <Sparkles size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                      Ready for Structured Review
                    </h3>
                    <p style={{ fontSize: '0.875rem', maxWidth: '340px' }}>
                      Choose your review mode and click <strong>"Review Code"</strong> to launch the 7-section pedagogical audit.
                    </p>
                  </div>
                ) : (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                  >
                    {/* SECTION 1: OVERALL ASSESSMENT */}
                    {activeTab === 'overall' && (
                      <div>
                        <div className="section-card">
                          <div className="section-card-title">
                            <Award size={18} color="var(--primary-600)" />
                            <span>Overall Assessment & Health Score</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                              {oa.score ?? reviewResult.overallScore}
                              <span style={{ fontSize: '1.25rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>/100</span>
                            </div>
                            <div>
                              <span className={`badge ${getQualityBadgeColor(oa.qualityLevel)}`} style={{ fontSize: '0.85rem' }}>
                                Level: {oa.qualityLevel || 'Audited'}
                              </span>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                Mode: {reviewResult.reviewMode ? reviewResult.reviewMode.toUpperCase() : 'DETAILED'}
                              </div>
                            </div>
                          </div>
                          <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {oa.summary || rr.summary}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SECTION 2: BUGS AND ERRORS */}
                    {activeTab === 'bugs' && (
                      <div>
                        {bugs.length === 0 ? (
                          <div className="section-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                            <CheckCircle2 size={32} color="var(--success)" style={{ margin: '0 auto 0.75rem' }} />
                            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No Bugs Detected</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                              Code appears free of confirmed syntax and logical errors under static analysis.
                            </p>
                          </div>
                        ) : (
                          bugs.map((bug, i) => (
                            <div key={i} className="bug-item-card">
                              <div className="bug-item-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span className={`severity-pill severity-${bug.severity}`}>
                                    {bug.severity}
                                  </span>
                                  <span className="bug-item-title">{bug.title}</span>
                                </div>
                                {bug.lineNumber && (
                                  <span className="bug-line-tag">Line {bug.lineNumber}</span>
                                )}
                              </div>
                              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
                                {bug.explanation}
                              </p>
                              {bug.debuggingHint && (
                                <div className="bug-hint-box">
                                  <HelpCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                                  <span><strong>Debugging Hint:</strong> {bug.debuggingHint}</span>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* SECTION 3: SECURITY ANALYSIS */}
                    {activeTab === 'security' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="section-card">
                          <div className="section-card-title">
                            <ShieldAlert size={18} color="var(--danger)" />
                            <span>Vulnerability Surface & Auditing</span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                            <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                SQL Injection
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {sec.sqlInjection || 'None identified'}
                              </div>
                            </div>

                            <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                XSS Risks
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {sec.xssRisks || 'Not applicable'}
                              </div>
                            </div>

                            <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                Hardcoded Secrets
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {sec.hardcodedSecrets || 'None identified'}
                              </div>
                            </div>

                            <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                Input Handling & Boundaries
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {sec.unsafeInputHandling || 'Handled appropriately'}
                              </div>
                            </div>
                          </div>

                          {sec.otherWeaknesses && sec.otherWeaknesses.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--danger)' }}>
                                Other Security Weaknesses:
                              </div>
                              <ul className="review-list">
                                {sec.otherWeaknesses.map((w, idx) => (
                                  <li key={idx} className="review-list-item" style={{ background: '#FFF1F2' }}>
                                    <span>⚠️</span> <span>{w}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SECTION 4: CODE QUALITY */}
                    {activeTab === 'quality' && (
                      <div className="section-card">
                        <div className="section-card-title">
                          <Layers size={18} color="var(--primary-600)" />
                          <span>Code Quality & Idiomatic Standards</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Naming Conventions:</strong>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                              {cq.namingConventions || 'Standard identifiers.'}
                            </p>
                          </div>
                          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Readability:</strong>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                              {cq.readability || 'Code structure is clean and readable.'}
                            </p>
                          </div>
                          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Maintainability:</strong>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                              {cq.maintainability || 'Separation of concerns is maintained.'}
                            </p>
                          </div>
                          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Code Duplication (DRY):</strong>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                              {cq.codeDuplication || 'No significant duplication detected.'}
                            </p>
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Best Practices:</strong>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                              {cq.bestPractices || 'Language idioms respected.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SECTION 5: PERFORMANCE ANALYSIS */}
                    {activeTab === 'performance' && (
                      <div className="section-card">
                        <div className="section-card-title">
                          <Zap size={18} color="var(--warning)" />
                          <span>Performance & Resource Utilization</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                          <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                            <strong style={{ fontSize: '0.825rem', color: 'var(--text-primary)' }}>Loop Efficiency:</strong>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              {perf.inefficientLoops || 'Loops are bounded.'}
                            </p>
                          </div>

                          <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                            <strong style={{ fontSize: '0.825rem', color: 'var(--text-primary)' }}>Computations:</strong>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              {perf.unnecessaryComputations || 'No redundant calculations observed.'}
                            </p>
                          </div>

                          <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                            <strong style={{ fontSize: '0.825rem', color: 'var(--text-primary)' }}>Memory Footprint:</strong>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              {perf.memoryConcerns || 'Memory footprint is nominal.'}
                            </p>
                          </div>
                        </div>

                        {perf.optimizationSuggestions && perf.optimizationSuggestions.length > 0 && (
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--warning)' }}>
                              Concrete Optimization Suggestions:
                            </div>
                            <ul className="review-list">
                              {perf.optimizationSuggestions.map((opt, idx) => (
                                <li key={idx} className="review-list-item">
                                  <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>⚡</span>
                                  <span>{opt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SECTION 6: COMPLEXITY ANALYSIS */}
                    {activeTab === 'complexity' && (
                      <div className="section-card">
                        <div className="section-card-title">
                          <Clock size={18} color="var(--purple)" />
                          <span>Asymptotic Complexity Analysis</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                          <div style={{ background: '#F5F3FF', border: '1px solid var(--purple-border)', borderRadius: 'var(--radius-sm)', padding: '1rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase' }}>
                              Time Complexity
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--purple)', fontFamily: 'var(--font-mono)', margin: '0.35rem 0' }}>
                              {comp.timeComplexity || 'O(n)'}
                            </div>
                          </div>

                          <div style={{ background: '#EEF2FF', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-sm)', padding: '1rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase' }}>
                              Space Complexity
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-600)', fontFamily: 'var(--font-mono)', margin: '0.35rem 0' }}>
                              {comp.spaceComplexity || 'O(1)'}
                            </div>
                          </div>
                        </div>

                        <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                            Mathematical Derivation:
                          </div>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {comp.explanation || 'Complexity estimated based on loop constructs and auxiliary allocations.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SECTION 7: LEARNING ASSISTANCE */}
                    {activeTab === 'learning' && (
                      <div className="section-card">
                        <div className="section-card-title">
                          <BookOpen size={18} color="var(--info)" />
                          <span>Pedagogical Learning & Debugging Guide</span>
                        </div>

                        {learn.whyIssuesOccur && (
                          <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                              Why This Occurs:
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                              {learn.whyIssuesOccur}
                            </p>
                          </div>
                        )}

                        {learn.stepByStepDebugging && learn.stepByStepDebugging.length > 0 && (
                          <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--info)' }}>
                              Step-by-Step Debugging Walkthrough:
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {learn.stepByStepDebugging.map((step, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                  <span style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', background: '#EFF6FF', color: 'var(--info)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>
                                    {idx + 1}
                                  </span>
                                  <span style={{ marginTop: '2px' }}>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {learn.illustrativeExamples && learn.illustrativeExamples.length > 0 && (
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                              Illustrative Pattern Comparison:
                            </div>
                            {learn.illustrativeExamples.map((ex, idx) => (
                              <div key={idx} style={{ marginBottom: '0.75rem' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
                                  Concept: {ex.concept}
                                </div>
                                <div className="pattern-box">
                                  <div className="pattern-pane pattern-anti">
                                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>❌ Anti-Pattern</div>
                                    <code>{ex.antiPattern}</code>
                                  </div>
                                  <div className="pattern-pane pattern-improved">
                                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>✅ Recommended Pattern</div>
                                    <code>{ex.improvedPattern}</code>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SECTION 8: AI FOLLOW-UP CHAT */}
                    {activeTab === 'chat' && (
                      <div className="section-card" style={{ height: '100%', minHeight: '400px' }}>
                        <ReviewChatDrawer
                          review={reviewResult}
                          onUpdateChat={(msgs) =>
                            setReviewResult((prev) => ({ ...prev, chatMessages: msgs }))
                          }
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewPage;
