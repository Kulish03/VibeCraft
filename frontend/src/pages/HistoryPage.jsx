import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Search, 
  Trash2, 
  ExternalLink, 
  GitCompare, 
  Filter,
  Plus,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import SkeletonLoader from '../components/SkeletonLoader';
import ReviewDetailModal from '../components/ReviewDetailModal';
import CodeCompareModal from '../components/CodeCompareModal';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import '../styles/history.css';

const HistoryPage = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [compareReview, setCompareReview] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: 100 });
      if (selectedLanguage !== 'all') params.append('language', selectedLanguage);
      if (selectedMode !== 'all') params.append('mode', selectedMode);
      if (selectedDate !== 'all') params.append('date', selectedDate);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get(`/reviews?${params.toString()}`);
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error('[History] Error fetching review history:', err);
      showToast('Failed to load review history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedLanguage, selectedMode, selectedDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReviews();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this code review?')) {
      return;
    }

    try {
      await api.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      if (selectedReview?._id === id) {
        setSelectedReview(null);
      }
      showToast('Code review successfully deleted.', 'info');
    } catch (err) {
      console.error('[History] Failed to delete review:', err);
      showToast('Could not delete review.', 'error');
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return 'badge-success';
    if (score >= 60) return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <div className="history-container">
          {/* Header */}
          <div className="history-header">
            <div className="history-title-group">
              <h1>Review History & Revisions</h1>
              <p>Explore, filter, compare, and audit your past code review sessions.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setCompareReview(reviews[0] || null)}
                disabled={reviews.length < 2}
                title={reviews.length < 2 ? 'Need at least 2 reviews to compare' : 'Compare review versions'}
              >
                <GitCompare size={16} />
                <span>Compare Revisions</span>
              </button>

              <Link to="/review" className="btn btn-primary">
                <Plus size={16} />
                <span>New Review</span>
              </Link>
            </div>
          </div>

          {/* Controls: Multi-Dimensional Filter Bar */}
          <div className="history-controls" style={{ background: 'var(--bg-surface)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
            {/* Language Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Language</span>
              <div className="filter-pills">
                {['all', 'python', 'javascript', 'cpp', 'java'].map((lang) => (
                  <button
                    key={lang}
                    className={`filter-pill ${selectedLanguage === lang ? 'active' : ''}`}
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    {lang === 'all' ? 'All' : lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Review Mode</span>
              <div className="filter-pills">
                {[
                  { key: 'all', label: 'All Modes' },
                  { key: 'detailed', label: 'Detailed' },
                  { key: 'basic', label: 'Basic' },
                  { key: 'security', label: 'Security' },
                  { key: 'performance', label: 'Performance' },
                ].map((mode) => (
                  <button
                    key={mode.key}
                    className={`filter-pill ${selectedMode === mode.key ? 'active' : ''}`}
                    onClick={() => setSelectedMode(mode.key)}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Timeframe</span>
              <div className="filter-pills">
                {[
                  { key: 'all', label: 'All Time' },
                  { key: 'today', label: 'Today' },
                  { key: 'week', label: 'Past 7 Days' },
                  { key: 'month', label: 'Past 30 Days' },
                ].map((d) => (
                  <button
                    key={d.key}
                    className={`filter-pill ${selectedDate === d.key ? 'active' : ''}`}
                    onClick={() => setSelectedDate(d.key)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyword Search */}
            <form onSubmit={handleSearchSubmit} className="search-input-wrapper" style={{ marginTop: 'auto' }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search reviews or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </form>
          </div>

          {/* Reviews List */}
          <div className="history-card-list">
            {loading ? (
              <div style={{ padding: '2rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                <SkeletonLoader count={5} height="44px" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
                <div className="empty-state-icon" style={{ margin: '0 auto 1rem' }}>
                  <History size={24} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>No reviews found</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                  No reviews match your selected filter criteria. Try expanding the timeframe or switching the language filter.
                </p>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedLanguage('all');
                    setSelectedMode('all');
                    setSelectedDate('all');
                    setSearchQuery('');
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <AnimatePresence>
                {reviews.map((rev, index) => (
                  <motion.div
                    key={rev._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    className="history-item-card"
                  >
                    <div className="history-item-left">
                      <span className={`badge badge-${rev.programmingLanguage}`} style={{ minWidth: '70px', justifyContent: 'center' }}>
                        {rev.programmingLanguage}
                      </span>
                      <div className="history-item-details">
                        <h3>{rev.title || 'Untitled Review'}</h3>
                        <div className="history-item-meta">
                          <span>
                            {new Date(rev.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>•</span>
                          <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                            {(rev.reviewMode || 'detailed').toUpperCase()}
                          </span>
                          <span>•</span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>
                            {rev.reviewResult?.timeComplexity || 'O(n)'} • {rev.reviewResult?.spaceComplexity || 'O(1)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="history-item-right">
                      <span className={`badge ${getScoreBadge(rev.overallScore)}`}>
                        Score: {rev.overallScore}/100
                      </span>

                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
                        onClick={() => setSelectedReview(rev)}
                        title="View complete 7-section review and chat"
                      >
                        <ExternalLink size={14} />
                        View
                      </button>

                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
                        onClick={() => setCompareReview(rev)}
                        title="Compare with another review or revised code"
                      >
                        <GitCompare size={14} />
                        Diff
                      </button>

                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.45rem 0.65rem' }}
                        onClick={() => handleDelete(rev._id)}
                        title="Delete Review"
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      {/* Review Details & Follow-up Chat Modal */}
      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onDelete={handleDelete}
        />
      )}

      {/* Code Comparison Modal */}
      {compareReview && (
        <CodeCompareModal
          baseReview={compareReview}
          allReviews={reviews}
          onClose={() => setCompareReview(null)}
        />
      )}
    </div>
  );
};

export default HistoryPage;
