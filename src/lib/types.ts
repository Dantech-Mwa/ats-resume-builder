/ ============================================
// ATS RESUME BUILDER - COMPLETE TYPE SYSTEM
// ============================================

// -------------------------------------------
// USER & AUTHENTICATION TYPES
// -------------------------------------------

export type SubscriptionPlan = 'trial' | 'monthly' | 'yearly' | 'none';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';
export type PaymentMethod = 'paypal' | 'stripe' | 'none';

export interface Subscription {
  plan: SubscriptionPlan;
  startDate: string;
  endDate: string;
  paymentMethod: PaymentMethod;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  autoRenew: boolean;
  paymentId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription: Subscription;
  savedResumes: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  defaultTemplate: string;
  emailNotifications: boolean;
  showAIAssistant: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// -------------------------------------------
// RESUME TYPES
// -------------------------------------------

export interface ContactInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  country: string;
  linkedIn?: string;
  portfolio?: string;
  github?: string;
  twitter?: string;
}

export interface ProfessionalSummary {
  content: string;
  aiOptimized: boolean;
  lastModified: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  description: string;
  achievements: string[];
  technologies: string[];
  aiSuggestions: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors: string[];
  activities: string[];
  relevantCourses: string[];
}

export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: string;
  yearsOfExperience?: number;
}

export interface SkillsSection {
  technical: Skill[];
  soft: Skill[];
  languages: Skill[];
  tools: Skill[];
  other: Skill[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  inProgress: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  achievements: string[];
  role: string;
}

export interface Language {
  name: string;
  proficiency: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic';
  certification?: string;
}

export interface Volunteer {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Publication {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url?: string;
  doi?: string;
  description: string;
  coAuthors: string[];
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  category: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  bulletPoints: string[];
}

export interface ResumeSections {
  contact: ContactInfo;
  summary: ProfessionalSummary;
  experience: WorkExperience[];
  education: Education[];
  skills: SkillsSection;
  certifications: Certification[];
  projects: Project[];
  languages: Language[];
  volunteer: Volunteer[];
  publications: Publication[];
  awards: Award[];
  customSections: CustomSection[];
}

export interface ResumeMetadata {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  isPublic: boolean;
  tags: string[];
  targetRole?: string;
  targetIndustry?: string;
  completeness: number;
}

export interface ResumeData {
  metadata: ResumeMetadata;
  sections: ResumeSections;
  atsScore: ATSScore | null;
  aiRecommendations: AIRecommendation[];
}

// -------------------------------------------
// ATS SCORING TYPES
// -------------------------------------------

export interface ATSBreakdown {
  keywordOptimization: number;
  formattingScore: number;
  contentQuality: number;
  sectionCompleteness: number;
  actionVerbs: number;
  quantifiableResults: number;
  grammarAndSpelling: number;
  contactInfoQuality: number;
  skillsRelevance: number;
  overallReadability: number;
}

export interface ATSScore {
  overall: number;
  breakdown: ATSBreakdown;
  missingKeywords: string[];
  improvementTips: string[];
  criticalIssues: string[];
  analyzedAt: string;
  jobDescriptionMatch?: number;
}

// -------------------------------------------
// AI TYPES
// -------------------------------------------

export interface AIRecommendation {
  id: string;
  section: string;
  field: string;
  current: string;
  suggested: string;
  reason: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  type: 'improvement' | 'addition' | 'removal' | 'rewrite';
  applied: boolean;
  createdAt: string;
}

export interface AIAnalysis {
  score: ATSScore;
  recommendations: AIRecommendation[];
  enhancedContent: Partial<ResumeSections>;
  keywords: string[];
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

// -------------------------------------------
// TEMPLATE TYPES
// -------------------------------------------

export type TemplateCategory = 'professional' | 'creative' | 'academic' | 'executive' | 'modern';

export interface TemplateConfig {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  previewImage: string;
  colors: TemplateColors;
  fonts: TemplateFonts;
  layout: TemplateLayout;
  sections: TemplateSectionConfig[];
  atsCompatibility: number;
  popularity: number;
  isPremium: boolean;
}

export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  headingText: string;
  borderColor: string;
}

export interface TemplateFonts {
  heading: string;
  body: string;
  accent: string;
  sizes: {
    name: string;
    headings: string;
    body: string;
    small: string;
  };
}

export interface TemplateLayout {
  columns: 1 | 2 | 3;
  headerStyle: 'centered' | 'left' | 'split';
  sectionSpacing: 'compact' | 'normal' | 'spacious';
  photoEnabled: boolean;
  iconStyle: 'minimal' | 'colored' | 'none';
}

export interface TemplateSectionConfig {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  customStyles?: Record<string, string>;
}

// -------------------------------------------
// PAYMENT TYPES
// -------------------------------------------

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency: string;
  duration: 'trial' | 'monthly' | 'yearly';
  features: string[];
  highlighted: boolean;
  badge?: string;
  buttonText: string;
}

export interface PaymentDetails {
  planId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId: string;
  createdAt: string;
  completedAt?: string;
}

export interface Invoice {
  id: string;
  userId: string;
  paymentDetails: PaymentDetails;
  planName: string;
  period: string;
  downloadUrl?: string;
}

// -------------------------------------------
// UI STATE TYPES
// -------------------------------------------

export interface UIState {
  sidebarOpen: boolean;
  modalOpen: string | null;
  theme: 'light' | 'dark';
  language: string;
  notifications: Notification[];
  toasts: Toast[];
  loading: {
    global: boolean;
    ai: boolean;
    upload: boolean;
    export: boolean;
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  action?: {
    label: string;
    url: string;
  };
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  message: string;
  duration?: number;
}

// -------------------------------------------
// API TYPES
// -------------------------------------------

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ResumeExportOptions {
  format: 'pdf' | 'docx' | 'txt';
  template: string;
  includeAIRecommendations: boolean;
  includeATSScore: boolean;
  sections: string[];
}

export interface ResumeImportResult {
  success: boolean;
  parsed: Partial<ResumeSections>;
  errors: string[];
  warnings: string[];
  rawText: string;
}

// -------------------------------------------
// JOB MATCHING TYPES
// -------------------------------------------

export interface JobDescription {
  id?: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  keywords: string[];
  industry: string;
  location: string;
}

export interface JobMatchResult {
  overallScore: number;
  keywordMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  missingKeywords: string[];
  recommendations: AIRecommendation[];
}

// -------------------------------------------
// ANALYTICS TYPES
// -------------------------------------------

export interface AnalyticsEvent {
  id: string;
  userId: string;
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface ResumeAnalytics {
  views: number;
  downloads: number;
  shares: number;
  atsScoreHistory: { date: string; score: number }[];
  improvementRate: number;
}

// -------------------------------------------
// EXPORT & IMPORT TYPES
// -------------------------------------------

export type ExportFormat = 'pdf' | 'docx' | 'txt' | 'json';
export type ImportFormat = 'pdf' | 'docx' | 'txt' | 'linkedin';

export interface ExportConfig {
  format: ExportFormat;
  templateId: string;
  includeAISuggestions: boolean;
  includeATSScore: boolean;
  pageSize: 'A4' | 'Letter';
  margins: 'normal' | 'narrow' | 'wide';
  fontSize: 'small' | 'normal' | 'large';
}

// -------------------------------------------
// FORM TYPES
// -------------------------------------------

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormState<T> {
  values: T;
  errors: FormErrors;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}
