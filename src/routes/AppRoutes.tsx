// ============================================
// ROUTE CONFIGURATION
// ============================================

import React, { lazy } from 'react';

// Route path constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  BUILDER: '/builder',
  TEMPLATES: '/templates',
  PRICING: '/pricing',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  FORGOT_PASSWORD: '/forgot-password',
} as const;

// Route configuration - using relative imports that work with CRA
export const routeConfig = [
  {
    path: ROUTES.HOME,
    component: lazy(() => import('../pages/Home')),
    public: true,
    title: 'ATS Resume Builder - Create ATS-Friendly Resumes',
  },
  {
    path: ROUTES.LOGIN,
    component: lazy(() => import('../pages/Login')),
    public: true,
    title: 'Sign In - ATS Resume Builder',
  },
  {
    path: ROUTES.REGISTER,
    component: lazy(() => import('../pages/Register')),
    public: true,
    title: 'Create Account - ATS Resume Builder',
  },
  {
    path: ROUTES.DASHBOARD,
    component: lazy(() => import('../pages/Dashboard')),
    protected: true,
    title: 'Dashboard - ATS Resume Builder',
  },
  {
    path: ROUTES.BUILDER,
    component: lazy(() => import('../pages/Builder')),
    protected: true,
    title: 'Resume Builder - ATS Resume Builder',
  },
  {
    path: ROUTES.PRICING,
    component: lazy(() => import('../pages/Pricing')),
    public: true,
    title: 'Pricing - ATS Resume Builder',
  },
];

// Navigation items for header
export const navItems = [
  { label: 'Features', href: '/#features', public: true },
  { label: 'Templates', href: '/templates', protected: true },
  { label: 'Pricing', href: '/pricing', public: true },
];

// Dashboard sidebar items
export const sidebarItems = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: '📊' },
  { label: 'Create Resume', href: ROUTES.BUILDER, icon: '📝' },
  { label: 'Templates', href: ROUTES.TEMPLATES, icon: '🎨' },
  { label: 'Profile', href: ROUTES.PROFILE, icon: '👤' },
  { label: 'Settings', href: ROUTES.SETTINGS, icon: '⚙️' },
];

// Check if route requires authentication
export const isProtectedRoute = (path: string): boolean => {
  const protectedPaths = [
    ROUTES.DASHBOARD,
    ROUTES.BUILDER,
    ROUTES.TEMPLATES,
    ROUTES.PROFILE,
    ROUTES.SETTINGS,
  ];
  return protectedPaths.includes(path as any);
};

// Check if route is public only (redirect if authenticated)
export const isPublicOnlyRoute = (path: string): boolean => {
  const publicOnlyPaths = [ROUTES.LOGIN, ROUTES.REGISTER];
  return publicOnlyPaths.includes(path as any);
};