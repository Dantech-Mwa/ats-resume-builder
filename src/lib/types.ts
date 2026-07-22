// ============================================
// ATS RESUME BUILDER - COMPLETE TYPE SYSTEM
// ENHANCED VERSION WITH ML & ADVANCED FEATURES
// ============================================

// -------------------------------------------
// USER & AUTHENTICATION TYPES
// -------------------------------------------

export type SubscriptionPlan = 'trial' | 'monthly' | 'yearly' | 'none';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending' | 'grace_period';
export type PaymentMethod = 'paypal' | 'stripe' | 'none' | 'crypto';

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
  trialUsed: boolean;
  features: string[];
  usageStats: SubscriptionUsage;
}

export interface SubscriptionUsage {
  resumesGenerated: number;
  resumesLimit: number;
  aiAnalysesUsed: number;
  aiAnalysesLimit: number;
  exportsUsed: number;
  exportsLimit: number;
  lastReset: string;
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
  settings: UserSettings;
  analytics: UserAnalytics;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  defaultTemplate: string;
  emailNotifications: boolean;
  showAIAssistant: boolean;
  autoSave: boolean;
  compactMode: boolean;
  accessibility: AccessibilityPreferences;
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  screenReaderOptimized: boolean;
}

export interface UserSettings {
  defaultExportFormat: 'pdf' | 'docx' | 'txt';
  atsScoringEnabled: boolean;
  aiSuggestionsEnabled: boolean;
  autoAnalyzeOnImport: boolean;
  shareAnalytics: boolean;
  betaFeatures: boolean;
}

export interface UserAnalytics {
  totalResumesCreated: number;
  totalExports: number;
  averageATSScore: number;
  mostUsedTemplate: string;
  lastActive: string;
  featureUsage: Record<string, number>;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  sessionExpiry: string | null;
  requiresTwoFactor: boolean;
  provider: 'email' | 'google' | 'github' | 'linkedin';
}

// -------------------------------------------
// RESUME TYPES - ENHANCED
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
  website?: string;
  dateOfBirth?: string;
  nationality?: string;
  pronouns?: string;
  workAuthorization?: 'US Citizen' | 'Green Card' | 'Work Visa' | 'No Sponsorship Needed' | 'Needs Sponsorship';
  preferredContactMethod?: 'email' | 'phone' | 'linkedin';
  timezone?: string;
}

export interface ProfessionalSummary {
  content: string;
  aiOptimized: boolean;
  lastModified: string;
  versions: SummaryVersion[];
  keywordDensity: Record<string, number>;
  characterCount: number;
  wordCount: number;
}

export interface SummaryVersion {
  id: string;
  content: string;
  timestamp: string;
  source: 'user' | 'ai' | 'template';
  atsScore: number | null;
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
  industry?: string;
  companyType?: 'Startup' | 'SME' | 'Large Enterprise' | 'Non-Profit' | 'Government' | 'Education';
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship' | 'Volunteer';
  durationYears: number;
  skillsGained: string[];
  promotions: PromotionHistory[];
  projects: ExperienceProject[];
}

export interface PromotionHistory {
  date: string;
  fromPosition: string;
  toPosition: string;
  reason: string;
}

export interface ExperienceProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  achievements: string[];
  link?: string;
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
  location: string;
  degreeType: 'Associate' | 'Bachelor' | 'Master' | 'PhD' | 'Certificate' | 'Diploma' | 'High School' | 'Other';
  cgpa?: number;
  achievements: string[];
  researchTopics: string[];
  thesisTitle?: string;
  advisor?: string;
}

export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';
  category: string;
  yearsOfExperience?: number;
  lastUsed?: string;
  endorsements?: number;
  projectsUsedIn?: string[];
  selfRated: 1 | 2 | 3 | 4 | 5;
}

export interface SkillsSection {
  technical: Skill[];
  soft: Skill[];
  languages: Skill[];
  tools: Skill[];
  other: Skill[];
  frameworks: Skill[];
  databases: Skill[];
  cloudPlatforms: Skill[];
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
  skillsValidated: string[];
  annualRenewal: boolean;
  isActive: boolean;
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
  teamSize?: number;
  problemSolved: string;
  impactMetrics: ImpactMetric[];
  featured: boolean;
}

export interface ImpactMetric {
  name: string;
  value: string;
  description: string;
  unit: string;
  comparison?: string;
}

export interface Language {
  name: string;
  proficiency: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic';
  certification?: string;
  readingLevel: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic';
  writingLevel: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic';
  speakingLevel: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic';
  listeningLevel: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic';
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
  cause: string[];
  hoursPerWeek: number;
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
  journalName: string;
  volume: string;
  pages: string;
  citations: number;
  impactFactor: number;
  peerReviewed: boolean;
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  category: string;
  monetaryValue?: number;
  level: 'Local' | 'Regional' | 'National' | 'International' | 'Global';
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
  link?: string;
  tags: string[];
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
  // New sections
  professionalAffiliations: ProfessionalAffiliation[];
  conferences: Conference[];
  patents: Patent[];
  references: Reference[];
}

