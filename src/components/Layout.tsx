// ============================================
// LAYOUT COMPONENT - Main App Layout
// ============================================

import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './Header';
import Footer from './Footer';
import { useUI } from '../store';

const Layout: React.FC = () => {
  const location = useLocation();
  const { ui } = useUI();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Apply theme class to body
  useEffect(() => {
    document.documentElement.classList.toggle('dark', ui.theme === 'dark');
  }, [ui.theme]);

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isBuilderPage = location.pathname === '/builder';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Toast Notifications */}
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
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      {!isAuthPage && <Header />}

      {/* Main Content */}
      <main className={`flex-1 ${!isAuthPage ? 'pt-16' : ''} ${isBuilderPage ? 'h-screen overflow-hidden' : ''}`}>
        <Outlet />
      </main>

      {/* Footer */}
      {!isAuthPage && !isBuilderPage && <Footer />}
    </div>
  );
};

export default Layout;