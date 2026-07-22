// src/lib/templateEngine.ts
// ============================================
// TEMPLATE ENGINE - Complete Template System
// Your Resume is the Default Template
// ============================================

import { TemplateConfig, TemplateColors, TemplateFonts, TemplateLayout, TemplateCategory } from './types';

class TemplateEngine {
  private static instance: TemplateEngine;
  private templates: Map<string, TemplateConfig> = new Map();

  private constructor() {
    this.initializeTemplates();
  }

  static getInstance(): TemplateEngine {
    if (!TemplateEngine.instance) {
      TemplateEngine.instance = new TemplateEngine();
    }
    return TemplateEngine.instance;
  }

  private initializeTemplates(): void {
    const templates: TemplateConfig[] = [
      // ============================================
      // 1. MWANZA PROFESSIONAL - YOUR RESUME AS DEFAULT
      // ============================================
      {
        id: 'mwanza_professional',
        name: 'Mwanza Professional',
        category: 'professional',
        style: 'modern',
        description: 'Professional template designed for Data Scientists and MERL Specialists. Clean, modern layout with highlighted contact information and core competencies.',
        previewImage: '/templates/mwanza_professional.png',
        colors: {
          primary: '#1a365d',      // Dark navy blue
          secondary: '#2d3748',     // Dark gray-blue
          accent: '#2b6cb0',        // Bright blue
          text: '#1a202c',          // Almost black
          background: '#ffffff',    // White
          headingText: '#1a365d',   // Dark navy
          borderColor: '#e2e8f0',   // Light gray
          linkColor: '#2b6cb0',     // Bright blue
          bulletColor: '#2b6cb0',   // Bright blue
          dividerColor: '#e2e8f0',  // Light gray
          highlightColor: '#ebf4ff', // Light blue highlight
          successColor: '#38a169',   // Green
          errorColor: '#e53e3e',    // Red
          warningColor: '#dd6b20',  // Orange
        },
        fonts: {
          heading: 'Inter, -apple-system, sans-serif',
          body: 'Inter, -apple-system, sans-serif',
          accent: 'Inter, -apple-system, sans-serif',
          sizes: {
            name: '28px',
            headings: '14px',
            body: '11px',
            small: '9px',
            xSmall: '8px',
            large: '16px',
          },
          lineHeight: {
            body: 1.5,
            heading: 1.2,
          },
          letterSpacing: {
            heading: '0.3px',
            body: '0.2px',
          },
        },
        layout: {
          columns: 2,
          headerStyle: 'left',
          sectionSpacing: 'normal',
          photoEnabled: false,
          photoPosition: 'none',
          iconStyle: 'minimal',
          borderStyle: 'thin',
          backgroundStyle: 'solid',
          sectionStyle: 'line',
        },
        sections: [
          { 
            id: 'contact', 
            title: 'Contact Information', 
            enabled: true, 
            order: 0, 
            required: true, 
            alignment: 'left',
            icon: '📧',
          },
          { 
            id: 'summary', 
            title: 'Professional Summary', 
            enabled: true, 
            order: 1, 
            required: true, 
            alignment: 'left',
            icon: '📄',
          },
          { 
            id: 'skills', 
            title: 'Core Competencies', 
            enabled: true, 
            order: 2, 
            required: false, 
            alignment: 'left',
            icon: '💡',
            maxItems: 15,
          },
          { 
            id: 'experience', 
            title: 'Professional Experience', 
            enabled: true, 
            order: 3, 
            required: true, 
            alignment: 'left',
            icon: '💼',
          },
          { 
            id: 'projects', 
            title: 'Key Projects', 
            enabled: true, 
            order: 4, 
            required: false, 
            alignment: 'left',
            icon: '🚀',
          },
          { 
            id: 'education', 
            title: 'Education & Credentials', 
            enabled: true, 
            order: 5, 
            required: true, 
            alignment: 'left',
            icon: '🎓',
          },
          { 
            id: 'skills', 
            title: 'Technical Profile & Tools', 
            enabled: true, 
            order: 6, 
            required: false, 
            alignment: 'left',
            icon: '🛠️',
          },
          { 
            id: 'certifications', 
            title: 'Certifications', 
            enabled: true, 
            order: 7, 
            required: false, 
            alignment: 'left',
            icon: '📜',
          },
          { 
            id: 'languages', 
            title: 'Languages', 
            enabled: true, 
            order: 8, 
            required: false, 
            alignment: 'left',
            icon: '🌐',
          },
        ],
        atsCompatibility: 98,
        popularity: 100,
        isPremium: false,
        isDefault: true,
        tags: ['professional', 'data science', 'merl', 'mwanza'],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        features: [
          { icon: '🎯', label: 'ATS Optimized', description: 'Designed for maximum ATS compatibility' },
          { icon: '📊', label: 'Data Science Focus', description: 'Optimized for Data Science and MERL roles' },
          { icon: '✨', label: 'Clean Design', description: 'Professional, clean layout' },
        ],
      },

      // ============================================
      // 2. MODERN PROFESSIONAL
      // ============================================
      {
        id: 'modern',
        name: 'Modern Professional',
        category: 'modern',
        style: 'contemporary',
        description: 'Clean, contemporary design with a professional touch. Perfect for tech and modern industries.',
        previewImage: '/templates/modern.png',
        colors: {
          primary: '#2563EB',
          secondary: '#1E40AF',
          accent: '#3B82F6',
          text: '#1F2937',
          background: '#FFFFFF',
          headingText: '#111827',
          borderColor: '#E5E7EB',
          linkColor: '#2563EB',
          bulletColor: '#2563EB',
          dividerColor: '#E5E7EB',
          highlightColor: '#EFF6FF',
          successColor: '#10B981',
          errorColor: '#EF4444',
          warningColor: '#F59E0B',
        },
        fonts: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif',
          accent: 'Inter, sans-serif',
          sizes: {
            name: '28px',
            headings: '14px',
            body: '11px',
            small: '9px',
            xSmall: '8px',
            large: '16px',
          },
          lineHeight: {
            body: 1.5,
            heading: 1.2,
          },
          letterSpacing: {
            heading: '0.5px',
            body: '0.2px',
          },
        },
        layout: {
          columns: 2,
          headerStyle: 'left',
          sectionSpacing: 'normal',
          photoEnabled: true,
          photoPosition: 'top-left',
          iconStyle: 'colored',
          borderStyle: 'thin',
          backgroundStyle: 'solid',
          sectionStyle: 'card',
        },
        sections: [
          { id: 'contact', title: 'Contact Information', enabled: true, order: 0, required: true, alignment: 'left' },
          { id: 'summary', title: 'Professional Summary', enabled: true, order: 1, required: false, alignment: 'left' },
          { id: 'experience', title: 'Work Experience', enabled: true, order: 2, required: true, alignment: 'left' },
          { id: 'education', title: 'Education', enabled: true, order: 3, required: true, alignment: 'left' },
          { id: 'skills', title: 'Skills', enabled: true, order: 4, required: false, alignment: 'left' },
          { id: 'certifications', title: 'Certifications', enabled: false, order: 5, required: false, alignment: 'left' },
          { id: 'projects', title: 'Projects', enabled: false, order: 6, required: false, alignment: 'left' },
          { id: 'languages', title: 'Languages', enabled: false, order: 7, required: false, alignment: 'left' },
        ],
        atsCompatibility: 95,
        popularity: 98,
        isPremium: false,
        isDefault: false,
        tags: ['professional', 'modern', 'tech'],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        features: [
          { icon: '🎯', label: 'ATS Optimized', description: 'Designed for ATS compatibility' },
          { icon: '🎨', label: 'Custom Colors', description: 'Accent color customization' },
          { icon: '📱', label: 'Responsive', description: 'Works on all devices' },
        ],
      },

      // ============================================
      // 3. EXECUTIVE CLASSIC
      // ============================================
      {
        id: 'executive',
        name: 'Executive Classic',
        category: 'executive',
        style: 'classic',
        description: 'Traditional, authoritative layout for senior executives and conservative industries.',
        previewImage: '/templates/executive.png',
        colors: {
          primary: '#1F2937',
          secondary: '#374151',
          accent: '#6B7280',
          text: '#111827',
          background: '#FFFFFF',
          headingText: '#000000',
          borderColor: '#D1D5DB',
          linkColor: '#1F2937',
          bulletColor: '#374151',
          dividerColor: '#D1D5DB',
          highlightColor: '#F9FAFB',
          successColor: '#10B981',
          errorColor: '#EF4444',
          warningColor: '#F59E0B',
        },
        fonts: {
          heading: 'Georgia, serif',
          body: 'Georgia, serif',
          accent: 'Arial, sans-serif',
          sizes: {
            name: '24px',
            headings: '13px',
            body: '10.5px',
            small: '9px',
            xSmall: '8px',
            large: '15px',
          },
          lineHeight: {
            body: 1.4,
            heading: 1.3,
          },
          letterSpacing: {
            heading: '0.3px',
            body: '0.1px',
          },
        },
        layout: {
          columns: 1,
          headerStyle: 'centered',
          sectionSpacing: 'compact',
          photoEnabled: false,
          photoPosition: 'none',
          iconStyle: 'minimal',
          borderStyle: 'thick',
          backgroundStyle: 'solid',
          sectionStyle: 'line',
        },
        sections: [
          { id: 'contact', title: 'Contact', enabled: true, order: 0, required: true, alignment: 'center' },
          { id: 'summary', title: 'Executive Summary', enabled: true, order: 1, required: true, alignment: 'left' },
          { id: 'experience', title: 'Professional Experience', enabled: true, order: 2, required: true, alignment: 'left' },
          { id: 'education', title: 'Education', enabled: true, order: 3, required: true, alignment: 'left' },
          { id: 'skills', title: 'Core Competencies', enabled: true, order: 4, required: false, alignment: 'left' },
          { id: 'certifications', title: 'Certifications & Licenses', enabled: true, order: 5, required: false, alignment: 'left' },
          { id: 'awards', title: 'Awards & Recognition', enabled: false, order: 6, required: false, alignment: 'left' },
          { id: 'publications', title: 'Publications', enabled: false, order: 7, required: false, alignment: 'left' },
        ],
        atsCompatibility: 98,
        popularity: 85,
        isPremium: false,
        isDefault: false,
        tags: ['executive', 'classic', 'traditional'],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        features: [
          { icon: '🏛️', label: 'Executive Style', description: 'Traditional executive layout' },
          { icon: '📄', label: 'Page Friendly', description: 'Optimized for printing' },
        ],
      },

      // ============================================
      // 4. CREATIVE TECH
      // ============================================
      {
        id: 'creative',
        name: 'Creative Tech',
        category: 'creative',
        style: 'bold',
        description: 'Bold, modern design for developers, designers, and creative professionals.',
        previewImage: '/templates/creative.png',
        colors: {
          primary: '#7C3AED',
          secondary: '#6D28D9',
          accent: '#8B5CF6',
          text: '#374151',
          background: '#FAFAFA',
          headingText: '#1F2937',
          borderColor: '#E5E7EB',
          linkColor: '#7C3AED',
          bulletColor: '#7C3AED',
          dividerColor: '#E5E7EB',
          highlightColor: '#EDE9FE',
          successColor: '#10B981',
          errorColor: '#EF4444',
          warningColor: '#F59E0B',
        },
        fonts: {
          heading: 'Poppins, sans-serif',
          body: 'Inter, sans-serif',
          accent: 'Poppins, sans-serif',
          sizes: {
            name: '28px',
            headings: '15px',
            body: '10px',
            small: '8px',
            xSmall: '7px',
            large: '17px',
          },
          lineHeight: {
            body: 1.6,
            heading: 1.3,
          },
          letterSpacing: {
            heading: '0.4px',
            body: '0.2px',
          },
        },
        layout: {
          columns: 2,
          headerStyle: 'split',
          sectionSpacing: 'spacious',
          photoEnabled: true,
          photoPosition: 'top-right',
          iconStyle: 'colored',
          borderStyle: 'thin',
          backgroundStyle: 'gradient',
          sectionStyle: 'card',
        },
        sections: [
          { id: 'contact', title: 'Contact', enabled: true, order: 0, required: true, alignment: 'left' },
          { id: 'summary', title: 'About Me', enabled: true, order: 1, required: false, alignment: 'left' },
          { id: 'experience', title: 'Experience', enabled: true, order: 2, required: true, alignment: 'left' },
          { id: 'projects', title: 'Portfolio Projects', enabled: true, order: 3, required: false, alignment: 'left' },
          { id: 'skills', title: 'Technical Skills', enabled: true, order: 4, required: false, alignment: 'left' },
          { id: 'education', title: 'Education', enabled: true, order: 5, required: true, alignment: 'left' },
          { id: 'certifications', title: 'Certifications', enabled: false, order: 6, required: false, alignment: 'left' },
          { id: 'languages', title: 'Languages', enabled: false, order: 7, required: false, alignment: 'left' },
        ],
        atsCompatibility: 90,
        popularity: 92,
        isPremium: true,
        isDefault: false,
        tags: ['creative', 'tech', 'modern'],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        features: [
          { icon: '🎨', label: 'Creative Design', description: 'Unique creative layout' },
          { icon: '💻', label: 'Tech Focus', description: 'Optimized for tech roles' },
          { icon: '🌟', label: 'Premium', description: 'Premium template features' },
        ],
      },

      // ============================================
      // 5. MINIMAL ACADEMIC
      // ============================================
      {
        id: 'minimal',
        name: 'Minimal Academic',
        category: 'academic',
        style: 'minimal',
        description: 'Clean, minimal layout optimized for academic CVs and research positions.',
        previewImage: '/templates/minimal.png',
        colors: {
          primary: '#059669',
          secondary: '#047857',
          accent: '#10B981',
          text: '#334155',
          background: '#FFFFFF',
          headingText: '#0F172A',
          borderColor: '#CBD5E1',
          linkColor: '#059669',
          bulletColor: '#047857',
          dividerColor: '#CBD5E1',
          highlightColor: '#ECFDF5',
          successColor: '#10B981',
          errorColor: '#EF4444',
          warningColor: '#F59E0B',
        },
        fonts: {
          heading: 'Helvetica, Arial, sans-serif',
          body: 'Helvetica, Arial, sans-serif',
          accent: 'Helvetica, Arial, sans-serif',
          sizes: {
            name: '22px',
            headings: '12px',
            body: '10px',
            small: '9px',
            xSmall: '8px',
            large: '14px',
          },
          lineHeight: {
            body: 1.4,
            heading: 1.2,
          },
          letterSpacing: {
            heading: '0.3px',
            body: '0.1px',
          },
        },
        layout: {
          columns: 1,
          headerStyle: 'centered',
          sectionSpacing: 'normal',
          photoEnabled: false,
          photoPosition: 'none',
          iconStyle: 'none',
          borderStyle: 'thin',
          backgroundStyle: 'solid',
          sectionStyle: 'line',
        },
        sections: [
          { id: 'contact', title: 'Contact', enabled: true, order: 0, required: true, alignment: 'center' },
          { id: 'summary', title: 'Research Statement', enabled: true, order: 1, required: true, alignment: 'left' },
          { id: 'education', title: 'Academic Education', enabled: true, order: 2, required: true, alignment: 'left' },
          { id: 'experience', title: 'Research Experience', enabled: true, order: 3, required: true, alignment: 'left' },
          { id: 'publications', title: 'Publications', enabled: true, order: 4, required: false, alignment: 'left' },
          { id: 'skills', title: 'Research Skills', enabled: true, order: 5, required: false, alignment: 'left' },
          { id: 'awards', title: 'Awards & Honors', enabled: true, order: 6, required: false, alignment: 'left' },
          { id: 'certifications', title: 'Certifications', enabled: false, order: 7, required: false, alignment: 'left' },
        ],
        atsCompatibility: 97,
        popularity: 78,
        isPremium: false,
        isDefault: false,
        tags: ['academic', 'minimal', 'research'],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        features: [
          { icon: '📚', label: 'Academic Focus', description: 'Optimized for academic CVs' },
          { icon: '📄', label: 'Publication Ready', description: 'Includes publications section' },
        ],
      },

      // ============================================
      // 6. CORPORATE FINANCE
      // ============================================
      {
        id: 'corporate',
        name: 'Corporate Finance',
        category: 'professional',
        style: 'elegant',
        description: 'Professional, conservative design for finance, law, and consulting.',
        previewImage: '/templates/corporate.png',
        colors: {
          primary: '#0F766E',
          secondary: '#115E59',
          accent: '#14B8A6',
          text: '#1E293B',
          background: '#FFFFFF',
          headingText: '#0F172A',
          borderColor: '#CBD5E1',
          linkColor: '#0F766E',
          bulletColor: '#115E59',
          dividerColor: '#CBD5E1',
          highlightColor: '#CCFBF1',
          successColor: '#10B981',
          errorColor: '#EF4444',
          warningColor: '#F59E0B',
        },
        fonts: {
          heading: 'Arial, sans-serif',
          body: 'Arial, sans-serif',
          accent: 'Arial, sans-serif',
          sizes: {
            name: '24px',
            headings: '13px',
            body: '10.5px',
            small: '9px',
            xSmall: '8px',
            large: '15px',
          },
          lineHeight: {
            body: 1.4,
            heading: 1.2,
          },
          letterSpacing: {
            heading: '0.2px',
            body: '0.1px',
          },
        },
        layout: {
          columns: 1,
          headerStyle: 'left',
          sectionSpacing: 'compact',
          photoEnabled: false,
          photoPosition: 'none',
          iconStyle: 'minimal',
          borderStyle: 'thick',
          backgroundStyle: 'solid',
          sectionStyle: 'border',
        },
        sections: [
          { id: 'contact', title: 'Contact', enabled: true, order: 0, required: true, alignment: 'left' },
          { id: 'summary', title: 'Professional Profile', enabled: true, order: 1, required: true, alignment: 'left' },
          { id: 'experience', title: 'Professional Experience', enabled: true, order: 2, required: true, alignment: 'left' },
          { id: 'education', title: 'Education', enabled: true, order: 3, required: true, alignment: 'left' },
          { id: 'skills', title: 'Core Skills', enabled: true, order: 4, required: false, alignment: 'left' },
          { id: 'certifications', title: 'Licenses & Certifications', enabled: true, order: 5, required: false, alignment: 'left' },
          { id: 'awards', title: 'Awards', enabled: false, order: 6, required: false, alignment: 'left' },
        ],
        atsCompatibility: 99,
        popularity: 88,
        isPremium: true,
        isDefault: false,
        tags: ['corporate', 'finance', 'professional'],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        features: [
          { icon: '🏢', label: 'Corporate Style', description: 'Professional corporate layout' },
          { icon: '📊', label: 'Finance Focus', description: 'Optimized for finance roles' },
          { icon: '🌟', label: 'Premium', description: 'Premium template features' },
        ],
      },
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // ============================================
  // PUBLIC METHODS
  // ============================================

  getTemplate(templateId: string): TemplateConfig | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): TemplateConfig[] {
    return Array.from(this.templates.values());
  }

