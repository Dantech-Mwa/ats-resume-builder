// ============================================
// LOADING COMPONENT - Multiple Loading States
// ============================================

import React from 'react';

interface LoadingProps {
  type?: 'spinner' | 'skeleton' | 'dots' | 'pulse' | 'page';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
  overlay?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  type = 'spinner',
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
  className = '',
  overlay = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const containerClasses = `
    ${fullScreen ? 'fixed inset-0 z-50 flex items-center justify-center' : 'flex items-center justify-center'}
    ${overlay ? 'bg-white/80 backdrop-blur-sm' : ''}
    ${className}
  `;

  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return <Spinner size={size} />;
      case 'skeleton':
        return <SkeletonLoader />;
      case 'dots':
        return <DotsLoader size={size} />;
      case 'pulse':
        return <PulseLoader size={size} />;
      case 'page':
        return <PageLoader text={text} />;
      default:
        return <Spinner size={size} />;
    }
  };

  return (
    <div className={containerClasses} role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-3">
        {renderLoader()}
        {text && type !== 'page' && (
          <p className="text-sm text-gray-500 animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
};

// Spinner Component
const Spinner: React.FC<{ size: 'sm' | 'md' | 'lg' }> = ({ size }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full
        border-gray-200
        border-t-blue-600
        animate-spin
      `}
    />
  );
};

// Skeleton Loader
const SkeletonLoader: React.FC = () => (
  <div className="w-full max-w-2xl space-y-4 p-6">
    <div className="space-y-3">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
    </div>
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
    <div className="space-y-3">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
    </div>
  </div>
);

// Dots Loader
const DotsLoader: React.FC<{ size: 'sm' | 'md' | 'lg' }> = ({ size }) => {
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
  };

  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${dotSizes[size]} bg-blue-600 rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
};

// Pulse Loader
const PulseLoader: React.FC<{ size: 'sm' | 'md' | 'lg' }> = ({ size }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-25" />
      <div className="relative bg-blue-500 rounded-full w-full h-full flex items-center justify-center">
        <svg className="w-1/2 h-1/2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    </div>
  );
};

// Page Loader
const PageLoader: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex flex-col items-center gap-6">
    <div className="relative">
      <div className="w-20 h-20 border-4 border-blue-200 rounded-full" />
      <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
    </div>
    <div className="text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{text}</h3>
      <p className="text-sm text-gray-500">Please wait while we set things up</p>
    </div>
  </div>
);

// Export specialized loaders
export const ButtonLoader: React.FC = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export const InlineLoader: React.FC<{ text?: string }> = ({ text }) => (
  <span className="inline-flex items-center gap-2">
    <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    {text && <span className="text-sm text-gray-600">{text}</span>}
  </span>
);

export default Loading;