export interface ProfessionalAffiliation {
  id: string;
  name: string;
  role: string;
  membershipType: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface Conference {
  id: string;
  name: string;
  location: string;
  date: string;
  role: 'Attendee' | 'Speaker' | 'Organizer' | 'Panelist';
  topic: string;
  link?: string;
}

export interface Patent {
  id: string;
  title: string;
  number: string;
  date: string;
  status: 'Filed' | 'Pending' | 'Granted';
  description: string;
  inventors: string[];
  assignee: string;
  link?: string;
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
  relationship: 'Manager' | 'Peer' | 'Subordinate' | 'Client' | 'Academic';
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
  atsScore: number | null;
  aiOptimized: boolean;
  lastAnalyzedAt: string | null;
  versionHistory: ResumeVersion[];
  keywords: string[];
  readabilityScore: number;
  actionVerbCount: number;
}

export interface ResumeVersion {
  id: string;
  timestamp: string;
  version: number;
  changes: string[];
  atsScore: number | null;
  createdBy: 'user' | 'ai' | 'template' | 'import';
}

export interface ResumeData {
  metadata: ResumeMetadata;
  sections: ResumeSections;
  atsScore: ATSScore | null;
  aiRecommendations: AIRecommendation[];
  jobMatches: JobMatchResult[];
  analytics: ResumeAnalytics;
}

// -------------------------------------------
// ATS SCORING TYPES - ENHANCED
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
  industrySpecificKeywords: number;
  roleSpecificKeywords: number;
  seniorityMatch: number;
  experienceRelevance: number;
  educationRelevance: number;
  certificationRelevance: number;
  languageProficiency: number;
  tenseConsistency: number;
  metricsDensity: number;
  achievementsQuality: number;
  personalizationScore: number;
}

export interface ATSScore {
  overall: number;
  breakdown: ATSBreakdown;
  missingKeywords: string[];
  improvementTips: string[];
  criticalIssues: string[];
  analyzedAt: string;
  jobDescriptionMatch?: number;
  employerPreferenceMatch?: number;
  industryMatch?: number;
  roleMatch?: number;
  keywordDensity: Record<string, number>;
  suggestedKeywords: string[];
  atsParsingReadability: number;
  fontCompatibility: number;
}

// -------------------------------------------
// ML & AI TYPES - ENHANCED
// -------------------------------------------

export interface AIRecommendation {
  id: string;
  section: string;
  field: string;
  current: string;
  suggested: string;
  reason: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low' | 'Optional';
  type: 'improvement' | 'addition' | 'removal' | 'rewrite' | 'optimization';
  applied: boolean;
  createdAt: string;
  category: string;
  impactScore: number;
  implementationEffort: 'Easy' | 'Medium' | 'Hard';
}

export interface AIAnalysis {
  score: ATSScore;
  recommendations: AIRecommendation[];
  enhancedContent: Partial<ResumeSections>;
  keywords: string[];
  suggestedKeywords: string[];
  semanticKeywords: string[];
  competitorInsights: CompetitorInsight[];
}

export interface CompetitorInsight {
  industry: string;
  role: string;
  commonKeywords: string[];
  missingKeywords: string[];
  averageATSScore: number;
  topPerformerKeywords: string[];
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  suggestions?: string[];
  context?: Record<string, any>;
  actions?: AIAction[];
}

export interface AIAction {
  type: 'apply' | 'modify' | 'explain' | 'expand' | 'condense';
  label: string;
  handler: string;
  data: Record<string, any>;
}

export interface MLLearningData {
  trainingExamples: TrainingExample[];
  modelVersion: string;
  lastTraining: string;
  accuracy: number;
  featureImportance: Record<string, number>;
}

export interface TrainingExample {
  id: string;
  rawText: string;
  sections: Partial<ResumeSections>;
  templateType: string;
  confidence: number;
  corrections: Partial<ResumeSections>;
  timestamp: string;
  source: 'user' | 'auto' | 'import' | 'synthetic';
  validationStatus: 'pending' | 'valid' | 'invalid' | 'needs_review';
}

// -------------------------------------------
// TEMPLATE TYPES - ENHANCED
// -------------------------------------------

export type TemplateCategory = 'professional' | 'creative' | 'academic' | 'executive' | 'modern' | 'simple' | 'technical' | 'executive';
export type TemplateStyle = 'minimal' | 'elegant' | 'bold' | 'classic' | 'contemporary' | 'structured';

