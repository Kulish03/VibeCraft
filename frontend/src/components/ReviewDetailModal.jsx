import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Code, 
  Bug, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  HelpCircle, 
  Copy, 
  Check, 
  Trash2,
  Award,
  Layers,
  Zap,
  BookOpen,
  MessageSquareCode
} from 'lucide-react';
import ReviewChatDrawer from './ReviewChatDrawer';
import { useToast } from '../context/ToastContext';
import '../styles/modal.css';

const ReviewDetailModal = ({ review, onClose, onDelete }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  if (!review) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(review.sourceCode);
    setCopied(true);
    showToast('Source code copied to clipboard.', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 80) return 'badge-success';
    if (score >= 60) return 'badge-warning';
    return 'badge-danger';
  };

  const rr = review.reviewResult || {};
  const oa = rr.overallAssessment || {};
  const bugs = rr.bugsAndErrors || [];
  const sec = rr.securityAnalysis || {};
  const cq = rr.codeQuality || {};
  const perf = rr.performanceAnalysis || {};
  const comp = rr.complexityAnalysis || {};
  const learn = rr.learningAssistance || {};

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-group">
              <span className={`badge badge-${review.programmingLanguage}`}>
                {review.programmingLanguage}
              </span>
              <h2 className="modal-title">{review.title || 'Code Review Details'}</h2>
              <span className={`badge ${getScoreBadgeClass(review.overallScore)}`}>
                Score: {review.overallScore}/100
              </span>
              {review.reviewMode && (
                <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                  {review.reviewMode.toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                onClick={handleCopy}
              >
                {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              {onDelete && (
                <button
                  className="btn btn-danger"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => onDelete(review._id)}
                  title="Delete Review"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
              <button className="modal-close-btn" onClick={onClose}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="modal-tabs">
            <button
              className={`modal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Award size={15} /> 1. Assessment
            </button>
            <button
              className={`modal-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              <Code size={15} /> Code Snippet
            </button>
            <button
              className={`modal-tab-btn ${activeTab === 'bugs' ? 'active' : ''}`}
              onClick={() => setActiveTab('bugs')}
            >
              <Bug size={15} /> 2. Bugs ({bugs.length || rr.bugs?.length || 0})
            </button>
            <button
              className={`modal-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <ShieldAlert size={15} /> 3. Security
            </button>
            <button
              className={`modal-tab-btn ${activeTab === 'quality' ? 'active' : ''}`}
              onClick={() => setActiveTab('quality')}
            >
              <Layers size={15} /> 4. Quality
            </button>
            <button
              className={`modal-tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              <Zap size={15} /> 5. Performance
            </button>
            <button
              className={`modal-tab-btn ${activeTab === 'complexity' ? 'active' : ''}`}
              onClick={() => setActiveTab('complexity')}
            >
              <Clock size={15} /> 6. Complexity
            </button>
            <button
              className={`modal-tab-btn ${activeTab === 'learning' ? 'active' : ''}`}
              onClick={() => setActiveTab('learning')}
            >
              <BookOpen size={15} /> 7. Learning Guide
            </button>
            <button
              className={`modal-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquareCode size={15} /> 8. AI Chat
            </button>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            {/* TAB: ASSESSMENT */}
            {activeTab === 'overview' && (
              <div>
                <div className="review-section-card">
                  <div className="review-section-header">
                    <Award size={18} color="var(--primary-600)" />
                    <span>Overall Quality & Assessment</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {oa.score ?? review.overallScore}/100
                    </div>
                    {oa.qualityLevel && (
                      <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>
                        Level: {oa.qualityLevel}
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                    {oa.summary || rr.summary || 'Code review completed successfully.'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB: CODE */}
            {activeTab === 'code' && (
              <div>
                <pre className="code-snippet-box">
                  <code>{review.sourceCode}</code>
                </pre>
              </div>
            )}

            {/* TAB: BUGS & ERRORS */}
            {activeTab === 'bugs' && (
              <div>
                {bugs.length > 0 ? (
                  bugs.map((b, i) => (
                    <div key={i} className="review-section-card" style={{ borderLeft: '4px solid var(--danger)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          {b.title}
                        </span>
                        {b.lineNumber && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: '#F1F5F9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            Line {b.lineNumber}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        {b.explanation}
                      </p>
                      {b.debuggingHint && (
                        <div style={{ background: '#EFF6FF', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.825rem', color: '#1E40AF' }}>
                          💡 <strong>Hint:</strong> {b.debuggingHint}
                        </div>
                      )}
                    </div>
                  ))
                ) : rr.bugs && rr.bugs.length > 0 ? (
                  <ul className="review-list">
                    {rr.bugs.map((b, i) => (
                      <li key={i} className="review-list-item" style={{ background: 'var(--danger-bg)' }}>
                        <span style={{ color: 'var(--danger)' }}>•</span>
                        <span>{typeof b === 'string' ? b : JSON.stringify(b)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="review-section-card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No bugs or logical invariant violations flagged.
                  </div>
                )}
              </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === 'security' && (
              <div className="review-section-card">
                <div className="review-section-header">
                  <ShieldAlert size={18} color="var(--danger)" />
                  <span>Security Analysis</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>SQL Injection:</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{sec.sqlInjection || 'None identified'}</div>
                  </div>
                  <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>XSS Risks:</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{sec.xssRisks || 'Not applicable'}</div>
                  </div>
                  <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>Secrets / Credentials:</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{sec.hardcodedSecrets || 'None identified'}</div>
                  </div>
                  <div style={{ background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>Input Validation:</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{sec.unsafeInputHandling || 'Handled appropriately'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: QUALITY */}
            {activeTab === 'quality' && (
              <div className="review-section-card">
                <div className="review-section-header">
                  <Layers size={18} color="var(--primary-600)" />
                  <span>Code Quality & Best Practices</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div><strong>Naming Conventions:</strong> <span style={{ color: 'var(--text-secondary)' }}>{cq.namingConventions || 'Standard'}</span></div>
                  <div><strong>Readability:</strong> <span style={{ color: 'var(--text-secondary)' }}>{cq.readability || 'Clear'}</span></div>
                  <div><strong>Maintainability:</strong> <span style={{ color: 'var(--text-secondary)' }}>{cq.maintainability || 'Modular'}</span></div>
                  <div><strong>Duplication:</strong> <span style={{ color: 'var(--text-secondary)' }}>{cq.codeDuplication || 'Minimal'}</span></div>
                  <div><strong>Best Practices:</strong> <span style={{ color: 'var(--text-secondary)' }}>{cq.bestPractices || 'Language idioms respected'}</span></div>
                </div>
              </div>
            )}

            {/* TAB: PERFORMANCE */}
            {activeTab === 'performance' && (
              <div className="review-section-card">
                <div className="review-section-header">
                  <Zap size={18} color="var(--warning)" />
                  <span>Performance Analysis & Optimizations</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div><strong>Loop Efficiency:</strong> <span style={{ color: 'var(--text-secondary)' }}>{perf.inefficientLoops || 'Optimal'}</span></div>
                  <div><strong>Computations:</strong> <span style={{ color: 'var(--text-secondary)' }}>{perf.unnecessaryComputations || 'No redundant steps'}</span></div>
                  <div><strong>Memory Concerns:</strong> <span style={{ color: 'var(--text-secondary)' }}>{perf.memoryConcerns || 'Normal'}</span></div>
                </div>
                {perf.optimizationSuggestions && perf.optimizationSuggestions.length > 0 && (
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>Suggestions:</strong>
                    <ul className="review-list" style={{ marginTop: '0.5rem' }}>
                      {perf.optimizationSuggestions.map((opt, i) => (
                        <li key={i} className="review-list-item">⚡ {opt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB: COMPLEXITY */}
            {activeTab === 'complexity' && (
              <div className="review-section-card">
                <div className="review-section-header">
                  <Clock size={18} color="var(--purple)" />
                  <span>Complexity Analysis</span>
                </div>
                <div style={{ display: 'flex', gap: '2rem', margin: '1rem 0' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Time Complexity</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--purple)', fontFamily: 'var(--font-mono)' }}>
                      {comp.timeComplexity || rr.timeComplexity || 'O(n)'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Space Complexity</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-600)', fontFamily: 'var(--font-mono)' }}>
                      {comp.spaceComplexity || rr.spaceComplexity || 'O(1)'}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: '4px' }}>
                  {comp.explanation || 'Calculated based on loop constructs and auxiliary allocations.'}
                </p>
              </div>
            )}

            {/* TAB: LEARNING */}
            {activeTab === 'learning' && (
              <div className="review-section-card">
                <div className="review-section-header">
                  <BookOpen size={18} color="var(--info)" />
                  <span>Educational Learning Guide</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {learn.whyIssuesOccur || 'Understanding root invariant causes and edge cases is critical to prevention.'}
                </p>
                {learn.stepByStepDebugging && learn.stepByStepDebugging.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ fontSize: '0.85rem' }}>Step-by-Step Debugging Hints:</strong>
                    <ol style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {learn.stepByStepDebugging.map((s, idx) => (
                        <li key={idx} style={{ marginBottom: '0.35rem' }}>{s}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {learn.illustrativeExamples && learn.illustrativeExamples.length > 0 && (
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>Illustrative Code Patterns:</strong>
                    {learn.illustrativeExamples.map((ex, idx) => (
                      <div key={idx} style={{ marginTop: '0.5rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Concept: {ex.concept}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <div style={{ background: '#FEF2F2', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: '#991B1B' }}>
                            ❌ {ex.antiPattern}
                          </div>
                          <div style={{ background: '#ECFDF5', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: '#065F46' }}>
                            ✅ {ex.improvedPattern}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: AI FOLLOW-UP CHAT */}
            {activeTab === 'chat' && (
              <div className="review-section-card" style={{ height: '100%', minHeight: '380px' }}>
                <ReviewChatDrawer
                  review={review}
                  onUpdateChat={(msgs) => {
                    review.chatMessages = msgs;
                  }}
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReviewDetailModal;
