// ============================================
// APPLICATION CONSTANTS
// ============================================

import { PricingPlan, TemplateConfig } from '../lib/types';

// -------------------------------------------
// APP CONFIGURATION
// -------------------------------------------

export const APP_CONFIG = {
  name: process.env.REACT_APP_NAME || 'ATS Resume Builder',
  version: process.env.REACT_APP_VERSION || '1.0.0',
  environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  baseUrl: process.env.REACT_APP_BASE_URL || 'http://localhost:3000',
};

// -------------------------------------------
// PRICING PLANS
// -------------------------------------------

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'trial',
    name: '14-Day Trial',
    price: Number(process.env.REACT_APP_TRIAL_PRICE) || 1,
    currency: process.env.REACT_APP_CURRENCY || 'USD',
    duration: 'trial',
    features: [
      'Full access for 14 days',
      'AI-powered resume optimization',
      '5 professional templates',
      'ATS score analysis',
      'Unlimited downloads',
      'Basic support',
    ],
    highlighted: false,
    badge: 'START HERE',
    buttonText: 'Start Trial',
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: Number(process.env.REACT_APP_MONTHLY_PRICE) || 5,
    currency: process.env.REACT_APP_CURRENCY || 'USD',
    duration: 'monthly',
    features: [
      'Everything in Trial',
      'All premium templates',
      'Advanced AI suggestions',
      'Job description matching',
      'Priority support',
      'Custom branding',
      'LinkedIn import',
      'Bulk export',
    ],
    highlighted: true,
    badge: 'POPULAR',
    buttonText: 'Subscribe Monthly',
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: Number(process.env.REACT_APP_YEARLY_PRICE) || 50,
    originalPrice: 60,
    currency: process.env.REACT_APP_CURRENCY || 'USD',
    duration: 'yearly',
    features: [
      'Everything in Monthly',
      'Save 17% ($10/year)',
      'Early access to new features',
      'Dedicated account manager',
      'Team collaboration',
      'API access',
      'White-label exports',
      'Custom AI training',
    ],
    highlighted: false,
    badge: 'BEST VALUE',
    buttonText: 'Subscribe Yearly',
  },
];

// -------------------------------------------
// RESUME SECTIONS CONFIGURATION
// -------------------------------------------

export const RESUME_SECTIONS = [
  {
    id: 'contact',
    title: 'Contact Information',
    icon: '📇',
    required: true,
    description: 'Your personal and contact details',
  },
  {
    id: 'summary',
    title: 'Professional Summary',
    icon: '📝',
    required: true,
    description: 'Brief overview of your professional profile',
  },
  {
    id: 'experience',
    title: 'Work Experience',
    icon: '💼',
    required: true,
    description: 'Your professional work history',
  },
  {
    id: 'education',
    title: 'Education',
    icon: '🎓',
    required: true,
    description: 'Your academic background',
  },
  {
    id: 'skills',
    title: 'Skills',
    icon: '🛠️',
    required: true,
    description: 'Technical and soft skills',
  },
  {
    id: 'certifications',
    title: 'Certifications',
    icon: '📜',
    required: false,
    description: 'Professional certifications and licenses',
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: '🚀',
    required: false,
    description: 'Notable projects and portfolios',
  },
  {
    id: 'languages',
    title: 'Languages',
    icon: '🌍',
    required: false,
    description: 'Languages you speak',
  },
  {
    id: 'volunteer',
    title: 'Volunteer Experience',
    icon: '🤝',
    required: false,
    description: 'Community service and volunteering',
  },
  {
    id: 'publications',
    title: 'Publications',
    icon: '📚',
    required: false,
    description: 'Published works and research',
  },
  {
    id: 'awards',
    title: 'Awards & Honors',
    icon: '🏆',
    required: false,
    description: 'Recognition and achievements',
  },
];

// -------------------------------------------
// SKILL CATEGORIES
// -------------------------------------------