  getDefaultTemplate(): TemplateConfig {
    // Return Mwanza Professional as default
    const defaultTemplate = this.getTemplate('mwanza_professional');
    if (defaultTemplate) {
      return defaultTemplate;
    }
    // Fallback to first template if default not found
    return this.getAllTemplates()[0];
  }

  getTemplatesByCategory(category: string): TemplateConfig[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  getFeaturedTemplates(): TemplateConfig[] {
    // Always include Mwanza Professional as first, then others by popularity
    const all = this.getAllTemplates();
    const featured = all
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 4);
    
    // Ensure Mwanza Professional is first
    const mwanzaIndex = featured.findIndex(t => t.id === 'mwanza_professional');
    if (mwanzaIndex > 0) {
      const mwanza = featured.splice(mwanzaIndex, 1)[0];
      featured.unshift(mwanza);
    }
    
    return featured;
  }

  getRecommendedTemplates(industry?: string): TemplateConfig[] {
    const all = this.getAllTemplates();
    
    if (!industry) return this.getFeaturedTemplates();

    const industryMap: Record<string, string[]> = {
      'data science': ['mwanza_professional', 'modern', 'minimal'],
      technology: ['mwanza_professional', 'modern', 'creative'],
      finance: ['corporate', 'executive', 'modern'],
      healthcare: ['minimal', 'executive'],
      education: ['minimal', 'mwanza_professional'],
      creative: ['creative', 'modern'],
      legal: ['executive', 'corporate'],
      consulting: ['corporate', 'executive', 'modern'],
      software: ['mwanza_professional', 'modern', 'creative'],
      merl: ['mwanza_professional', 'modern', 'minimal'],
    };

    const key = Object.keys(industryMap).find(k => 
      industry.toLowerCase().includes(k)
    ) || 'technology';
    
    const recommended = industryMap[key] || ['mwanza_professional', 'modern', 'executive'];
    
    return recommended
      .map(id => this.getTemplate(id))
      .filter(Boolean) as TemplateConfig[];
  }

