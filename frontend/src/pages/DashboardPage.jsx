import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileCode2, 
  TrendingUp, 
  ArrowRight, 
  Plus, 
  Code2, 
  ExternalLink,
  ShieldAlert,
  Bug,
  GitCompare,
  BarChart3,
  Calendar,
  Layers,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import SkeletonLoader from '../components/SkeletonLoader';
import ReviewDetailModal from '../components/ReviewDetailModal';
import CodeCompareModal from '../components/CodeCompareModal';
import '../styles/dashboard.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [compareReview, setCompareReview] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [revRes, insRes] = await Promise.all([
        api.get('/reviews?limit=5'),
        api.get('/reviews/insights'),
      ]);

      if (revRes.data.success) {
        setReviews(revRes.data.reviews);
      }
      if (insRes.data.success) {
        setInsights(insRes.data.insights);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching analytics:', err);
      showToast('Could not load recent review analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteReview = async (id) => {
    try {
      await api.delete(`/reviews/${id}`);
      showToast('Review removed from history.', 'info');
      setSelectedReview(null);
      fetchDashboardData();
    } catch (err) {
      showToast('Failed to delete review.', 'error');
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return 'badge-success';
    if (score >= 60) return 'badge-warning';
    return 'badge-danger';
  };

  const totalReviews = insights?.totalReviews || reviews.length;
  const avgScore = insights?.averageScore || 0;
  const totalIssues = insights?.totalIssues || 0;
  const issuesBySev = insights?.issuesBySeverity || { Critical: 0, High: 0, Medium: 0, Low: 0 };
  const langDist = insights?.languageDistribution || {};

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <div className="dashboard-container">
          {/* Welcome Header */}
          <div className="welcome-header">
            <div className="welcome-title-group">
              <h1>Welcome back, {user?.name?.split(' ')[0] || 'Developer'} 👋</h1>
              <p>Explore your code review metrics, severity insights, and algorithmic quality.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setCompareReview(reviews[0] || null)}
                disabled={reviews.length < 2}
                title={reviews.length < 2 ? 'Need at least 2 reviews to compare' : 'Compare review versions'}
              >
                <GitCompare size={16} />
                <span>Compare Versions</span>
              </button>

              <Link to="/review" className="btn btn-primary">
                <Plus size={16} />
                <span>New Review</span>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Total Code Reviews"
              value={loading ? '...' : totalReviews}
              icon={FileCode2}
              color="var(--primary-600)"
              bg="var(--primary-50)"
              trend="All-time sessions"
              delay={0}
            />
            <StatCard
              title="Average Quality Score"
              value={loading ? '...' : `${avgScore}/100`}
              icon={TrendingUp}
              color="var(--success)"
              bg="var(--success-bg)"
              trend={avgScore >= 80 ? 'Optimal standards' : 'Requires optimization'}
              delay={0.1}
            />
            <StatCard
              title="Audited Invariants & Bugs"
              value={loading ? '...' : totalIssues}
              icon={Bug}
              color="var(--warning)"
              bg="var(--warning-bg)"
              trend="Defects flagged"
              delay={0.2}
            />
            <StatCard
              title="Languages Audited"
              value={loading ? '...' : Object.keys(langDist).filter((k) => langDist[k] > 0).length}
              icon={Code2}
              color="var(--info)"
              bg="var(--info-bg)"
              trend="Multi-language coverage"
              delay={0.3}
            />
          </div>

          {/* Review Insights & Analytics Section */}
          <div className="dashboard-section">
            <div className="section-title-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={20} color="var(--primary-600)" />
                <h2>Code Quality Insights & Analytics</h2>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {/* Severity Breakdown Card */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Issues Flagged by Severity
                  </span>
                  <ShieldAlert size={18} color="var(--danger)" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { label: 'Critical', count: issuesBySev.Critical || 0, color: '#B91C1C', bg: '#FEE2E2' },
                    { label: 'High', count: issuesBySev.High || 0, color: '#C2410C', bg: '#FFEDD5' },
                    { label: 'Medium', count: issuesBySev.Medium || 0, color: '#854D0E', bg: '#FEF9C3' },
                    { label: 'Low', count: issuesBySev.Low || 0, color: '#1D4ED8', bg: '#EFF6FF' },
                  ].map((item) => {
                    const pct = totalIssues > 0 ? Math.round((item.count / totalIssues) * 100) : 0;
                    return (
                      <div key={item.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600, color: item.color }}>{item.label}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{item.count} issues ({pct}%)</span>
                        </div>
                        <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Language Distribution Card */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Programming Language Distribution
                  </span>
                  <Code2 size={18} color="var(--primary-600)" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { key: 'python', label: 'Python', color: '#854D0E', badge: 'badge-python' },
                    { key: 'javascript', label: 'JavaScript', color: '#713F12', badge: 'badge-javascript' },
                    { key: 'cpp', label: 'C++', color: '#0077B6', badge: 'badge-cpp' },
                    { key: 'java', label: 'Java', color: '#EA580C', badge: 'badge-java' },
                  ].map((item) => {
                    const count = langDist[item.key] || 0;
                    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                    return (
                      <div key={item.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.25rem' }}>
                          <span className={`badge ${item.badge}`}>{item.label}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{count} reviews ({pct}%)</span>
                        </div>
                        <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quality Level Distribution */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Quality Level Breakdown
                  </span>
                  <Layers size={18} color="var(--purple)" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {insights?.qualityDistribution ? (
                    Object.entries(insights.qualityDistribution).map(([label, count]) => {
                      const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                      return (
                        <div key={label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                          </div>
                          <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary-600)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data available.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reviews Table */}
          <div className="dashboard-section">
            <div className="section-title-row">
              <h2>Recent Code Reviews</h2>
              <Link to="/history" className="btn btn-secondary" style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem' }}>
                View Full History <ArrowRight size={14} />
              </Link>
            </div>

            <div className="reviews-table-card">
              {loading ? (
                <div style={{ padding: '2rem' }}>
                  <SkeletonLoader count={4} height="28px" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <FileCode2 size={24} />
                  </div>
                  <h3>No reviews yet</h3>
                  <p>
                    Submit your first C++, Java, Python, or JavaScript code snippet to launch
                    the 7-section structured code review pipeline.
                  </p>
                  <Link to="/review" className="btn btn-primary">
                    <Plus size={16} /> Submit Your First Review
                  </Link>
                </div>
              ) : (
                <table className="reviews-table">
                  <thead>
                    <tr>
                      <th>Title & Language</th>
                      <th>Score & Mode</th>
                      <th>Time & Space</th>
                      <th>Submitted</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((rev) => (
                      <tr key={rev._id}>
                        <td>
                          <div className="review-title-cell">
                            <span className={`badge badge-${rev.programmingLanguage}`}>
                              {rev.programmingLanguage}
                            </span>
                            <span>{rev.title || 'Untitled Review'}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span className={`badge ${getScoreBadge(rev.overallScore)}`}>
                              {rev.overallScore}/100
                            </span>
                            <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                              {(rev.reviewMode || 'detailed').toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                          {rev.reviewResult?.timeComplexity || 'O(n)'} • {rev.reviewResult?.spaceComplexity || 'O(1)'}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
                              onClick={() => setSelectedReview(rev)}
                              title="Inspect review details and chat"
                            >
                              <ExternalLink size={13} />
                              View
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
                              onClick={() => setCompareReview(rev)}
                              title="Compare this code with another revision"
                            >
                              <GitCompare size={13} />
                              Diff
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Review Details & Chat Modal */}
      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onDelete={handleDeleteReview}
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

export default DashboardPage;