export const SKILL_CATEGORIES = [
  'Programming Languages',
  'Frameworks & Libraries',
  'Databases',
  'Cloud Services',
  'DevOps & Tools',
  'Design & Creative',
  'Marketing',
  'Management',
  'Finance',
  'Healthcare',
  'Education',
  'Sales',
  'Customer Service',
  'Engineering',
  'Data Science',
  'AI & Machine Learning',
  'Cybersecurity',
  'Mobile Development',
  'Web Development',
  'Other',
];

export const SOFT_SKILLS = [
  'Leadership',
  'Communication',
  'Problem Solving',
  'Team Collaboration',
  'Time Management',
  'Critical Thinking',
  'Adaptability',
  'Creativity',
  'Emotional Intelligence',
  'Conflict Resolution',
  'Decision Making',
  'Project Management',
  'Public Speaking',
  'Negotiation',
  'Mentoring',
];

export const LANGUAGE_LEVELS = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'] as const;

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

// -------------------------------------------
// INDUSTRY KEYWORDS
// -------------------------------------------

export const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  technology: [
    'Agile', 'Scrum', 'DevOps', 'CI/CD', 'Cloud Computing',
    'Microservices', 'API', 'Full Stack', 'Machine Learning',
    'Artificial Intelligence', 'Blockchain', 'IoT',
  ],
  finance: [
    'Financial Analysis', 'Risk Management', 'Portfolio Management',
    'Investment Banking', 'Financial Modeling', 'Audit',
    'Compliance', 'Tax Planning', 'Asset Management',
  ],
  healthcare: [
    'Patient Care', 'Clinical Research', 'Healthcare Management',
    'HIPAA', 'Medical Records', 'Diagnostics', 'Treatment Planning',
    'Public Health', 'Pharmaceutical',
  ],
  marketing: [
    'Digital Marketing', 'SEO', 'SEM', 'Content Strategy',
    'Social Media Marketing', 'Brand Management', 'ROI Analysis',
    'Market Research', 'Campaign Management',
  ],
  sales: [
    'Business Development', 'Lead Generation', 'CRM',
    'Account Management', 'Sales Strategy', 'Negotiation',
    'Pipeline Management', 'Customer Acquisition',
  ],
};

// -------------------------------------------
// ACTION VERBS FOR BULLET POINTS
// -------------------------------------------

export const ACTION_VERBS = {
  leadership: [
    'Directed', 'Managed', 'Coordinated', 'Supervised', 'Led',
    'Orchestrated', 'Spearheaded', 'Championed', 'Guided', 'Mentored',
  ],
  achievement: [
    'Achieved', 'Exceeded', 'Improved', 'Increased', 'Reduced',
    'Accelerated', 'Maximized', 'Optimized', 'Streamlined', 'Transformed',
  ],
  creation: [
    'Created', 'Developed', 'Designed', 'Built', 'Established',
    'Launched', 'Introduced', 'Pioneered', 'Conceptualized', 'Engineered',
  ],
  analysis: [
    'Analyzed', 'Evaluated', 'Assessed', 'Researched', 'Investigated',
    'Identified', 'Diagnosed', 'Audited', 'Reviewed', 'Examined',
  ],
  communication: [
    'Presented', 'Negotiated', 'Authored', 'Communicated', 'Articulated',
    'Conveyed', 'Documented', 'Published', 'Reported', 'Briefed',
  ],
};

// -------------------------------------------
// ATS KEYWORDS
// -------------------------------------------

export const ATS_COMMON_KEYWORDS = [
  'Managed', 'Developed', 'Implemented', 'Led', 'Created',
  'Improved', 'Increased', 'Reduced', 'Achieved', 'Delivered',
  'Coordinated', 'Designed', 'Launched', 'Streamlined', 'Optimized',
];

