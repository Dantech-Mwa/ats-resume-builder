// ============================================
// TEMPLATE ENGINE
// ============================================

import { TemplateConfig, TemplateColors, TemplateFonts, TemplateLayout } from './types';

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
      {
        id: 'modern',
        name: 'Modern Professional',
        category: 'modern',
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
          },
        },
        layout: {
          columns: 2,
          headerStyle: 'left',
          sectionSpacing: 'normal',
          photoEnabled: true,
          iconStyle: 'colored',
        },
        sections: this.getDefaultSections('modern'),
        atsCompatibility: 95,
        popularity: 98,
        isPremium: false,
      },
      {
        id: 'executive',
        name: 'Executive Classic',
        category: 'executive',
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
          },
        },
        layout: {
          columns: 1,
          headerStyle: 'centered',
          sectionSpacing: 'compact',
          photoEnabled: false,
          iconStyle: 'minimal',
        },
        sections: this.getDefaultSections('executive'),
        atsCompatibility: 98,
        popularity: 85,
        isPremium: false,
      },
      {
        id: 'creative',
        name: 'Creative Tech',
        category: 'creative',
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
          },
        },
        layout: {
          columns: 2,
          headerStyle: 'split',
          sectionSpacing: 'spacious',
          photoEnabled: true,
          iconStyle: 'colored',
        },
        sections: this.getDefaultSections('creative'),
        atsCompatibility: 90,
        popularity: 92,
        isPremium: true,
      },
      {
        id: 'minimal',
        name: 'Minimal Academic',
        category: 'academic',
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
          },
        },
        layout: {
          columns: 1,
          headerStyle: 'centered',
          sectionSpacing: 'normal',
          photoEnabled: false,
          iconStyle: 'none',
        },
        sections: this.getDefaultSections('minimal'),
        atsCompatibility: 97,
        popularity: 78,
        isPremium: false,
      },
      {
        id: 'corporate',
        name: 'Corporate Finance',
        category: 'professional',
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
          },
        },
        layout: {
          columns: 1,
          headerStyle: 'left',
          sectionSpacing: 'compact',
          photoEnabled: false,
          iconStyle: 'minimal',
        },
        sections: this.getDefaultSections('corporate'),
        atsCompatibility: 99,
        popularity: 88,
        isPremium: true,
      },
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private getDefaultSections(templateType: string) {
    const baseSections = [
      { id: 'contact', title: 'Contact Information', enabled: true, order: 1 },
      { id: 'summary', title: 'Professional Summary', enabled: true, order: 2 },
      { id: 'experience', title: 'Work Experience', enabled: true, order: 3 },
      { id: 'education', title: 'Education', enabled: true, order: 4 },
      { id: 'skills', title: 'Skills', enabled: true, order: 5 },
      { id: 'certifications', title: 'Certifications', enabled: false, order: 6 },
      { id: 'projects', title: 'Projects', enabled: false, order: 7 },
      { id: 'languages', title: 'Languages', enabled: false, order: 8 },
    ];

    if (templateType === 'minimal') {
      baseSections.push(
        { id: 'publications', title: 'Publications', enabled: true, order: 9 },
        { id: 'awards', title: 'Awards & Honors', enabled: true, order: 10 }
      );
    }

    return baseSections;
  }

  // Get template by ID
  getTemplate(templateId: string): TemplateConfig | undefined {
    return this.templates.get(templateId);
  }

  // Get all templates
  getAllTemplates(): TemplateConfig[] {
    return Array.from(this.templates.values());
  }

  // Get templates by category
  getTemplatesByCategory(category: string): TemplateConfig[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  // Get featured templates (top 3)
  getFeaturedTemplates(): TemplateConfig[] {
    return this.getAllTemplates()
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 3);
  }

  // Get recommended templates based on industry
  getRecommendedTemplates(industry?: string): TemplateConfig[] {
    const all = this.getAllTemplates();
    
    if (!industry) return this.getFeaturedTemplates();

    const industryMap: Record<string, string[]> = {
      technology: ['modern', 'creative'],
      finance: ['corporate', 'executive'],
      healthcare: ['minimal', 'executive'],
      education: ['minimal'],
      creative: ['creative', 'modern'],
      legal: ['executive', 'corporate'],
      consulting: ['corporate', 'executive'],
    };

    const recommended = industryMap[industry.toLowerCase()] || ['modern', 'executive', 'minimal'];
    
    return recommended
      .map(id => this.getTemplate(id))
      .filter(Boolean) as TemplateConfig[];
  }

  // Get CSS variables for a template
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

  // Validate template compatibility
  isTemplateCompatible(templateId: string, sections: string[]): boolean {
    const template = this.getTemplate(templateId);
    if (!template) return false;

    const requiredSections = template.sections
      .filter(s => s.enabled)
      .map(s => s.id);

    return requiredSections.every(section => sections.includes(section));
  }

  // Get section order for template
  getSectionOrder(templateId: string): string[] {
    const template = this.getTemplate(templateId);
    if (!template) return [];

    return template.sections
      .sort((a, b) => a.order - b.order)
      .filter(s => s.enabled)
      .map(s => s.id);
  }

  // Customize template colors
  customizeColors(templateId: string, colors: Partial<TemplateColors>): TemplateConfig | null {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    const updatedTemplate = {
      ...template,
      colors: { ...template.colors, ...colors },
    };

    this.templates.set(templateId, updatedTemplate);
    return updatedTemplate;
  }

  // Export template configuration
  exportTemplateConfig(templateId: string): string {
    const template = this.getTemplate(templateId);
    return template ? JSON.stringify(template, null, 2) : '';
  }

  // Import template configuration
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