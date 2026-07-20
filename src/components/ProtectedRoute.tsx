// ============================================
// PROTECTED ROUTE - Auth & Subscription Guard
// ============================================

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store';
import { authService } from '../lib/firebase';
import Loading from './Loading';
import Modal, { ConfirmModal } from './Modal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireSubscription = false,
  redirectTo = '/login',
}) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showTrialEnded, setShowTrialEnded] = useState(false);

  useEffect(() => {
    // Check auth state
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthenticated) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Show loading while checking auth
  if (loading) {
    return <Loading type="page" text="Checking authentication..." fullScreen />;
  }

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check subscription if required
  if (requireSubscription) {
    const subscription = user.subscription;
    const isExpired = new Date(subscription.endDate) < new Date();
    const isCancelled = subscription.status === 'cancelled';

    if (isExpired || isCancelled) {
      return (
        <>
          <ConfirmModal
            isOpen={!showTrialEnded}
            onClose={() => setShowTrialEnded(true)}
            onConfirm={() => {
              setShowTrialEnded(true);
              window.location.href = '/pricing';
            }}
            title="Subscription Required"
            message="Your subscription has expired. Please upgrade to continue using premium features."
            confirmText="View Plans"
            cancelText="Go Back"
            variant="warning"
          />
          {showTrialEnded && <Navigate to="/pricing" replace />}
        </>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;