export const ATS_BAD_FORMATS = [
  'Images or graphics',
  'Tables',
  'Headers and footers with important info',
  'Text boxes',
  'Columns (multi-column layouts)',
  'Unusual fonts',
  'Special characters',
  'Charts or graphs',
];

// -------------------------------------------
// TEMPLATE CONFIGURATIONS
// -------------------------------------------

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  modern: {
    id: 'modern',
    name: 'Modern Professional',
    category: 'modern',
    description: 'Clean, contemporary design with a professional touch',
    previewImage: '/templates/modern.png',
    colors: {
      primary: '#2563EB',
      secondary: '#1E40AF',
      accent: '#3B82F6',
      text: '#1F2937',
      background: '#FFFFFF',
      headingText: '#111827',
      borderColor: '#E5E7EB',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
      accent: 'Inter',
      sizes: {
        name: '24px',
        headings: '14px',
        body: '11px',
        small: '9px',
      },
    },
    layout: {
      columns: 2,
      headerStyle: 'left',
      sectionSpacing: 'normal',
      photoEnabled: true,
      iconStyle: 'colored',
    },
    sections: [],
    atsCompatibility: 95,
    popularity: 98,
    isPremium: false,
  },
  executive: {
    id: 'executive',
    name: 'Executive Classic',
    category: 'executive',
    description: 'Traditional and authoritative layout for senior professionals',
    previewImage: '/templates/executive.png',
    colors: {
      primary: '#1F2937',
      secondary: '#374151',
      accent: '#6B7280',
      text: '#111827',
      background: '#FFFFFF',
      headingText: '#000000',
      borderColor: '#D1D5DB',
    },
    fonts: {
      heading: 'Georgia',
      body: 'Georgia',
      accent: 'Arial',
      sizes: {
        name: '22px',
        headings: '13px',
        body: '10px',
        small: '8px',
      },
    },
    layout: {
      columns: 1,
      headerStyle: 'centered',
      sectionSpacing: 'compact',
      photoEnabled: false,
      iconStyle: 'minimal',
    },
    sections: [],
    atsCompatibility: 98,
    popularity: 85,
    isPremium: false,
  },
  creative: {
    id: 'creative',
    name: 'Creative Tech',
    category: 'creative',
    description: 'Modern, bold design for tech and creative industries',
    previewImage: '/templates/creative.png',
    colors: {
      primary: '#7C3AED',
      secondary: '#6D28D9',
      accent: '#8B5CF6',
      text: '#374151',
      background: '#FAFAFA',
      headingText: '#1F2937',
      borderColor: '#E5E7EB',
    },
    fonts: {
      heading: 'Poppins',
      body: 'Inter',
      accent: 'Poppins',
      sizes: {
        name: '26px',
        headings: '15px',
        body: '10px',
        small: '8px',
      },
    },
    layout: {
      columns: 2,
      headerStyle: 'split',
      sectionSpacing: 'spacious',
      photoEnabled: true,
      iconStyle: 'colored',
    },
    sections: [],
    atsCompatibility: 90,
    popularity: 92,
    isPremium: true,
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Academic',
    category: 'academic',
    description: 'Clean, minimal design perfect for academic and research CVs',
    previewImage: '/templates/minimal.png',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10B981',
      text: '#334155',
      background: '#FFFFFF',
      headingText: '#0F172A',
      borderColor: '#CBD5E1',
    },
    fonts: {
      heading: 'Helvetica',
      body: 'Helvetica',
      accent: 'Helvetica',
      sizes: {
        name: '20px',
        headings: '12px',
        body: '10px',
        small: '9px',
      },
    },
    layout: {
      columns: 1,
      headerStyle: 'centered',
      sectionSpacing: 'normal',
      photoEnabled: false,
      iconStyle: 'none',
    },
    sections: [],
    atsCompatibility: 97,
    popularity: 78,
    isPremium: false,
  },
  corporate: {
    id: 'corporate',
    name: 'Corporate Finance',
    category: 'professional',
    description: 'Professional layout optimized for finance and consulting',
    previewImage: '/templates/corporate.png',
    colors: {
      primary: '#0F766E',
      secondary: '#115E59',
      accent: '#14B8A6',
      text: '#1E293B',
      background: '#FFFFFF',
      headingText: '#0F172A',
      borderColor: '#CBD5E1',
    },
    fonts: {
      heading: 'Arial',
      body: 'Arial',
      accent: 'Arial',
      sizes: {
        name: '22px',
        headings: '13px',
        body: '10px',
        small: '9px',
      },
    },
    layout: {
      columns: 1,
      headerStyle: 'left',
      sectionSpacing: 'compact',
      photoEnabled: false,
      iconStyle: 'minimal',
    },
    sections: [],
    atsCompatibility: 99,
    popularity: 88,
    isPremium: true,
  },
};

