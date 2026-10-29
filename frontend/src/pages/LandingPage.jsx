import React, { useState } from 'react';
import { Link, useRouter } from '../context/RouterContext.jsx';
import './LandingPage.css';

export default function LandingPage() {
  const { navigate } = useRouter();
  const [activeSnippetTab, setActiveSnippetTab] = useState('python');

  const snippetPreviews = {
    python: {
      lang: 'Python',
      badCode: `# Beginner Code
def avg(nums):
    return sum(nums) / len(nums)
# What if nums is []?
print(avg([]))`,
      bugTag: 'ZeroDivisionError',
      mentorNote: 'Mentor: "What does len([]) evaluate to? Guard with `if not nums: return 0.0` to prevent runtime crashes!"'
    },
    javascript: {
      lang: 'JavaScript',
      badCode: `// Beginner Code
for (var i = 0; i <= arr.length; i++) {
  console.log(arr[i].title);
}
// arr[length] is undefined!`,
      bugTag: 'Off-by-one Error',
      mentorNote: 'Mentor: "Arrays are 0-indexed. Condition should be `i < arr.length`. Also prefer `let` over `var`!"'
    },
    java: {
      lang: 'Java',
      badCode: `// Beginner Code
String s = "";
for (int i = 0; i < n; i++) {
    s += i; // O(n^2) memory
}`,
      bugTag: 'String Concatenation in Loop',
      mentorNote: 'Mentor: "Strings in Java are immutable! Use StringBuilder to avoid allocating hundreds of objects in heap."'
    },
    cpp: {
      lang: 'C++',
      badCode: `// Beginner Code
int* getArr() {
    int arr[10];
    return arr; // Dangling!
}`,
      bugTag: 'Dangling Stack Pointer',
      mentorNote: 'Mentor: "Stack memory is destroyed upon function return! Use `std::vector<int>` for safe automatic memory."'
    }
  };

  const currentPreview = snippetPreviews[activeSnippetTab];

  return (
    <div className="landing-page">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-glow-blob" />
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="sparkle">✨</span> B.Tech CSE Pedagogical Assistant
            </div>
            <h1 className="hero-title">
              Code Reviews Designed for <span className="text-gradient">Beginner Programmers</span>
            </h1>
            <p className="hero-subtitle">
              Stop struggling with cryptic compiler errors and stack traces. Get gentle, Socratic debugging
              hints, line-by-line explanations, and clean refactored examples across Python, JavaScript, Java, and C++.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="btn-primary-hero"
                onClick={() => navigate('/review')}
              >
                <span>🚀</span> Start Code Review
              </button>
              <button
                type="button"
                className="btn-secondary-hero"
                onClick={() => navigate('/signup')}
              >
                Create Demo Account
              </button>
              <button
                type="button"
                className="btn-ghost-hero"
                onClick={() => navigate('/login')}
              >
                Log In
              </button>
            </div>

            <div className="hero-feature-pills">
              <span className="pill-item">✓ No AI API Key Required</span>
              <span className="pill-item">✓ Instant Client-Side Access</span>
              <span className="pill-item">✓ Multi-Language Support</span>
            </div>
          </div>

          {/* Interactive Code Illustration Card */}
          <div className="hero-visual">
            <div className="mock-editor-window">
              <div className="window-header">
                <div className="window-dots">
                  <span className="dot dot-red" />
                  <span className="dot dot-yellow" />
                  <span className="dot dot-green" />
                </div>
                <div className="window-lang-tabs">
                  {Object.keys(snippetPreviews).map((key) => (
                    <button
                      key={key}
                      className={`window-tab ${activeSnippetTab === key ? 'active' : ''}`}
                      onClick={() => setActiveSnippetTab(key)}
                    >
                      {snippetPreviews[key].lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="window-body">
                <div className="code-split-view">
                  <div className="code-half">
                    <div className="split-label">
                      <span className="badge-problem">Buggy Code</span>
                      <span className="badge-tag">{currentPreview.bugTag}</span>
                    </div>
                    <pre className="code-snippet-pre">
                      <code>{currentPreview.badCode}</code>
                    </pre>
                  </div>

                  <div className="feedback-half">
                    <div className="split-label">
                      <span className="badge-mentor">Mentor Critique</span>
                    </div>
                    <div className="mentor-speech-bubble">
                      <p>{currentPreview.mentorNote}</p>
                    </div>
                    <div className="hint-peek">
                      <span className="hint-peek-icon">💡</span>
                      <span>Socratic hint helps students solve it themselves!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section className="section-how-it-works">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-tag">Workflow</span>
            <h2 className="section-title">How It Works in 3 Simple Steps</h2>
            <p className="section-desc">
              Designed according to computer science educational research to encourage problem solving over passive copy-pasting.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3 className="step-heading">Select Language & Paste Code</h3>
              <p className="step-text">
                Choose Python, JavaScript, Java, or C++. Paste your assignment code or load our curated beginner bug templates.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <h3 className="step-heading">Algorithmic & Syntax Scan</h3>
              <p className="step-text">
                The engine evaluates loop bounds, off-by-one errors, null dereferencing, division by zero, and language idioms.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <h3 className="step-heading">Unlock Socratic Hints</h3>
              <p className="step-text">
                Read the clear explanation, reveal step-by-step guidance questions, and compare with the clean refactored implementation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section className="section-features">
        <div className="section-container">
          <div className="section-header-centered">
            <span className="section-tag">Core Features</span>
            <h2 className="section-title">Built Specially for CSE Freshmen</h2>
            <p className="section-desc">
              Traditional linters and compilers emit cryptic messages. We translate them into actionable learning moments.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">🧠</div>
              <h3 className="feature-title">Socratic Hints</h3>
              <p className="feature-description">
                Instead of giving away the entire solution immediately, we provide guided questions that help you reach the 'Aha!' moment.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">🛡️</div>
              <h3 className="feature-title">Edge Case Detection</h3>
              <p className="feature-description">
                Learn to anticipate empty arrays, null pointers, negative integers, and division by zero before submitting assignments.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">⚡</div>
              <h3 className="feature-title">Idiomatic Refactoring</h3>
              <p className="feature-description">
                Discover the clean, modern way to write code—such as Python list comprehensions, Java StringBuilder, and C++ vector containers.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">🌐</div>
              <h3 className="feature-title">Direct or Account Access</h3>
              <p className="feature-description">
                Hop in immediately as a guest to review snippets, or log in to a demo account to track review progress and milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION SECTION */}
      <section className="section-cta">
        <div className="section-container">
          <div className="cta-box">
            <h2 className="cta-title">Ready to Review Your Code?</h2>
            <p className="cta-desc">
              Experience the interactive workspace right now. No software installations or API keys needed.
            </p>
            <div className="cta-actions">
              <button
                type="button"
                className="btn-cta-primary"
                onClick={() => navigate('/review')}
              >
                <span>⚡</span> Launch Code Review Workspace
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
