// src/lib/templateEngine.ts
// ============================================
// TEMPLATE ENGINE - Complete Template System
// UPGRADED: Full Resume Sections & Live Preview
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

  // ============================================
  // FULL MOCK DATA GENERATORS (All Sections)
  // ============================================
  private getMockData(templateCategory: string = 'professional') {
    // Base data for all templates
    const baseData = {
      contact: { fullName: 'Dr. Alexander Mwangi', email: 'alex.mwangi@email.com', phone: '+254 712 345 678', location: 'Nairobi, Kenya', linkedIn: 'linkedin.com/in/alexmwangi' },
      summary: 'Award-winning Data Science Leader with 10+ years driving AI innovation across fintech, telco, and healthcare. PhD in ML from Carnegie Mellon.',
      experience: [
        { position: 'Director of Data Science', company: 'Safaricom PLC', date: '2022–Present', ach: ['Architected 15+ production ML models, $12.4M annual revenue.', 'Led FraudShield AI: 10,000+ TPS, 99.7% accuracy.', 'Built MLOps platform reducing deployment time to 12 hours.'] },
        { position: 'Senior Research Scientist', company: 'Google DeepMind', date: '2019–2021', ach: ['Developed novel GNN architecture for protein folding.', 'Published 8 papers at NeurIPS with 1,200+ citations.', 'Secured $2.8M in research grants.'] }
      ],
      education: [
        { degree: 'PhD Machine Learning', school: 'Carnegie Mellon University', year: '2020', gpa: '4.0/4.0' },
        { degree: 'MSc Computer Science', school: 'University of Nairobi', year: '2015', gpa: '3.92/4.0' }
      ],
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Kubernetes', 'AWS', 'MLflow', 'Spark', 'SQL'],
      projects: [
        { name: 'FraudShield AI', desc: 'Real-time fraud detection for mobile money, 10K+ TPS.' },
        { name: 'AlphaFold Prediction', desc: 'GNN architecture for protein folding.' }
      ],
      certifications: ['AWS Certified ML Specialty', 'TensorFlow Developer Cert', 'Scrum Master'],
      languages: ['English (Native)', 'Swahili (Native)', 'French (Advanced)'],
      awards: ['Top 40 Under 40 Data Scientists (2023)', 'Best Paper Award - NeurIPS 2020'],
      publications: ['GNN for Protein Structure - NeurIPS 2020 (450 citations)']
    };

    // Executive / Corporate Overrides
    if (templateCategory === 'executive') {
      baseData.contact = { fullName: 'Sarah K. Henderson', email: 's.henderson@exec.com', phone: '+1 415 555 0199', location: 'San Francisco, CA', linkedIn: 'linkedin.com/in/shenderson' };
      baseData.summary = 'C-suite Operations Executive with 15+ years driving global digital transformation. Expert in scaling SaaS companies from $50M to $500M ARR.';
      baseData.experience = [
        { position: 'Chief Operating Officer', company: 'CloudCore Solutions Inc.', date: '2018–Present', ach: ['Scaled ARR from $120M to $520M.', 'Reduced overhead by 18% via AI automation.', 'Led integration of 4 major acquisitions.'] },
        { position: 'VP of Product Ops', company: 'FinTech Global Ltd.', date: '2014–2018', ach: ['Launched 3 products generating $45M in first year.', 'Grew EMEA team from 50 to 250 employees.'] }
      ];
      baseData.education = [{ degree: 'MBA, Strategy', school: 'Harvard Business School', year: '2012', gpa: '3.9/4.0' }];
      baseData.skills = ['Strategic Planning', 'M&A Integration', 'Executive Leadership', 'P&L Management', 'Board Relations'];
      baseData.certifications = ['Six Sigma Black Belt', 'Certified Public Accountant (CPA)'];
      baseData.awards = ['CEO of the Year - Tech Awards 2022'];
    } 
    // Creative Overrides
    else if (templateCategory === 'creative') {
      baseData.contact = { fullName: 'Elena M. Ricci', email: 'elena@creativestudio.co', phone: '+39 328 123 4567', location: 'Milan, Italy', linkedIn: 'linkedin.com/in/elenaricci' };
      baseData.summary = 'Multi-disciplinary Product Designer with 8+ years blending minimalist aesthetics with high-conversion UX. A\'Design Award Winner 2023.';
      baseData.experience = [
        { position: 'Lead Product Designer', company: 'Atelier Design Studio', date: '2020–Present', ach: ['Redesigned fintech app, increasing retention by 25%.', 'Created Design System used by 15+ clients.'] },
        { position: 'Senior UI/UX Designer', company: 'DesignLab Berlin', date: '2016–2020', ach: ['Designed award-winning e-commerce platform for luxury auto.'] }
      ];
      baseData.education = [{ degree: 'MFA Interaction Design', school: 'Politecnico di Milano', year: '2016', gpa: '4.0/4.0' }];
      baseData.skills = ['Figma', 'Adobe Creative Suite', 'Webflow', 'Design Systems', 'User Research', 'Prototyping'];
      baseData.projects = [
        { name: 'Luxury E-Commerce', desc: 'Multi-platform design system and UI kit.' },
        { name: 'HealthTech Dashboard', desc: 'AI-driven analytics dashboard for clinicians.' }
      ];
      baseData.awards = ['A\'Design Award 2023', 'Designer of the Year - Berlin 2019'];
    }

    return baseData;
  }

  // ============================================
  // FULL RESUME PREVIEW HTML GENERATOR
  // ============================================
  generatePreviewHTML(templateId: string, scale: number = 1): string {
    const template = this.getTemplate(templateId);
    if (!template) return '<div>Template not found</div>';

    const data = this.getMockData(template.category);
    const s = data;
    const { colors, fonts, layout } = template;

    return `
      <div style="font-family: ${fonts.body}; background: ${colors.background}; color: ${colors.text}; height: 100%; width: 100%; padding: ${8 * scale}px; box-sizing: border-box; overflow: hidden; display: flex; flex-direction: column; border-radius: 2px;">
        
        <!-- 1. HEADER -->
        <div style="background: ${layout.headerStyle === 'split' ? colors.primary : 'transparent'}; padding: ${6 * scale}px ${10 * scale}px; margin-bottom: ${6 * scale}px; border-radius: 2px; text-align: ${layout.headerStyle === 'centered' ? 'center' : 'left'};">
          <div style="font-size: ${16 * scale}px; font-weight: 800; color: ${layout.headerStyle === 'split' ? '#FFFFFF' : colors.headingText}; font-family: ${fonts.heading};">
            ${s.contact.fullName.toUpperCase()}
          </div>
          <div style="font-size: ${8 * scale}px; color: ${layout.headerStyle === 'split' ? '#D1D5FF' : '#6B7280'}; margin-top: ${2 * scale}px;">
            ${s.contact.email} • ${s.contact.phone} • ${s.contact.location}
          </div>
          <div style="font-size: ${7 * scale}px; color: ${layout.headerStyle === 'split' ? '#D1D5FF' : '#9CA3AF'}; margin-top: ${1 * scale}px;">
            ${s.contact.linkedIn}
          </div>
        </div>

        <!-- 2. SUMMARY -->
        <div style="font-size: ${9 * scale}px; line-height: 1.4; margin-bottom: ${6 * scale}px; color: ${colors.text}; padding: 0 ${4 * scale}px;">
          ${s.summary}
        </div>

        <!-- 3. EXPERIENCE -->
        <div style="margin-bottom: ${6 * scale}px; padding: 0 ${4 * scale}px;">
          <div style="font-size: ${10 * scale}px; font-weight: 700; color: ${colors.primary}; border-bottom: 2px solid ${colors.borderColor}; padding-bottom: ${2 * scale}px; margin-bottom: ${4 * scale}px; font-family: ${fonts.heading};">
            Professional Experience
          </div>
          ${s.experience.map((job: any) => `
            <div style="margin-bottom: ${5 * scale}px;">
              <div style="display: flex; justify-content: space-between; font-size: ${10 * scale}px; font-weight: 600; color: #111827;">
                <span>${job.position}</span>
                <span style="font-weight: 400; color: #6B7280; font-size: ${8 * scale}px;">${job.date}</span>
              </div>
              <div style="font-size: ${9 * scale}px; font-weight: 500; color: #374151; margin-bottom: ${1 * scale}px;">${job.company}</div>
              <ul style="font-size: ${8 * scale}px; color: #4B5563; padding-left: ${14 * scale}px; margin: 0; line-height: 1.3; list-style-type: disc;">
                ${job.ach.map((a: string) => `<li>${a}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        <!-- 4. PROJECTS -->
        ${s.projects ? `
        <div style="margin-bottom: ${5 * scale}px; padding: 0 ${4 * scale}px;">
          <div style="font-size: ${10 * scale}px; font-weight: 700; color: ${colors.primary}; border-bottom: 2px solid ${colors.borderColor}; padding-bottom: ${2 * scale}px; margin-bottom: ${3 * scale}px; font-family: ${fonts.heading};">
            Key Projects
          </div>
          ${s.projects.map((proj: any) => `
            <div style="font-size: ${8.5 * scale}px; line-height: 1.3; margin-bottom: ${3 * scale}px; color: #4B5563;">
              <strong style="color: #111827;">${proj.name}:</strong> ${proj.desc}
            </div>
          `).join('')}
        </div>` : ''}

        <!-- 5. EDUCATION, AWARDS & CERTIFICATIONS -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: ${6 * scale}px; padding: 0 ${4 * scale}px; margin-top: auto; padding-top: ${5 * scale}px; border-top: 2px solid ${colors.borderColor};">
          
          <!-- Left Column (Edu & Awards) -->
          <div>
            <div style="font-size: ${10 * scale}px; font-weight: 700; color: ${colors.primary}; font-family: ${fonts.heading}; margin-bottom: ${4 * scale}px;">Education</div>
            ${s.education.map((edu: any) => `
              <div style="font-size: ${8 * scale}px; line-height: 1.3; color: #374151; margin-bottom: ${3 * scale}px;">
                <strong>${edu.degree}</strong> — ${edu.school} (${edu.year})
                ${edu.gpa ? `<span style="color: #6B7280;"> • GPA: ${edu.gpa}</span>` : ''}
              </div>
            `).join('')}

            ${s.awards ? `
            <div style="font-size: ${10 * scale}px; font-weight: 700; color: ${colors.primary}; font-family: ${fonts.heading}; margin-top: ${4 * scale}px; margin-bottom: ${4 * scale}px;">Awards</div>
            ${s.awards.map((award: string) => `
              <div style="font-size: ${8 * scale}px; line-height: 1.3; color: #4B5563; margin-bottom: ${2 * scale}px;">
                • ${award}
              </div>
            `).join('')}` : ''}
          </div>

          <!-- Right Column (Skills, Certs, Languages) -->
          <div>
            <div style="font-size: ${10 * scale}px; font-weight: 700; color: ${colors.primary}; font-family: ${fonts.heading}; margin-bottom: ${4 * scale}px;">Skills</div>
            <div style="display: flex; flex-wrap: wrap; gap: ${3 * scale}px; margin-bottom: ${5 * scale}px;">
              ${s.skills.slice(0, 8).map((skill: string) => `
                <span style="font-size: ${7 * scale}px; background: ${colors.accent}20; color: ${colors.primary}; padding: ${1 * scale}px ${6 * scale}px; border-radius: 2px; font-weight: 500;">
                  ${skill}
                </span>
              `).join('')}
            </div>

            ${s.certifications ? `
            <div style="font-size: ${10 * scale}px; font-weight: 700; color: ${colors.primary}; font-family: ${fonts.heading}; margin-bottom: ${3 * scale}px;">Certifications</div>
            <div style="font-size: ${8 * scale}px; line-height: 1.3; color: #4B5563; margin-bottom: ${4 * scale}px;">
              ${s.certifications.join(' • ')}
            </div>` : ''}

            ${s.languages ? `
            <div style="font-size: ${10 * scale}px; font-weight: 700; color: ${colors.primary}; font-family: ${fonts.heading}; margin-bottom: ${3 * scale}px;">Languages</div>
            <div style="font-size: ${8 * scale}px; line-height: 1.3; color: #4B5563;">
              ${s.languages.join(' • ')}
            </div>` : ''}
          </div>

        </div>

      </div>
    `;
  }

  // ============================================
  // YOUR ORIGINAL TEMPLATES (MAINTAINED 100%)
  // ============================================
  private initializeTemplates(): void {
    const templates: TemplateConfig[] = [
      // 1. MWANZA PROFESSIONAL
      {
        id: 'mwanza_professional',
        name: 'Mwanza Professional',
        category: 'professional',
        style: 'modern',
        description: 'Professional template designed for Data Scientists and MERL Specialists. Clean, modern layout with highlighted contact information.',
        previewImage: '/templates/mwanza_professional.png',
        colors: { primary: '#1a365d', secondary: '#2d3748', accent: '#2b6cb0', text: '#1a202c', background: '#ffffff', headingText: '#1a365d', borderColor: '#e2e8f0', linkColor: '#2b6cb0', bulletColor: '#2b6cb0', dividerColor: '#e2e8f0', highlightColor: '#ebf4ff', successColor: '#38a169', errorColor: '#e53e3e', warningColor: '#dd6b20' },
        fonts: { heading: 'Inter, sans-serif', body: 'Inter, sans-serif', accent: 'Inter, sans-serif', sizes: { name: '28px', headings: '14px', body: '11px', small: '9px', xSmall: '8px', large: '16px' }, lineHeight: { body: 1.5, heading: 1.2 }, letterSpacing: { heading: '0.3px', body: '0.2px' } },
        layout: { columns: 2, headerStyle: 'left', sectionSpacing: 'normal', photoEnabled: false, photoPosition: 'none', iconStyle: 'minimal', borderStyle: 'thin', backgroundStyle: 'solid', sectionStyle: 'line' },
        sections: [ { id: 'contact', title: 'Contact', enabled: true, order: 0, required: true, alignment: 'left', icon: '📧' }, { id: 'summary', title: 'Professional Summary', enabled: true, order: 1, required: true, alignment: 'left', icon: '📄' }, { id: 'skills', title: 'Core Competencies', enabled: true, order: 2, required: false, alignment: 'left', icon: '💡' }, { id: 'experience', title: 'Professional Experience', enabled: true, order: 3, required: true, alignment: 'left', icon: '💼' }, { id: 'projects', title: 'Key Projects', enabled: true, order: 4, required: false, alignment: 'left', icon: '🚀' }, { id: 'education', title: 'Education', enabled: true, order: 5, required: true, alignment: 'left', icon: '🎓' }, { id: 'skills', title: 'Technical Skills', enabled: true, order: 6, required: false, alignment: 'left', icon: '🛠️' }, { id: 'certifications', title: 'Certifications', enabled: true, order: 7, required: false, alignment: 'left', icon: '📜' }, { id: 'languages', title: 'Languages', enabled: true, order: 8, required: false, alignment: 'left', icon: '🌐' } ],
        atsCompatibility: 98, popularity: 100, isPremium: false, isDefault: true, tags: ['professional', 'data science'], createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        features: [{ icon: '🎯', label: 'ATS Optimized', description: 'Designed for maximum ATS compatibility' }],
      },
      // 2. MODERN PROFESSIONAL
      {
        id: 'modern', name: 'Modern Professional', category: 'professional', style: 'contemporary', description: 'Clean, contemporary design with a professional touch. Perfect for tech and modern industries.', previewImage: '/templates/modern.png',
        colors: { primary: '#2563EB', secondary: '#1E40AF', accent: '#3B82F6', text: '#1F2937', background: '#FFFFFF', headingText: '#111827', borderColor: '#E5E7EB', linkColor: '#2563EB', bulletColor: '#2563EB', dividerColor: '#E5E7EB', highlightColor: '#EFF6FF', successColor: '#10B981', errorColor: '#EF4444', warningColor: '#F59E0B' },
        fonts: { heading: 'Inter, sans-serif', body: 'Inter, sans-serif', accent: 'Inter, sans-serif', sizes: { name: '28px', headings: '14px', body: '11px', small: '9px', xSmall: '8px', large: '16px' }, lineHeight: { body: 1.5, heading: 1.2 }, letterSpacing: { heading: '0.5px', body: '0.2px' } },
        layout: { columns: 2, headerStyle: 'left', sectionSpacing: 'normal', photoEnabled: true, photoPosition: 'top-left', iconStyle: 'colored', borderStyle: 'thin', backgroundStyle: 'solid', sectionStyle: 'card' },
        sections: [ { id: 'contact', title: 'Contact Information', enabled: true, order: 0, required: true, alignment: 'left' }, { id: 'summary', title: 'Professional Summary', enabled: true, order: 1, required: false, alignment: 'left' }, { id: 'experience', title: 'Work Experience', enabled: true, order: 2, required: true, alignment: 'left' }, { id: 'education', title: 'Education', enabled: true, order: 3, required: true, alignment: 'left' }, { id: 'skills', title: 'Skills', enabled: true, order: 4, required: false, alignment: 'left' }, { id: 'certifications', title: 'Certifications', enabled: false, order: 5, required: false, alignment: 'left' }, { id: 'projects', title: 'Projects', enabled: false, order: 6, required: false, alignment: 'left' }, { id: 'languages', title: 'Languages', enabled: false, order: 7, required: false, alignment: 'left' } ],
        atsCompatibility: 95, popularity: 98, isPremium: false, isDefault: false, tags: ['professional', 'modern', 'tech'], createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        features: [{ icon: '🎯', label: 'ATS Optimized', description: 'Designed for ATS compatibility' }, { icon: '🎨', label: 'Custom Colors', description: 'Accent color customization' }],
      },
      // 3. EXECUTIVE CLASSIC
      {
        id: 'executive', name: 'Executive Classic', category: 'executive', style: 'classic', description: 'Traditional, authoritative layout for senior executives and conservative industries.', previewImage: '/templates/executive.png',
        colors: { primary: '#1F2937', secondary: '#374151', accent: '#6B7280', text: '#111827', background: '#FFFFFF', headingText: '#000000', borderColor: '#D1D5DB', linkColor: '#1F2937', bulletColor: '#374151', dividerColor: '#D1D5DB', highlightColor: '#F9FAFB', successColor: '#10B981', errorColor: '#EF4444', warningColor: '#F59E0B' },
        fonts: { heading: 'Georgia, serif', body: 'Georgia, serif', accent: 'Arial, sans-serif', sizes: { name: '24px', headings: '13px', body: '10.5px', small: '9px', xSmall: '8px', large: '15px' }, lineHeight: { body: 1.4, heading: 1.3 }, letterSpacing: { heading: '0.3px', body: '0.1px' } },
        layout: { columns: 1, headerStyle: 'centered', sectionSpacing: 'compact', photoEnabled: false, photoPosition: 'none', iconStyle: 'minimal', borderStyle: 'thick', backgroundStyle: 'solid', sectionStyle: 'line' },
        sections: [ { id: 'contact', title: 'Contact', enabled: true, order: 0, required: true, alignment: 'center' }, { id: 'summary', title: 'Executive Summary', enabled: true, order: 1, required: true, alignment: 'left' }, { id: 'experience', title: 'Professional Experience', enabled: true, order: 2, required: true, alignment: 'left' }, { id: 'education', title: 'Education', enabled: true, order: 3, required: true, alignment: 'left' }, { id: 'skills', title: 'Core Competencies', enabled: true, order: 4, required: false, alignment: 'left' }, { id: 'certifications', title: 'Certifications & Licenses', enabled: true, order: 5, required: false, alignment: 'left' }, { id: 'awards', title: 'Awards & Recognition', enabled: false, order: 6, required: false, alignment: 'left' }, { id: 'publications', title: 'Publications', enabled: false, order: 7, required: false, alignment: 'left' } ],
        atsCompatibility: 98, popularity: 85, isPremium: false, isDefault: false, tags: ['executive', 'classic', 'traditional'], createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        features: [{ icon: '🏛️', label: 'Executive Style', description: 'Traditional executive layout' }],
      },
      // 4. CREATIVE TECH
      {
        id: 'creative', name: 'Creative Tech', category: 'creative', style: 'bold', description: 'Bold, modern design for developers, designers, and creative professionals.', previewImage: '/templates/creative.png',
        colors: { primary: '#7C3AED', secondary: '#6D28D9', accent: '#8B5CF6', text: '#374151', background: '#FAFAFA', headingText: '#1F2937', borderColor: '#E5E7EB', linkColor: '#7C3AED', bulletColor: '#7C3AED', dividerColor: '#E5E7EB', highlightColor: '#EDE9FE', successColor: '#10B981', errorColor: '#EF4444', warningColor: '#F59E0B' },
        fonts: { heading: 'Poppins, sans-serif', body: 'Inter, sans-serif', accent: 'Poppins, sans-serif', sizes: { name: '28px', headings: '15px', body: '10px', small: '8px', xSmall: '7px', large: '17px' }, lineHeight: { body: 1.6, heading: 1.3 }, letterSpacing: { heading: '0.4px', body: '0.2px' } },
        layout: { columns: 2, headerStyle: 'split', sectionSpacing: 'spacious', photoEnabled: true, photoPosition: 'top-right', iconStyle: 'colored', borderStyle: 'thin', backgroundStyle: 'gradient', sectionStyle: 'card' },
        sections: [ { id: 'contact', title: 'Contact', enabled: true, order: 0, required: true, alignment: 'left' }, { id: 'summary', title: 'About Me', enabled: true, order: 1, required: false, alignment: 'left' }, { id: 'experience', title: 'Experience', enabled: true, order: 2, required: true, alignment: 'left' }, { id: 'projects', title: 'Portfolio Projects', enabled: true, order: 3, required: false, alignment: 'left' }, { id: 'skills', title: 'Technical Skills', enabled: true, order: 4, required: false, alignment: 'left' }, { id: 'education', title: 'Education', enabled: true, order: 5, required: true, alignment: 'left' }, { id: 'certifications', title: 'Certifications', enabled: false, order: 6, required: false, alignment: 'left' }, { id: 'languages', title: 'Languages', enabled: false, order: 7, required: false, alignment: 'left' } ],
        atsCompatibility: 90, popularity: 92, isPremium: true, isDefault: false, tags: ['creative', 'tech', 'modern'], createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        features: [{ icon: '🎨', label: 'Creative Design', description: 'Unique creative layout' }, { icon: '💻', label: 'Tech Focus', description: 'Optimized for tech roles' }],
      },
      // 5. MINIMAL ACADEMIC
      {
        id: 'minimal', name: 'Minimal Academic', category: 'academic', style: 'minimal', description: 'Clean, minimal layout optimized for academic CVs and research positions.', previewImage: '/templates/minimal.png',
        colors: { primary: '#059669', secondary: '#047857', accent: '#10B981', text: '#334155', background: '#FFFFFF', headingText: '#0F172A', borderColor: '#CBD5E1', linkColor: '#059669', bulletColor: '#047857', dividerColor: '#CBD5E1', highlightColor: '#ECFDF5', successColor: '#10B981', errorColor: '#EF4444', warningColor: '#F59E0B' },
        fonts: { heading: 'Helvetica, sans-serif', body: 'Helvetica, sans-serif', accent: 'Helvetica, sans-serif', sizes: { name: '22px', headings: '12px', body: '10px', small: '9px', xSmall: '8px', large: '14px' }, lineHeight: { body: 1.4, heading: 1.2 }, letterSpacing: { heading: '0.3px', body: '0.1px' } },
        layout: { columns: 1, headerStyle: 'centered', sectionSpacing: 'normal', photoEnabled: false, photoPosition: 'none', iconStyle: 'none', borderStyle: 'thin', backgroundStyle: 'solid', sectionStyle: 'line' },
        sections: [ { id: 'contact', title: 'Contact', enabled: true, order: 0, required: true, alignment: 'center' }, { id: 'summary', title: 'Research Statement', enabled: true, order: 1, required: true, alignment: 'left' }, { id: 'education', title: 'Academic Education', enabled: true, order: 2, required: true, alignment: 'left' }, { id: 'experience', title: 'Research Experience', enabled: true, order: 3, required: true, alignment: 'left' }, { id: 'publications', title: 'Publications', enabled: true, order: 4, required: false, alignment: 'left' }, { id: 'skills', title: 'Research Skills', enabled: true, order: 5, required: false, alignment: 'left' }, { id: 'awards', title: 'Awards & Honors', enabled: true, order: 6, required: false, alignment: 'left' }, { id: 'certifications', title: 'Certifications', enabled: false, order: 7, required: false, alignment: 'left' } ],
        atsCompatibility: 97, popularity: 78, isPremium: false, isDefault: false, tags: ['academic', 'minimal', 'research'], createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        features: [{ icon: '📚', label: 'Academic Focus', description: 'Optimized for academic CVs' }],
      },
      // 6. CORPORATE FINANCE
      {
        id: 'corporate', name: 'Corporate Finance', category: 'professional', style: 'elegant', description: 'Professional, conservative design for finance, law, and consulting.', previewImage: '/templates/corporate.png',
        colors: { primary: '#0F766E', secondary: '#115E59', accent: '#14B8A6', text: '#1E293B', background: '#FFFFFF', headingText: '#0F172A', borderColor: '#CBD5E1', linkColor: '#0F766E', bulletColor: '#115E59', dividerColor: '#CBD5E1', highlightColor: '#CCFBF1', successColor: '#10B981', errorColor: '#EF4444', warningColor: '#F59E0B' },
        fonts: { heading: 'Arial, sans-serif', body: 'Arial, sans-serif', accent: 'Arial, sans-serif', sizes: { name: '24px', headings: '13px', body: '10.5px', small: '9px', xSmall: '8px', large: '15px' }, lineHeight: { body: 1.4, heading: 1.2 }, letterSpacing: { heading: '0.2px', body: '0.1px' } },
        layout: { columns: 1, headerStyle: 'left', sectionSpacing: 'compact', photoEnabled: false, photoPosition: 'none', iconStyle: 'minimal', borderStyle: 'thick', backgroundStyle: 'solid', sectionStyle: 'border' },
        sections: [ { id: 'contact', title: 'Contact', enabled: true, order: 0, required: true, alignment: 'left' }, { id: 'summary', title: 'Professional Profile', enabled: true, order: 1, required: true, alignment: 'left' }, { id: 'experience', title: 'Professional Experience', enabled: true, order: 2, required: true, alignment: 'left' }, { id: 'education', title: 'Education', enabled: true, order: 3, required: true, alignment: 'left' }, { id: 'skills', title: 'Core Skills', enabled: true, order: 4, required: false, alignment: 'left' }, { id: 'certifications', title: 'Licenses & Certifications', enabled: true, order: 5, required: false, alignment: 'left' }, { id: 'awards', title: 'Awards', enabled: false, order: 6, required: false, alignment: 'left' } ],
        atsCompatibility: 99, popularity: 88, isPremium: true, isDefault: false, tags: ['corporate', 'finance', 'professional'], createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        features: [{ icon: '🏢', label: 'Corporate Style', description: 'Professional corporate layout' }, { icon: '📊', label: 'Finance Focus', description: 'Optimized for finance roles' }],
      },
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // ============================================
  // PUBLIC METHODS (MAINTAINED 100%)
  // ============================================

  getTemplate(templateId: string): TemplateConfig | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): TemplateConfig[] {
    return Array.from(this.templates.values());
  }

  getDefaultTemplate(): TemplateConfig {
    const defaultTemplate = this.getTemplate('mwanza_professional');
    if (defaultTemplate) return defaultTemplate;
    return this.getAllTemplates()[0];
  }

  getTemplatesByCategory(category: string): TemplateConfig[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  getFeaturedTemplates(): TemplateConfig[] {
    const all = this.getAllTemplates();
    const featured = all.sort((a, b) => b.popularity - a.popularity).slice(0, 4);
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

    const key = Object.keys(industryMap).find(k => industry.toLowerCase().includes(k)) || 'technology';
    const recommended = industryMap[key] || ['mwanza_professional', 'modern', 'executive'];
    
    return recommended.map(id => this.getTemplate(id)).filter(Boolean) as TemplateConfig[];
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