  getTemplateCSS(templateId: string): Record<string, string> {
    const template = this.getTemplate(templateId);
    if (!template) return {};

    return {
      '--template-primary': template.colors.primary,
      '--template-secondary': template.colors.secondary,
      '--template-accent': template.colors.accent,
      '--template-text': template.colors.text,
      '--template-background': template.colors.background,
      '--template-heading': template.colors.headingText,
      '--template-border': template.colors.borderColor,
      '--template-font-heading': template.fonts.heading,
      '--template-font-body': template.fonts.body,
      '--template-font-accent': template.fonts.accent,
      '--template-font-size-name': template.fonts.sizes.name,
      '--template-font-size-heading': template.fonts.sizes.headings,
      '--template-font-size-body': template.fonts.sizes.body,
      '--template-font-size-small': template.fonts.sizes.small,
    };
  }

  isTemplateCompatible(templateId: string, sections: string[]): boolean {
    const template = this.getTemplate(templateId);
    if (!template) return false;

    const requiredSections = template.sections
      .filter(s => s.required)
      .map(s => s.id);

    return requiredSections.every(section => sections.includes(section));
  }

  getSectionOrder(templateId: string): string[] {
    const template = this.getTemplate(templateId);
    if (!template) return [];

    return template.sections
      .sort((a, b) => a.order - b.order)
      .filter(s => s.enabled)
      .map(s => s.id);
  }

  customizeColors(templateId: string, colors: Partial<TemplateColors>): TemplateConfig | null {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    const updatedTemplate = {
      ...template,
      colors: { ...template.colors, ...colors },
      updatedAt: new Date().toISOString(),
    };

    this.templates.set(templateId, updatedTemplate);
    return updatedTemplate;
  }

  exportTemplateConfig(templateId: string): string {
    const template = this.getTemplate(templateId);
    return template ? JSON.stringify(template, null, 2) : '';
  }

  importTemplateConfig(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson) as TemplateConfig;
      if (config.id && config.name) {
        this.templates.set(config.id, config);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export default TemplateEngine;
