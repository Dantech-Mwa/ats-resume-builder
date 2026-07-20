// ============================================
// APP COMPONENT - Main Application with Routing
// ============================================

import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';
import { useAuth, useUI } from './store';
import { authService } from './lib/firebase';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Builder = lazy(() => import('./pages/Builder'));
const Pricing = lazy(() => import('./pages/Pricing'));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loading type="page" text="Loading page..." />
  </div>
);

const App: React.FC = () => {
  const { user, isAuthenticated, login, logout, setAuthLoading } = useAuth();
  const { ui } = useUI();

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          login(currentUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', ui.theme === 'dark');
  }, [ui.theme]);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
          },
        }}
      />
      
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pricing" element={<Pricing />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/builder"
              element={
                <ProtectedRoute>
                  <Builder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates"
              element={
                <ProtectedRoute>
                  <div className="container-custom py-8">
                    <h1 className="section-heading">Templates</h1>
                    <p className="section-subheading">Choose from our collection of ATS-optimized templates.</p>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div className="container-custom py-8">
                    <h1 className="section-heading">Profile</h1>
                    <p className="section-subheading">Manage your account settings.</p>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <div className="container-custom py-8">
                    <h1 className="section-heading">Settings</h1>
                    <p className="section-subheading">Configure your preferences.</p>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Legal Pages */}
            <Route path="/privacy" element={
              <div className="container-custom py-16">
                <h1 className="section-heading">Privacy Policy</h1>
                <div className="prose max-w-3xl mt-8">
                  <p>Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.</p>
                  <h2>Information Collection</h2>
                  <p>We collect information you provide when creating an account, including your name, email address, and resume content.</p>
                  <h2>Data Usage</h2>
                  <p>Your data is used solely to provide and improve our resume building services. We do not sell or share your personal information.</p>
                  <h2>Data Protection</h2>
                  <p>We implement industry-standard security measures to protect your data. All data is encrypted in transit and at rest.</p>
                </div>
              </div>
            } />
            <Route path="/terms" element={
              <div className="container-custom py-16">
                <h1 className="section-heading">Terms of Service</h1>
                <div className="prose max-w-3xl mt-8">
                  <p>By using ATS Resume Builder, you agree to these terms of service.</p>
                  <h2>Service Usage</h2>
                  <p>You may use our service to create and download resumes. You retain all rights to your resume content.</p>
                  <h2>Subscription</h2>
                  <p>Paid features require an active subscription. You may cancel at any time.</p>
                  <h2>Limitations</h2>
                  <p>We reserve the right to modify or discontinue services with reasonable notice.</p>
                </div>
              </div>
            } />

            {/* 404 Page */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page not found</p>
                  <a href="/" className="btn-primary">
                    Go Home
                  </a>
                </div>
              </div>
            } />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;