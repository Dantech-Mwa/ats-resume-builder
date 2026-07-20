// ============================================
// UTILITY FUNCTIONS
// ============================================

import { v4 as uuidv4 } from 'uuid';
import { 
  ResumeSections, 
  ATSScore, 
  ContactInfo, 
  WorkExperience, 
  Education,
  Skill,
  FormErrors 
} from './types';

// ============================================
// DATE UTILITIES
// ============================================

export const formatDate = (date: string | Date, format: 'short' | 'long' | 'monthYear' = 'short'): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const fullMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  switch (format) {
    case 'short':
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    case 'long':
      return `${fullMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    case 'monthYear':
      return `${fullMonths[d.getMonth()]} ${d.getFullYear()}`;
    default:
      return d.toLocaleDateString();
  }
};

export const formatDateRange = (startDate: string, endDate: string, current?: boolean): string => {
  const start = formatDate(startDate, 'monthYear');
  const end = current ? 'Present' : formatDate(endDate, 'monthYear');
  return `${start} - ${end}`;
};

export const calculateDuration = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate || new Date());
  
  if (isNaN(start.getTime())) return '';

  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  
  const totalMonths = years * 12 + months;
  
  if (totalMonths < 0) return '';
  if (totalMonths === 0) return 'Less than a month';
  
  const displayYears = Math.floor(totalMonths / 12);
  const displayMonths = totalMonths % 12;
  
  let result = '';
  if (displayYears > 0) {
    result += `${displayYears} year${displayYears > 1 ? 's' : ''}`;
  }
  if (displayMonths > 0) {
    if (result) result += ' ';
    result += `${displayMonths} month${displayMonths > 1 ? 's' : ''}`;
  }
  
  return result;
};

export const isCurrentMonth = (date: string): boolean => {
  const d = new Date(date);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

export const daysUntil = (date: string): number => {
  const target = new Date(date);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ============================================
// STRING UTILITIES
// ============================================

export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const titleCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const truncate = (str: string, length: number, suffix: string = '...'): string => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length).trim() + suffix;
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export const generateInitials = (name: string): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const maskEmail = (email: string): string => {
  if (!email) return '';
  const [username, domain] = email.split('@');
  if (!domain) return email;
  const masked = username.charAt(0) + '***' + username.charAt(username.length - 1);
  return `${masked}@${domain}`;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11) {
    return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

// ============================================
// VALIDATION UTILITIES
// ============================================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true, message: 'Password is strong' };
};

export const validateResumeSection = (
  section: string,
  data: any
): FormErrors => {
  const errors: FormErrors = {};

  switch (section) {
    case 'contact':
      if (!data.fullName?.trim()) errors.fullName = 'Full name is required';
      if (!data.email?.trim()) errors.email = 'Email is required';
      else if (!isValidEmail(data.email)) errors.email = 'Invalid email format';
      if (!data.phone?.trim()) errors.phone = 'Phone number is required';
      if (!data.location?.trim()) errors.location = 'Location is required';
      if (data.linkedIn && !isValidURL(data.linkedIn)) errors.linkedIn = 'Invalid URL';
      if (data.portfolio && !isValidURL(data.portfolio)) errors.portfolio = 'Invalid URL';
      if (data.github && !isValidURL(data.github)) errors.github = 'Invalid URL';
      break;

    case 'experience':
      if (!data.company?.trim()) errors.company = 'Company name is required';
      if (!data.position?.trim()) errors.position = 'Position is required';
      if (!data.startDate) errors.startDate = 'Start date is required';
      if (!data.current && !data.endDate) errors.endDate = 'End date is required';
      if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
        errors.endDate = 'End date must be after start date';
      }
      break;

    case 'education':
      if (!data.institution?.trim()) errors.institution = 'Institution is required';
      if (!data.degree?.trim()) errors.degree = 'Degree is required';
      if (!data.field?.trim()) errors.field = 'Field of study is required';
      if (!data.startDate) errors.startDate = 'Start date is required';
      if (!data.endDate) errors.endDate = 'End date is required';
      break;
  }

  return errors;
};

// ============================================
// ATS SCORING UTILITIES
// ============================================

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

export const getScoreBackground = (score: number): string => {
  if (score >= 80) return 'bg-green-100 border-green-500';
  if (score >= 60) return 'bg-yellow-100 border-yellow-500';
  if (score >= 40) return 'bg-orange-100 border-orange-500';
  return 'bg-red-100 border-red-500';
};

export const getScoreLabel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Needs Improvement';
  return 'Poor';
};

export const getScoreIcon = (score: number): string => {
  if (score >= 90) return '🏆';
  if (score >= 80) return '⭐';
  if (score >= 70) return '👍';
  if (score >= 60) return '📈';
  if (score >= 40) return '⚠️';
  return '❌';
};

export const calculateResumeCompleteness = (sections: ResumeSections): number => {
  let totalWeight = 0;
  let completedWeight = 0;

  const weights = {
    contact: 15,
    summary: 10,
    experience: 30,
    education: 15,
    skills: 15,
    certifications: 5,
    projects: 5,
    languages: 3,
    volunteer: 2,
  };

  // Contact (15%)
  if (sections.contact.fullName && sections.contact.email && sections.contact.phone) {
    completedWeight += weights.contact;
  } else if (sections.contact.fullName || sections.contact.email) {
    completedWeight += weights.contact * 0.5;
  }
  totalWeight += weights.contact;

  // Summary (10%)
  if (sections.summary?.content?.length > 50) {
    completedWeight += weights.summary;
  } else if (sections.summary?.content?.length > 0) {
    completedWeight += weights.summary * 0.5;
  }
  totalWeight += weights.summary;

  // Experience (30%)
  if (sections.experience?.length > 0) {
    const filledExperiences = sections.experience.filter(
      exp => exp.company && exp.position && exp.description
    ).length;
    completedWeight += (filledExperiences / sections.experience.length) * weights.experience;
  }
  totalWeight += weights.experience;

  // Education (15%)
  if (sections.education?.length > 0) {
    const filledEducation = sections.education.filter(
      edu => edu.institution && edu.degree
    ).length;
    completedWeight += (filledEducation / sections.education.length) * weights.education;
  }
  totalWeight += weights.education;

  // Skills (15%)
  const totalSkills = 
    (sections.skills?.technical?.length || 0) +
    (sections.skills?.soft?.length || 0) +
    (sections.skills?.tools?.length || 0);
  if (totalSkills >= 10) {
    completedWeight += weights.skills;
  } else if (totalSkills > 0) {
    completedWeight += (totalSkills / 10) * weights.skills;
  }
  totalWeight += weights.skills;

  // Certifications (5%)
  if (sections.certifications?.length > 0) {
    completedWeight += weights.certifications;
  }
  totalWeight += weights.certifications;

  // Projects (5%)
  if (sections.projects?.length > 0) {
    completedWeight += weights.projects;
  }
  totalWeight += weights.projects;

  return Math.round((completedWeight / totalWeight) * 100);
};

// ============================================
// FILE UTILITIES
// ============================================

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isAllowedFileType = (filename: string): boolean => {
  const allowed = ['pdf', 'docx', 'doc', 'txt'];
  const ext = getFileExtension(filename);
  return allowed.includes(ext);
};

export const generateFilename = (title: string, format: string): string => {
  const slug = slugify(title) || 'resume';
  const timestamp = new Date().toISOString().split('T')[0];
  return `${slug}-${timestamp}.${format}`;
};

// ============================================
// RESUME UTILITIES
// ============================================

export const getDefaultExperience = (): WorkExperience => ({
  id: uuidv4(),
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  current: false,
  location: '',
  description: '',
  achievements: [''],
  technologies: [],
  aiSuggestions: [],
});

export const getDefaultEducation = (): Education => ({
  id: uuidv4(),
  institution: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  honors: [],
  activities: [],
  relevantCourses: [],
});

export const getDefaultSkill = (category: string = 'Technical'): Skill => ({
  name: '',
  level: 'Intermediate',
  category,
});

export const countWords = (text: string): number => {
  if (!text?.trim()) return 0;
  return text.trim().split(/\s+/).length;
};

export const countAchievements = (experiences: WorkExperience[]): number => {
  return experiences.reduce((count, exp) => {
    return count + (exp.achievements?.filter(a => a.trim()).length || 0);
  }, 0);
};

export const getTopSkills = (skills: Skill[], count: number = 5): Skill[] => {
  const levelOrder = { Expert: 4, Advanced: 3, Intermediate: 2, Beginner: 1 };
  return [...skills]
    .sort((a, b) => (levelOrder[b.level] || 0) - (levelOrder[a.level] || 0))
    .slice(0, count);
};

// ============================================
// TEMPLATE UTILITIES
// ============================================

export const getTemplateStyle = (templateId: string): Record<string, string> => {
  const styles: Record<string, Record<string, string>> = {
    modern: {
      fontFamily: "'Inter', sans-serif",
      primaryColor: '#2563EB',
      secondaryColor: '#1E40AF',
      headingSize: '14px',
      bodySize: '11px',
    },
    executive: {
      fontFamily: "'Georgia', serif",
      primaryColor: '#1F2937',
      secondaryColor: '#374151',
      headingSize: '13px',
      bodySize: '10.5px',
    },
    creative: {
      fontFamily: "'Poppins', sans-serif",
      primaryColor: '#7C3AED',
      secondaryColor: '#6D28D9',
      headingSize: '15px',
      bodySize: '10px',
    },
    minimal: {
      fontFamily: "'Helvetica', sans-serif",
      primaryColor: '#059669',
      secondaryColor: '#047857',
      headingSize: '12px',
      bodySize: '10px',
    },
    corporate: {
      fontFamily: "'Arial', sans-serif",
      primaryColor: '#0F766E',
      secondaryColor: '#115E59',
      headingSize: '13px',
      bodySize: '10.5px',
    },
  };

  return styles[templateId] || styles.modern;
};

// ============================================
// COLOR UTILITIES
// ============================================

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const getContrastColor = (hexColor: string): string => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';
  
  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// ============================================
// EXPORT UTILITIES
// ============================================

export const prepareResumeForExport = (sections: ResumeSections, templateId: string): string => {
  const style = getTemplateStyle(templateId);
  
  let html = `
    <div style="font-family: ${style.fontFamily}; max-width: 800px; margin: 0 auto; padding: 40px; color: #333;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 24px; margin: 0; color: ${style.primaryColor};">${sections.contact.fullName}</h1>
        <p style="font-size: 12px; color: #666; margin: 5px 0;">
          ${sections.contact.email} | ${sections.contact.phone} | ${sections.contact.location}
          ${sections.contact.linkedIn ? ` | ${sections.contact.linkedIn}` : ''}
        </p>
      </div>
      <hr style="border: 1px solid ${style.secondaryColor};" />
  `;

  if (sections.summary?.content) {
    html += `
      <h2 style="font-size: ${style.headingSize}; color: ${style.primaryColor}; margin-top: 20px;">PROFESSIONAL SUMMARY</h2>
      <p style="font-size: ${style.bodySize}; line-height: 1.6;">${sections.summary.content}</p>
    `;
  }

  if (sections.experience?.length) {
    html += `<h2 style="font-size: ${style.headingSize}; color: ${style.primaryColor}; margin-top: 20px;">PROFESSIONAL EXPERIENCE</h2>`;
    sections.experience.forEach(exp => {
      html += `
        <div style="margin-bottom: 15px;">
          <strong style="font-size: ${style.bodySize};">${exp.position}</strong> | ${exp.company}<br />
          <em style="color: #666; font-size: ${style.bodySize};">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</em>
          ${exp.description ? `<p style="font-size: ${style.bodySize};">${exp.description}</p>` : ''}
          ${exp.achievements?.map(ach => `<li style="font-size: ${style.bodySize};">${ach}</li>`).join('') || ''}
        </div>
      `;
    });
  }

  if (sections.education?.length) {
    html += `<h2 style="font-size: ${style.headingSize}; color: ${style.primaryColor}; margin-top: 20px;">EDUCATION</h2>`;
    sections.education.forEach(edu => {
      html += `
        <div style="margin-bottom: 10px;">
          <strong style="font-size: ${style.bodySize};">${edu.degree} in ${edu.field}</strong><br />
          <span style="font-size: ${style.bodySize};">${edu.institution}</span><br />
          <em style="color: #666; font-size: ${style.bodySize};">${edu.startDate} - ${edu.endDate}</em>
          ${edu.gpa ? `<span style="font-size: ${style.bodySize};"> | GPA: ${edu.gpa}</span>` : ''}
        </div>
      `;
    });
  }

  const allSkills = [
    ...(sections.skills?.technical || []).map(s => s.name),
    ...(sections.skills?.soft || []).map(s => s.name),
    ...(sections.skills?.tools || []).map(s => s.name),
  ];

  if (allSkills.length) {
    html += `
      <h2 style="font-size: ${style.headingSize}; color: ${style.primaryColor}; margin-top: 20px;">SKILLS</h2>
      <p style="font-size: ${style.bodySize};">${allSkills.join(' • ')}</p>
    `;
  }

  html += `</div>`;
  return html;
};

// ============================================
// DEBOUNCE & THROTTLE
// ============================================

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ============================================
// CLIPBOARD UTILITIES
// ============================================

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
};

// ============================================
// LOCAL STORAGE UTILITIES
// ============================================

export const storage = {
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue || null;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
};

// ============================================
// ARRAY UTILITIES
// ============================================

export const moveItem = <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
  const newArray = [...array];
  const [movedItem] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, movedItem);
  return newArray;
};

export const removeDuplicates = <T>(array: T[], key?: keyof T): T[] => {
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }
  return [...new Set(array)];
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// ============================================
// RANDOM GENERATORS
// ============================================

export const generateId = (): string => {
  return uuidv4();
};

export const generateColor = (): string => {
  const colors = [
    '#2563EB', '#7C3AED', '#059669', '#DC2626', '#D97706',
    '#0891B2', '#4F46E5', '#BE185D', '#65A30D', '#C026D3',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// ============================================
// FORMAT HELPERS
// ============================================

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

// ============================================
// ERROR HANDLING
// ============================================

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: any): boolean => {
  return (
    error?.message?.includes('network') ||
    error?.message?.includes('fetch') ||
    error?.code === 'ECONNREFUSED' ||
    !navigator.onLine
  );
};

// ============================================
// EXPORT ALL UTILITIES
// ============================================

const utils = {
  formatDate,
  formatDateRange,
  calculateDuration,
  isCurrentMonth,
  daysUntil,
  capitalize,
  titleCase,
  truncate,
  slugify,
  stripHtml,
  generateInitials,
  maskEmail,
  formatPhoneNumber,
  isValidEmail,
  isValidPhone,
  isValidURL,
  validatePassword,
  validateResumeSection,
  getScoreColor,
  getScoreBackground,
  getScoreLabel,
  getScoreIcon,
  calculateResumeCompleteness,
  formatFileSize,
  getFileExtension,
  isAllowedFileType,
  generateFilename,
  getDefaultExperience,
  getDefaultEducation,
  getDefaultSkill,
  countWords,
  countAchievements,
  getTopSkills,
  getTemplateStyle,
  hexToRgb,
  getContrastColor,
  prepareResumeForExport,
  debounce,
  throttle,
  copyToClipboard,
  storage,
  moveItem,
  removeDuplicates,
  chunk,
  generateId,
  generateColor,
  formatCurrency,
  formatNumber,
  formatPercentage,
  getErrorMessage,
  isNetworkError,
};

export default utils;