// -------------------------------------------
// API ENDPOINTS
// -------------------------------------------

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    google: '/api/auth/google',
  },
  resume: {
    create: '/api/resume/create',
    update: '/api/resume/update',
    delete: '/api/resume/delete',
    get: '/api/resume/get',
    list: '/api/resume/list',
    duplicate: '/api/resume/duplicate',
  },
  ai: {
    analyze: '/api/ai/analyze',
    recommend: '/api/ai/recommend',
    optimize: '/api/ai/optimize',
    score: '/api/ai/score',
    keywords: '/api/ai/keywords',
  },
  payment: {
    createOrder: '/api/payment/create-order',
    captureOrder: '/api/payment/capture-order',
    subscription: '/api/payment/subscription',
    cancel: '/api/payment/cancel',
    invoices: '/api/payment/invoices',
  },
  export: {
    pdf: '/api/export/pdf',
    docx: '/api/export/docx',
    txt: '/api/export/txt',
  },
};

// -------------------------------------------
// STORAGE KEYS
// -------------------------------------------

export const STORAGE_KEYS = {
  auth: 'ats_builder_auth',
  user: 'ats_builder_user',
  resume: 'ats_builder_resume',
  template: 'ats_builder_template',
  preferences: 'ats_builder_preferences',
  draft: 'ats_builder_draft',
};

// -------------------------------------------
// UI CONSTANTS
// -------------------------------------------

export const UI_CONSTANTS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['.pdf', '.docx', '.txt', '.doc'],
  maxResumesPerUser: 25,
  autoSaveInterval: 30000, // 30 seconds
  maxUndoSteps: 50,
  debounceDelay: 300,
  animationDuration: 0.3,
};

// -------------------------------------------
// ERROR MESSAGES
// -------------------------------------------

export const ERROR_MESSAGES = {
  auth: {
    invalidEmail: 'Please enter a valid email address',
    weakPassword: 'Password must be at least 8 characters',
    emailInUse: 'An account with this email already exists',
    userNotFound: 'No account found with this email',
    wrongPassword: 'Incorrect password',
    tooManyRequests: 'Too many attempts. Please try again later',
    networkError: 'Network error. Please check your connection',
  },
  payment: {
    failed: 'Payment failed. Please try again',
    invalidCard: 'Invalid card details',
    expired: 'Your subscription has expired',
  },
  resume: {
    notFound: 'Resume not found',
    saveFailed: 'Failed to save resume',
    deleteFailed: 'Failed to delete resume',
    maxReached: 'Maximum number of resumes reached',
  },
};

// -------------------------------------------
// SUCCESS MESSAGES
// -------------------------------------------

export const SUCCESS_MESSAGES = {
  auth: {
    login: 'Welcome back!',
    register: 'Account created successfully!',
    logout: 'Logged out successfully',
  },
  resume: {
    saved: 'Resume saved successfully',
    deleted: 'Resume deleted successfully',
    exported: 'Resume exported successfully',
  },
  payment: {
    success: 'Payment successful!',
    subscription: 'Subscription activated!',
  },
};