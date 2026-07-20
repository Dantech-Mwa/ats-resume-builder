// ============================================
// REACT ENTRY POINT
// ============================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Import and register service worker for PWA (optional)
// import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Get root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Failed to find the root element. ' +
    'Make sure there is a <div id="root"></div> in your index.html file.'
  );
}

// Create React root
const root = ReactDOM.createRoot(rootElement);

// Render app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for offline support (optional)
// serviceWorkerRegistration.register({
//   onUpdate: (registration) => {
//     // Show update notification
//     if (registration && registration.waiting) {
//       // Notify user of update
//       alert('A new version is available! Please refresh the page.');
//     }
//   },
// });

// Log app info in development
if (process.env.NODE_ENV === 'development') {
  console.log(
    '%c🚀 ATS Resume Builder %cDev Mode',
    'color: #2563EB; font-size: 16px; font-weight: bold;',
    'color: #6B7280;'
  );
  console.log(
    '%cEnvironment:%c ' + process.env.NODE_ENV,
    'font-weight: bold;',
    'color: #059669;'
  );
}

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(event.reason);
  }
});

// Handle errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(event.error);
  }
});