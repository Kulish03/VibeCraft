import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  GitCompare, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  Layers
} from 'lucide-react';
import api from '../services/api';

const CodeCompareModal = ({ baseReview, allReviews = [], onClose }) => {
  const [selectedBaseId, setSelectedBaseId] = useState(baseReview?._id || '');
  const [comparisonId, setComparisonId] = useState('');
  const [revisedCode, setRevisedCode] = useState('');
  const [compareMode, setCompareMode] = useState('review'); // 'review' | 'custom'
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [error, setError] = useState('');

  // Default comparison to another review of the same language if available
  useEffect(() => {
    if (baseReview) {
      setSelectedBaseId(baseReview._id);
      const other = allReviews.find((r) => r._id !== baseReview._id && r.programmingLanguage === baseReview.programmingLanguage);
      if (other) {
        setComparisonId(other._id);
      }
    }
  }, [baseReview, allReviews]);

  const handleRunComparison = async () => {
    setError('');
    setLoading(true);
    setComparisonResult(null);

    try {
      const payload = {
        baseReviewId: selectedBaseId,
      };

      if (compareMode === 'review') {
        if (!comparisonId) {
          setError('Please select a comparison review.');
          setLoading(false);
          return;
        }
        payload.comparisonReviewId = comparisonId;
      } else {
        if (!revisedCode.trim()) {
          setError('Please provide revised source code to compare.');
          setLoading(false);
          return;
        }
        payload.revisedCode = revisedCode.trim();
        payload.originalCode = allReviews.find((r) => r._id === selectedBaseId)?.sourceCode || '';
        payload.programmingLanguage = allReviews.find((r) => r._id === selectedBaseId)?.programmingLanguage || 'python';
      }

      const res = await api.post('/reviews/compare', payload);
      if (res.data.success) {
        setComparisonResult(res.data.comparison);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Comparison failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentBaseReview = allReviews.find((r) => r._id === selectedBaseId) || baseReview;
  const currentCompReview = allReviews.find((r) => r._id === comparisonId);

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="modal-content"
          style={{ maxWidth: '960px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-group">
              <div className="brand-icon-wrapper" style={{ width: '2rem', height: '2rem' }}>
                <GitCompare size={16} />
              </div>
              <h2 className="modal-title">Code Version Comparison & Evolution Audit</h2>
            </div>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            {/* Mode Selector & Review Pickers */}
            <div className="section-card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className={`filter-pill ${compareMode === 'review' ? 'active' : ''}`}
                    onClick={() => setCompareMode('review')}
                  >
                    Compare 2 Saved Reviews
                  </button>
                  <button
                    className={`filter-pill ${compareMode === 'custom' ? 'active' : ''}`}
                    onClick={() => setCompareMode('custom')}
                  >
                    Compare with New Draft Code
                  </button>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleRunComparison}
                  disabled={loading}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <Sparkles size={14} />
                  <span>{loading ? 'Evaluating Evolution...' : 'Run Comparison'}</span>
                </button>
              </div>

              {/* Dropdowns */}
              <div style={{ display: 'grid', gridTemplateColumns: compareMode === 'review' ? '1fr auto 1fr' : '1fr', gap: '0.75rem', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                    Original Version (Base)
                  </label>
                  <select
                    value={selectedBaseId}
                    onChange={(e) => setSelectedBaseId(e.target.value)}
                    className="select-control"
                    style={{ width: '100%' }}
                  >
                    {allReviews.map((r) => (
                      <option key={r._id} value={r._id}>
                        [{r.programmingLanguage.toUpperCase()}] {r.title} ({r.overallScore}/100)
                      </option>
                    ))}
                  </select>
                </div>

                {compareMode === 'review' && (
                  <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '1.25rem' }}>
                    <ArrowRight size={20} color="var(--primary-600)" />
                  </div>
                )}

                {compareMode === 'review' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Revised Version (Comparison)
                    </label>
                    <select
                      value={comparisonId}
                      onChange={(e) => setComparisonId(e.target.value)}
                      className="select-control"
                      style={{ width: '100%' }}
                    >
                      <option value="">-- Choose comparison review --</option>
                      {allReviews
                        .filter((r) => r._id !== selectedBaseId)
                        .map((r) => (
                          <option key={r._id} value={r._id}>
                            [{r.programmingLanguage.toUpperCase()}] {r.title} ({r.overallScore}/100)
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {compareMode === 'custom' && (
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                    Revised Source Code Input
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Paste revised code version to audit against original..."
                    value={revisedCode}
                    onChange={(e) => setRevisedCode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-primary)',
                      resize: 'vertical',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Error Banner */}
            {error && (
              <div className="auth-alert auth-alert-error" style={{ marginBottom: '1rem' }}>
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Comparison Results Card */}
            {comparisonResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {/* Score Delta Banner */}
                <div
                  className="section-card"
                  style={{
                    background: comparisonResult.scoreDelta >= 0 ? '#ECFDF5' : '#FEF2F2',
                    border: `1px solid ${comparisonResult.scoreDelta >= 0 ? '#A7F3D0' : '#FECACA'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {comparisonResult.scoreDelta >= 0 ? (
                        <TrendingUp size={22} color="var(--success)" />
                      ) : (
                        <TrendingDown size={22} color="var(--danger)" />
                      )}
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: comparisonResult.scoreDelta >= 0 ? '#065F46' : '#991B1B' }}>
                        Score Evolution: {comparisonResult.scoreDelta >= 0 ? `+${comparisonResult.scoreDelta}` : comparisonResult.scoreDelta} Points
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Base Score: {comparisonResult.baseScore}/100 ➔ Revised Score: {comparisonResult.revisedScore}/100
                    </div>
                  </div>

                  <span className={`badge ${comparisonResult.scoreDelta >= 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.9rem' }}>
                    {comparisonResult.scoreDelta >= 0 ? 'Improvement' : 'Regression'}
                  </span>
                </div>

                {/* Summary */}
                <div className="section-card">
                  <div className="section-card-title">
                    <Sparkles size={16} color="var(--primary-600)" />
                    <span>Evolution Summary</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {comparisonResult.summary}
                  </p>
                </div>

                {/* Fixed Issues & New Regressions Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  {/* Fixed Issues */}
                  <div className="section-card" style={{ borderTop: '3px solid var(--success)' }}>
                    <div className="section-card-title" style={{ color: '#065F46' }}>
                      <CheckCircle2 size={16} color="var(--success)" />
                      <span>Fixed Issues ({comparisonResult.fixedIssues?.length || 0})</span>
                    </div>
                    {comparisonResult.fixedIssues && comparisonResult.fixedIssues.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {comparisonResult.fixedIssues.map((fix, idx) => (
                          <div key={idx} style={{ background: '#F0FDF4', padding: '0.6rem 0.75rem', borderRadius: '4px', border: '1px solid #BBF7D0' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#166534' }}>✅ {fix.title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{fix.explanation}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No previous defects were confirmed as resolved in this revision.</p>
                    )}
                  </div>

                  {/* New Issues */}
                  <div className="section-card" style={{ borderTop: '3px solid var(--danger)' }}>
                    <div className="section-card-title" style={{ color: '#991B1B' }}>
                      <AlertTriangle size={16} color="var(--danger)" />
                      <span>Newly Introduced Issues ({comparisonResult.newIssues?.length || 0})</span>
                    </div>
                    {comparisonResult.newIssues && comparisonResult.newIssues.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {comparisonResult.newIssues.map((bug, idx) => (
                          <div key={idx} style={{ background: '#FEF2F2', padding: '0.6rem 0.75rem', borderRadius: '4px', border: '1px solid #FECACA' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#991B1B' }}>⚠️ [{bug.severity || 'Medium'}] {bug.title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{bug.explanation}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle2 size={15} /> Clean revision. No new bugs or regressions detected!
                      </p>
                    )}
                  </div>
                </div>

                {/* Quality Evolution Narrative */}
                {comparisonResult.qualityEvolution && (
                  <div className="section-card">
                    <div className="section-card-title">
                      <Layers size={16} color="var(--primary-600)" />
                      <span>Quality & Maintainability Evolution</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {comparisonResult.qualityEvolution}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CodeCompareModal;
