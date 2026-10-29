import React from 'react';
import { RouterProvider, useRouter } from './context/RouterContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import HomePage from './pages/HomePage.jsx';
import DirectReviewPage from './pages/DirectReviewPage.jsx';
import './App.css';

function AppContent() {
  const { currentRoute } = useRouter();

  // Client-side route matching
  const renderCurrentPage = () => {
    switch (currentRoute) {
      case '/':
        return <LandingPage />;
      case '/login':
        return <LoginPage />;
      case '/signup':
        return <SignUpPage />;
      case '/home':
        return <HomePage />;
      case '/review':
        return <DirectReviewPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="page-main-content">
        {renderCurrentPage()}
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </AuthProvider>
  );
}