export interface TemplateConfig {
  id: string;
  name: string;
  category: TemplateCategory;
  style: TemplateStyle;
  description: string;
  previewImage: string;
  colors: TemplateColors;
  fonts: TemplateFonts;
  layout: TemplateLayout;
  sections: TemplateSectionConfig[];
  atsCompatibility: number;
  popularity: number;
  isPremium: boolean;
  isDefault: boolean;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  features: TemplateFeature[];
}

export interface TemplateFeature {
  icon: string;
  label: string;
  description: string;
}

export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  headingText: string;
  borderColor: string;
  linkColor: string;
  bulletColor: string;
  dividerColor: string;
  highlightColor: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
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
    xSmall: string;
    large: string;
  };
  lineHeight: {
    body: number;
    heading: number;
  };
  letterSpacing: {
    heading: string;
    body: string;
  };
}

export interface TemplateLayout {
  columns: 1 | 2 | 3;
  headerStyle: 'centered' | 'left' | 'split' | 'right' | 'minimal';
  sectionSpacing: 'compact' | 'normal' | 'spacious' | 'relaxed';
  photoEnabled: boolean;
  photoPosition: 'left' | 'right' | 'top' | 'top-left' | 'top-right' | 'none';
  iconStyle: 'minimal' | 'colored' | 'none' | 'modern';
  borderStyle: 'none' | 'thin' | 'thick' | 'double' | 'dashed';
  backgroundStyle: 'solid' | 'gradient' | 'pattern' | 'none';
  sectionStyle: 'card' | 'line' | 'border' | 'none';
}

export interface TemplateSectionConfig {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  customStyles?: Record<string, string>;
  maxItems?: number;
  minItems?: number;
  required: boolean;
  icon?: string;
  alignment: 'left' | 'center' | 'right';
  color?: string;
}

// -------------------------------------------
// PAYMENT TYPES - ENHANCED
// -------------------------------------------

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency: string;
  duration: 'trial' | 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  highlighted: boolean;
  badge?: string;
  buttonText: string;
  discountPercentage: number;
  paymentGateways: PaymentMethod[];
  includesTrial: boolean;
  trialDays: number;
  teamSize: number;
  teamPrice: number;
}

export interface PaymentDetails {
  planId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'chargeback' | 'voided';
  transactionId: string;
  createdAt: string;
  completedAt?: string;
  receiptUrl?: string;
  billingAddress?: BillingAddress;
  paymentIntentId?: string;
  subscriptionId?: string;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Invoice {
  id: string;
  userId: string;
  paymentDetails: PaymentDetails;
  planName: string;
  period: string;
  downloadUrl?: string;
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// -------------------------------------------
// UI STATE TYPES - ENHANCED
// -------------------------------------------

export interface UIState {
  sidebarOpen: boolean;
  modalOpen: string | null;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: Notification[];
  toasts: Toast[];
  loading: {
    global: boolean;
    ai: boolean;
    upload: boolean;
    export: boolean;
    save: boolean;
    delete: boolean;
    analyze: boolean;
  };
  activeTab: string;
  selectedSection: string;
  displayMode: 'edit' | 'preview' | 'split';
  zoomLevel: number;
  viewportWidth: number;
  viewportHeight: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  action?: {
    label: string;
    url: string;
  };
  dismissible: boolean;
  duration: number;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  message: string;
  duration?: number;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// -------------------------------------------
// API TYPES - ENHANCED
// -------------------------------------------

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  statusCode: number;
  requestId: string;
  metadata?: Record<string, any>;
  links?: {
    self: string;
    next?: string;
    prev?: string;
    first?: string;
    last?: string;
  };
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  sort: string;
  order: 'asc' | 'desc';
  pageCount: number;
}

export interface ResumeExportOptions {
  format: 'pdf' | 'docx' | 'txt' | 'html' | 'json';
  template: string;
  includeAIRecommendations: boolean;
  includeATSScore: boolean;
  sections: string[];
  pageSize: 'A4' | 'Letter';
  margins: 'normal' | 'narrow' | 'wide';
  orientation: 'portrait' | 'landscape';
  fileName: string;
  includeMetadata: boolean;
  minify: boolean;
  prettyPrint: boolean;
}

export interface ResumeImportResult {
  success: boolean;
  parsed: Partial<ResumeSections>;
  errors: string[];
  warnings: string[];
  rawText: string;
  confidence: number;
  suggestions: ParsingSuggestion[];
  templateType: string;
  requiresReview: boolean;
}

export interface ParsingSuggestion {
  field: string;
  value: any;
  confidence: number;
  alternativeValues?: any[];
  reason: string;
  action: 'review' | 'auto-correct' | 'ignore';
}

// -------------------------------------------
// JOB MATCHING TYPES - ENHANCED
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
  postedDate: string;
  employmentType: string;
  salary: string;
  benefits: string[];
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  yearsExperience: number;
  educationLevel: string;
  certifications: string[];
}

export interface JobMatchResult {
  overallScore: number;
  keywordMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  missingKeywords: string[];
  recommendations: AIRecommendation[];
  matchingKeywords: string[];
  partialMatches: string[];
  skillGap: SkillGap[];
}

export interface SkillGap {
  skill: string;
  importance: 'Critical' | 'High' | 'Medium' | 'Low';
  type: 'hard' | 'soft';
  suggestion: string;
  learningResource?: string;
}

// -------------------------------------------
// ANALYTICS TYPES - ENHANCED
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
  sessionId: string;
  platform: string;
  browser: string;
  os: string;
  device: string;
  ip: string;
  geolocation?: {
    country: string;
    region: string;
    city: string;
  };
}

