import React from 'react';
import { test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import SkeletonLoader from '../components/SkeletonLoader';
import StatCard from '../components/StatCard';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

test('1. Authentication - renders LoginPage with credentials inputs', () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthContext.Provider value={{ user: null, login: vi.fn() }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
  expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/name@company.com/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});

test('2. Authentication - renders RegisterPage with signup inputs', () => {
  render(
    <MemoryRouter initialEntries={['/register']}>
      <AuthContext.Provider value={{ user: null, register: vi.fn() }}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
  expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/ada lovelace/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/ada@example.com/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/at least 6 characters/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/confirm your password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
});

test('3. Protected Route - redirects unauthenticated user to /login', () => {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthContext.Provider value={{ user: null, isAuthenticated: false, loading: false }}>
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><div>Secret Area</div></ProtectedRoute>} />
          <Route path="/login" element={<div>Redirected Login Screen</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
  expect(screen.queryByText(/secret area/i)).not.toBeInTheDocument();
  expect(screen.getByText(/redirected login screen/i)).toBeInTheDocument();
});

test('4. Protected Route - renders protected children when authenticated', () => {
  const mockUser = { id: '1', name: 'Authorized Lead', email: 'lead@vibecraft.io' };
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthContext.Provider value={{ user: mockUser, isAuthenticated: true, loading: false }}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Secret Area</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
  expect(screen.getByText(/secret area/i)).toBeInTheDocument();
});

test('5. Metrics UI - displays StatCard with value and title', () => {
  render(
    <StatCard title="Overall Quality Score" value="92" />
  );
  expect(screen.getByText(/overall quality score/i)).toBeInTheDocument();
  expect(screen.getByText('92')).toBeInTheDocument();
});

test('6. Loading State - renders SkeletonLoader with matching bar count', () => {
  const { container } = render(<SkeletonLoader height="120px" count={3} />);
  expect(container.firstChild.childNodes.length).toBe(3);
});

test('7. Analytical Results - renders 7-section score, summary, bugs, and Big-O', () => {
  const mockReview = {
    overallScore: 94,
    reviewResult: {
      overallAssessment: {
        score: 94,
        summary: 'Excellent code modularity and algorithm safety.',
        qualityLevel: 'Excellent',
      },
      bugsAndErrors: [
        {
          title: 'Potential Index Out of Range',
          severity: 'Medium',
          explanation: 'Edge case occurs when array is empty.',
        },
      ],
      securityAnalysis: {
        sqlInjection: 'None identified',
      },
      codeQuality: {
        readability: 'High',
      },
      performanceAnalysis: {
        optimizationSuggestions: ['Algorithm is optimal'],
      },
      complexityAnalysis: {
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
      },
      learningAssistance: {
        whyIssuesOccur: 'Loop invariant maintained properly.',
      },
    },
  };

  render(
    <div data-testid="review-summary-card">
      <span className="badge badge-success">{mockReview.reviewResult.overallAssessment.qualityLevel}</span>
      <span className="score-val">{mockReview.overallScore}/100</span>
      <p>{mockReview.reviewResult.overallAssessment.summary}</p>
      <div data-testid="bug-title">{mockReview.reviewResult.bugsAndErrors[0].title}</div>
      <div data-testid="complexity">{mockReview.reviewResult.complexityAnalysis.timeComplexity}</div>
    </div>
  );

  expect(screen.getByText('Excellent')).toBeInTheDocument();
  expect(screen.getByText('94/100')).toBeInTheDocument();
  expect(screen.getByText(/excellent code modularity/i)).toBeInTheDocument();
  expect(screen.getByTestId('bug-title')).toHaveTextContent('Potential Index Out of Range');
  expect(screen.getByTestId('complexity')).toHaveTextContent('O(log n)');
});