export interface ResumeAnalytics {
  views: number;
  downloads: number;
  shares: number;
  atsScoreHistory: { date: string; score: number; category: string }[];
  improvementRate: number;
  engagementTime: number;
  sectionsViewed: Record<string, number>;
  aiUsage: {
    recommendationsAccepted: number;
    recommendationsRejected: number;
    chatMessages: number;
    analyses: number;
  };
  exports: {
    pdf: number;
    docx: number;
    txt: number;
  };
  userJourney: UserJourneyEvent[];
}

export interface UserJourneyEvent {
  timestamp: string;
  event: string;
  duration: number;
  path: string;
  metadata: Record<string, any>;
}

// -------------------------------------------
// EXPORT & IMPORT TYPES
// -------------------------------------------

export type ExportFormat = 'pdf' | 'docx' | 'txt' | 'json' | 'html' | 'xml' | 'csv';
export type ImportFormat = 'pdf' | 'docx' | 'txt' | 'linkedin' | 'json' | 'xml' | 'html';

export interface ExportConfig {
  format: ExportFormat;
  templateId: string;
  includeAISuggestions: boolean;
  includeATSScore: boolean;
  pageSize: 'A4' | 'Letter' | 'Legal';
  margins: 'normal' | 'narrow' | 'wide' | 'custom';
  customMargins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fontSize: 'small' | 'normal' | 'large' | 'custom';
  customFontSize?: number;
  orientation: 'portrait' | 'landscape';
  compression: 'none' | 'low' | 'medium' | 'high';
  optimizeForATS: boolean;
  includeCoverLetter: boolean;
  includeReferences: boolean;
  watermark?: string;
  password?: string;
}

// -------------------------------------------
// FORM TYPES - ENHANCED
// -------------------------------------------

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
  twoFactorCode?: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptMarketing: boolean;
  referralCode?: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface FormErrors {
  [key: string]: string | string[];
}

export interface FormState<T> {
  values: T;
  errors: FormErrors;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isValidating: boolean;
  submitCount: number;
}

// -------------------------------------------
// UNDO/REDO TYPES
// -------------------------------------------

export interface UndoRedoState<T> {
  history: T[];
  currentIndex: number;
  maxHistory: number;
}

export interface Action {
  type: string;
  payload: any;
  timestamp: string;
}

export interface ActionHistory {
  past: Action[];
  present: Action;
  future: Action[];
}

// -------------------------------------------
// ERROR HANDLING TYPES
// -------------------------------------------

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  stack?: string;
  handled: boolean;
  component?: string;
  userAction?: string;
}

// -------------------------------------------
// VALIDATION TYPES
// -------------------------------------------

export interface ValidationRule {
  id: string;
  field: string;
  validator: (value: any) => boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  value: any;
  suggestion: string;
}

// -------------------------------------------
// CACHE TYPES
// -------------------------------------------

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: number;
  etag?: string;
}

export interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'lfu' | 'fifo';
}

// -------------------------------------------
// PERFORMANCE TYPES
// -------------------------------------------

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'kb' | 'bytes' | 'count' | 'percent';
  timestamp: string;
  tags: Record<string, string>;
}

export interface PerformanceReport {
  id: string;
  metrics: PerformanceMetric[];
  timestamp: string;
  environment: {
    browser: string;
    os: string;
    device: string;
    connection: string;
  };
  thresholds: Record<string, number>;
}

// ============================================
// EXPORT ALL TYPES
// ============================================

export * from './auth';
export * from './resume';
export * from './ats';
export * from './ai';
export * from './templates';
export * from './payment';
export * from './ui';
export * from './api';
export * from './job';
export * from './analytics';
export * from './export';
export * from './form';
export * from './undo-redo';
export * from './errors';
export * from './validation';
export * from './cache';
export * from './performance';
