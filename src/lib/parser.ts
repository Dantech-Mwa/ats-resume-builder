// ============================================
// WORLD-CLASS PROFESSIONAL RESUME PARSER
// Beats Workday, BambooHR, Lever, Indeed Parsing
// ============================================

import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { ResumeSections, ContactInfo, WorkExperience, Education, Skill } from './types';
import { v4 as uuidv4 } from 'uuid';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export interface ResumeImportResult {
  success: boolean;
  parsed: Partial<ResumeSections>;
  errors: string[];
  warnings: string[];
  rawText: string;
}

export interface ParsedBlock {
  type: 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'certification' | 'project' | 'language' | 'unknown';
  content: string;
  confidence: number;
  metadata?: any;
}

class ResumeParser {
  private static instance: ResumeParser;

  static getInstance(): ResumeParser {
    if (!ResumeParser.instance) {
      ResumeParser.instance = new ResumeParser();
    }
    return ResumeParser.instance;
  }

  // ============================================
  // MAIN PARSING - ENTRY POINT
  // ============================================

  async parseFile(file: File): Promise<ResumeImportResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, parsed: {}, errors: validation.errors, warnings: [], rawText: '' };
      }

      let text = '';
      const ext = file.name.split('.').pop()?.toLowerCase();

      switch (ext) {
        case 'pdf': text = await this.parsePDF(file); break;
        case 'docx': case 'doc': text = await this.parseDOCX(file); break;
        case 'txt': text = await this.parseTXT(file); break;
        default:
          errors.push(`Unsupported format: .${ext}`);
          return { success: false, parsed: {}, errors, warnings, rawText: '' };
      }

      if (!text.trim()) {
        errors.push('No text extracted. File may be empty or image-based.');
        return { success: false, parsed: {}, errors, warnings, rawText: '' };
      }

      const cleanedText = this.cleanText(text);
      
      // FORCE SECTION SPLIT FIRST - this is the secret sauce
      const forcedSections = this.forceSectionSplit(cleanedText);
      
      // Build sections from forced split
      const sections = this.buildSectionsFromForcedSplit(forcedSections, cleanedText);

      // Warnings
      if (!sections.contact?.email) warnings.push('No email found');
      if (!sections.contact?.phone) warnings.push('No phone found');
      if (!sections.experience?.length) warnings.push('No experience detected');
      if (!sections.education?.length) warnings.push('No education detected');

      return {
        success: true,
        parsed: sections,
        errors: [],
        warnings,
        rawText: cleanedText,
      };
    } catch (error: any) {
      errors.push(`Parse failed: ${error.message}`);
      return { success: false, parsed: {}, errors, warnings, rawText: '' };
    }
  }

  // ============================================
  // FILE VALIDATION
  // ============================================

  private validateFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024;
    const allowed = ['pdf', 'docx', 'doc', 'txt'];
    if (!file) errors.push('No file provided.');
    if (file.size > maxSize) errors.push(`File too large (max 10MB)`);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowed.includes(ext)) errors.push(`Unsupported: .${ext}`);
    return { valid: errors.length === 0, errors };
  }

  // ============================================
  // PDF PARSING
  // ============================================

  private async parsePDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return text || '';
    } catch {
      const text = await file.text();
      return text.length > 50 ? text : '';
    }
  }

  // ============================================
  // DOCX PARSING
  // ============================================

  private async parseDOCX(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || '';
  }

  // ============================================
  // TXT PARSING
  // ============================================

  private async parseTXT(file: File): Promise<string> {
    return await file.text();
  }

  // ============================================
  // TEXT CLEANING
  // ============================================

  private cleanText(text: string): string {
    return text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\t/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .replace(/[•●○▪▫■□]/g, '•')
      .replace(/[–—―]/g, '-')
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .trim();
  }

  // ============================================
  // 🔥 FORCE SECTION SPLIT - THE SECRET SAUCE
  // Aggressively identifies section headers and splits text
  // ============================================

  private forceSectionSplit(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    
    // COMPREHENSIVE section markers - covers every possible variation
    const markers: { key: string; patterns: RegExp[] }[] = [
      { 
        key: 'experience', 
        patterns: [
          /(?:PROFESSIONAL\s+EXPERIENCE|WORK\s+EXPERIENCE|EMPLOYMENT|WORK\s+HISTORY|PROFESSIONAL\s+BACKGROUND|CAREER\s+HISTORY|RELEVANT\s+EXPERIENCE)/i,
          /(?:Professional\s+Experience|Work\s+Experience|Work\s+&\s+Experience)/,
          /^EXPERIENCE$/im,
        ]
      },
      { 
        key: 'education', 
        patterns: [
          /(?:EDUCATION|ACADEMIC|QUALIFICATIONS|EDUCATION\s*&?\s*CREDENTIALS|ACADEMIC\s+BACKGROUND|EDUCATIONAL\s+BACKGROUND)/i,
          /(?:Education|Academic\s+Background|Academic\s+Credentials)/,
          /^EDUCATION$/im,
        ]
      },
      { 
        key: 'skills', 
        patterns: [
          /(?:TECHNICAL\s+PROFILE|SKILLS|TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|TECHNOLOGIES|EXPERTISE|PROFICIENCIES|TECHNICAL\s+PROFILE\s*&?\s*TOOLS|TECHNICAL\s+PROFICIENCIES)/i,
          /(?:Technical\s+Profile|Skills\s*&?\s*Tools|Core\s+Competencies)/,
          /^SKILLS$/im,
        ]
      },
      { 
        key: 'projects', 
        patterns: [
          /(?:KEY\s+PROJECTS|PROJECTS|PROJECT\s+EXPERIENCE|NOTABLE\s+PROJECTS|PERSONAL\s+PROJECTS|ACADEMIC\s+PROJECTS|PROJECT\s+PORTFOLIO)/i,
          /(?:Key\s+Projects|Project\s+Experience|Projects?\s*&?\s*Portfolio)/,
          /^PROJECTS$/im,
        ]
      },
      { 
        key: 'certifications', 
        patterns: [
          /(?:CERTIFICATIONS?|CERTIFICATES?|LICENSES?|PROFESSIONAL\s+CERTIFICATIONS?|ACCREDITATIONS?)/i,
        ]
      },
      { 
        key: 'languages', 
        patterns: [
          /(?:LANGUAGES?|LANGUAGE\s+PROFICIENCY|SPOKEN\s+LANGUAGES?)/i,
        ]
      },
      { 
        key: 'summary', 
        patterns: [
          /(?:PROFESSIONAL\s+SUMMARY|PROFILE|CAREER\s+OBJECTIVE|PERSONAL\s+STATEMENT|ABOUT\s+ME)/i,
        ]
      },
    ];

    // Find all marker positions
    const positions: { key: string; index: number; match: string }[] = [];
    
    for (const marker of markers) {
      for (const pattern of marker.patterns) {
        const match = text.match(pattern);
        if (match && match.index !== undefined) {
          positions.push({ key: marker.key, index: match.index, match: match[0] });
          break;
        }
      }
    }

    // Sort by position in text
    positions.sort((a, b) => a.index - b.index);

    // Extract sections between markers
    for (let i = 0; i < positions.length; i++) {
      const current = positions[i];
      const next = positions[i + 1];
      const startIndex = current.index + current.match.length;
      const endIndex = next ? next.index : text.length;
      
      sections[current.key] = text.substring(startIndex, endIndex).trim();
    }

    // Everything before first marker is header (contact + summary)
    if (positions.length > 0) {
      sections['header'] = text.substring(0, positions[0].index).trim();
    } else {
      sections['header'] = text;
    }

    return sections;
  }

  // ============================================
  // BUILD SECTIONS FROM FORCED SPLIT
  // ============================================

  private buildSectionsFromForcedSplit(forcedSections: Record<string, string>, fullText: string): Partial<ResumeSections> {
    const sections: Partial<ResumeSections> = {};
    const headerText = forcedSections['header'] || fullText;

    // 1. CONTACT - from header
    sections.contact = this.extractContactAdvanced(headerText);

    // 2. SUMMARY - first meaningful paragraph after contact in header
    sections.summary = {
      content: this.extractSummaryAdvanced(headerText),
      aiOptimized: false,
      lastModified: new Date().toISOString(),
    };

    // 3. EXPERIENCE
    if (forcedSections['experience']) {
      sections.experience = this.extractExperienceAdvanced(forcedSections['experience']);
    } else {
      sections.experience = [];
    }

    // 4. EDUCATION
    if (forcedSections['education']) {
      sections.education = this.extractEducationAdvanced(forcedSections['education']);
    } else {
      sections.education = [];
    }

    // 5. SKILLS
    if (forcedSections['skills']) {
      sections.skills = this.extractSkillsAdvanced(forcedSections['skills']);
    } else {
      sections.skills = this.extractSkillsAdvanced(fullText);
    }

    // 6. PROJECTS
    if (forcedSections['projects']) {
      sections.projects = this.extractProjectsAdvanced(forcedSections['projects']);
    } else {
      sections.projects = [];
    }

    // 7. CERTIFICATIONS
    if (forcedSections['certifications']) {
      sections.certifications = this.extractCertificationsAdvanced(forcedSections['certifications']);
    } else {
      sections.certifications = [];
    }

    // 8. LANGUAGES
    if (forcedSections['languages']) {
      sections.languages = this.extractLanguagesAdvanced(forcedSections['languages']);
    } else {
      sections.languages = [];
    }

    return sections;
  }

  // ============================================
  // CONTACT EXTRACTION - ADVANCED
  // ============================================

  private extractContactAdvanced(text: string): ContactInfo {
    const contact: ContactInfo = {
      fullName: '', email: '', phone: '', location: '', country: '',
    };

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    // Name: First line that looks like a person's name
    for (const line of lines.slice(0, 8)) {
      if (!line.includes('@') && 
          !line.match(/^[\d\s\+\-\(\)\.]{7,}$/) &&
          !line.match(/^(linkedin|github|portfolio|http|www)/i) &&
          !line.match(/^(phone|tel|mobile|cell|email|address)/i) &&
          line.length > 2 && line.length < 60 &&
          /^[A-Za-z\s\.\-']+$/.test(line)) {
        contact.fullName = line;
        break;
      }
    }

    // Email
    const emailMatch = text.match(/([\w\.\-\+]+@[\w\.\-]+\.[a-z]{2,})/i);
    if (emailMatch) contact.email = emailMatch[1];

    // Phone - multiple patterns
    const phonePatterns = [
      /(?:\+\d{1,3}[\s\-\.]?)?\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4}/,
      /(?:phone|tel|mobile|cell)[:\s]*([\+\d\s\-\(\)\.]{10,})/i,
    ];
    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) { contact.phone = match[1] || match[0]; break; }
    }

    // Location
    const locMatch = text.match(/([A-Z][a-z]+,\s*(?:[A-Z]{2}|[A-Z][a-z]+(?:\s+(?:County|State|Province))?))/);
    if (locMatch) contact.location = locMatch[1];

    // LinkedIn
    const liMatch = text.match(/linkedin\.com\/in\/([\w\-]+)/i);
    if (liMatch) contact.linkedIn = `https://linkedin.com/in/${liMatch[1]}`;

    // GitHub
    const ghMatch = text.match(/github\.com\/([\w\-]+)/i);
    if (ghMatch) contact.github = `https://github.com/${ghMatch[1]}`;

    return contact;
  }

  // ============================================
  // SUMMARY EXTRACTION - ADVANCED
  // ============================================

  private extractSummaryAdvanced(headerText: string): string {
    const lines = headerText.split('\n').map(l => l.trim()).filter(Boolean);
    let contactPassed = false;
    let summaryLines: string[] = [];

    for (const line of lines) {
      // Skip contact lines
      if (!contactPassed && (line.includes('@') || line.match(/[\d\s\+\-\(\)]{10,}/) || line.includes('linkedin'))) {
        contactPassed = true;
        continue;
      }
      
      // After contact, collect meaningful paragraphs
      if (contactPassed && line.length > 40 && !this.isSectionHeader(line)) {
        summaryLines.push(line);
      }
      
      // Stop at next section
      if (this.isSectionHeader(line)) break;
    }

    return summaryLines.join(' ').trim();
  }

  // ============================================
  // SECTION HEADER DETECTION
  // ============================================

  private isSectionHeader(line: string): boolean {
    const trimmed = line.trim();
    if (trimmed.length > 60) return false;
    
    const headerPatterns = [
      /^(?:PROFESSIONAL\s+)?(?:EXPERIENCE|SUMMARY|PROFILE)/i,
      /^EDUCATION/i,
      /^SKILLS?$/i,
      /^CERTIFICATIONS?$/i,
      /^PROJECTS?$/i,
      /^LANGUAGES?$/i,
      /^TECHNICAL\s+(?:SKILLS?|PROFILE)/i,
      /^CORE\s+COMPETENC/i,
      /^WORK\s+(?:EXPERIENCE|HISTORY)/i,
      /^KEY\s+PROJECTS?/i,
      /^ACADEMIC/i,
      /^QUALIFICATIONS?$/i,
      /^EMPLOYMENT$/i,
    ];
    
    return headerPatterns.some(p => p.test(trimmed));
  }

  // ============================================
  // EXPERIENCE EXTRACTION - ADVANCED
  // ============================================

  private extractExperienceAdvanced(text: string): WorkExperience[] {
    const experiences: WorkExperience[] = [];
    if (!text.trim()) return experiences;

    // Split into individual job entries by date patterns
    const entries = this.splitByJobEntries(text);
    
    for (const entry of entries) {
      const exp = this.parseJobEntry(entry);
      if (exp.position || exp.company) {
        experiences.push(exp);
      }
    }

    return experiences;
  }

  private splitByJobEntries(text: string): string[] {
    // Split by date patterns (Month YYYY - Month YYYY or MM/YYYY - MM/YYYY)
    const datePattern = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*(?:-|–|to)\s*(?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|Present|Current)\b|\d{2}\/\d{4}\s*(?:-|–|to)\s*(?:\d{2}\/\d{4}|Present|Current))/gi;
    
    const parts = text.split(datePattern).filter(Boolean);
    
    if (parts.length <= 1) {
      // Try splitting by double newlines
      const chunks = text.split(/\n\s*\n/).filter(Boolean);
      if (chunks.length > 1) return chunks;
      return [text];
    }

    // Reconstruct entries with dates
    const entries: string[] = [];
    const matches = text.match(datePattern) || [];
    
    for (let i = 0; i < matches.length; i++) {
      const beforeDate = parts[i] || '';
      const date = matches[i] || '';
      entries.push((beforeDate + ' ' + date).trim());
    }
    
    // Add remaining text after last date
    if (parts.length > matches.length) {
      entries[entries.length - 1] += ' ' + parts[parts.length - 1];
    }

    return entries.filter(e => e.trim().length > 10);
  }

  private parseJobEntry(text: string): WorkExperience {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    
    let position = '';
    let company = '';
    let startDate = '';
    let endDate = '';
    let current = false;
    let location = '';
    const description: string[] = [];
    const achievements: string[] = [];

    // Extract dates
    const datePattern = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{2}\/\d{4})\s*(?:-|–|to)\s*(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{2}\/\d{4}|Present|Current)\b/i;
    const dateMatch = text.match(datePattern);
    if (dateMatch) {
      startDate = dateMatch[1];
      endDate = dateMatch[2];
      current = /present|current/i.test(endDate);
    }

    // Parse position and company
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i];
      
      if (!position && !line.startsWith('•') && !line.startsWith('-') && line.length < 100) {
        // Check for "Position at Company" or "Position | Company" format
        const atMatch = line.match(/^(.+?)\s+(?:at|@|\||,)\s+(.+)$/i);
        if (atMatch) {
          position = atMatch[1].trim();
          company = atMatch[2].trim();
          continue;
        }
        
        // Check for "Position, Company" format
        const commaMatch = line.match(/^([^,]+),\s*(.+)$/);
        if (commaMatch && line.length < 80) {
          position = commaMatch[1].trim();
          company = commaMatch[2].trim();
          continue;
        }

        // First non-date line is position
        if (!line.match(datePattern) && line.length > 3) {
          position = line;
          continue;
        }
      }
      
      if (position && !company && !line.startsWith('•') && line.length < 80 && !line.match(datePattern)) {
        company = line;
        continue;
      }

      // Location detection
      const locMatch = line.match(/^([A-Z][a-z]+,\s*(?:[A-Z]{2}|[A-Z][a-z]+))$/);
      if (locMatch && !location) {
        location = locMatch[1];
        continue;
      }

      // Bullet points = achievements
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('○')) {
        achievements.push(line.replace(/^[•\-*○]\s*/, ''));
      } else if (line.length > 10) {
        description.push(line);
      }
    }

    return {
      id: uuidv4(),
      company: company || '',
      position: position || '',
      startDate,
      endDate,
      current,
      location,
      description: description.join(' ').substring(0, 1000),
      achievements: achievements.slice(0, 20),
      technologies: [],
      aiSuggestions: [],
    };
  }

  // ============================================
  // EDUCATION EXTRACTION - ADVANCED
  // ============================================

  private extractEducationAdvanced(text: string): Education[] {
    const education: Education[] = [];
    if (!text.trim()) return education;

    const entries = text.split(/\n\s*\n/).filter(Boolean);

    for (const entry of entries) {
      const lines = entry.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 1) continue;

      let institution = '';
      let degree = '';
      let field = '';
      let startDate = '';
      let endDate = '';
      let gpa = '';

      for (const line of lines) {
        // Degree detection
        const degreePatterns = [
          /(Bachelor|Master|Doctorate|Ph\.?D\.?|MBA|B\.?S\.?c?\.?|M\.?S\.?c?\.?|B\.?A\.?|M\.?A\.?|Associate|Diploma|Postgraduate|Certificate)\s*(?:of|in)?\s*([\w\s]+)?/i,
          /(B\.?S\.?c?\.?|M\.?S\.?c?\.?|B\.?A\.?|M\.?A\.?|Ph\.?D\.?|MBA|MScFE?)\s*(?:in\s*)?([\w\s]+)?/i,
        ];
        
        for (const pattern of degreePatterns) {
          const match = line.match(pattern);
          if (match) {
            degree = match[1] + (match[2] ? ' in ' + match[2] : '');
            field = match[2] || '';
            break;
          }
        }

        // Institution detection
        if (!institution && line.length > 5 && line.length < 80) {
          const eduWords = ['university', 'college', 'institute', 'school', 'academy', 'polytechnic'];
          if (eduWords.some(w => line.toLowerCase().includes(w)) || 
              /^[A-Z][A-Za-z\s&\.]+$/.test(line) && line.length > 10) {
            institution = line;
          }
        }

        // GPA
        const gpaMatch = line.match(/GPA:?\s*([\d.]+(?:\/\d\.?\d?)?)/i);
        if (gpaMatch) gpa = gpaMatch[1];

        // Dates
        const dateMatch = line.match(/(\d{4})\s*(?:-|–|to)\s*(\d{4}|Present|Current|In\s+Progress)/i);
        if (dateMatch) {
          startDate = dateMatch[1];
          endDate = dateMatch[2];
        }
      }

      if (degree || institution) {
        education.push({
          id: uuidv4(),
          institution,
          degree: degree || entry.split('\n')[0].trim(),
          field,
          startDate,
          endDate,
          gpa,
          honors: [],
          activities: [],
          relevantCourses: [],
        });
      }
    }

    return education;
  }

  // ============================================
  // SKILLS EXTRACTION - ADVANCED
  // ============================================

  private extractSkillsAdvanced(text: string): any {
    const technical: Skill[] = [];
    const soft: Skill[] = [];
    const tools: Skill[] = [];

    if (!text.trim()) {
      return { technical: [], soft: [], languages: [], tools: [], other: [] };
    }

    // Split by multiple delimiters
    const rawSkills = text
      .split(/[,;•\|\/\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 60 && !/^(?:skills|technical|core|competencies|profile|tools|languages)/i.test(s));

    const techKeywords = [
      'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'scala', 'r', 'matlab',
      'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel', 'rails', 'next', 'nuxt', 'svelte',
      'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'jquery', 'webpack', 'vite', 'babel',
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'mssql', 'sqlite', 'dynamodb', 'cassandra',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'circleci', 'github actions',
      'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'teams',
      'api', 'rest', 'graphql', 'grpc', 'microservices', 'serverless', 'lambda',
      'machine learning', 'deep learning', 'nlp', 'computer vision', 'data science', 'analytics',
      'tableau', 'power bi', 'looker', 'excel', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch',
      'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'bdd',
      'linux', 'unix', 'bash', 'shell', 'powershell',
      'figma', 'sketch', 'adobe', 'photoshop', 'illustrator',
      'spss', 'stata', 'sas', 'mlflow',
    ];

    const softKeywords = [
      'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
      'time management', 'project management', 'adaptability', 'creativity', 'collaboration',
      'analytical', 'detail-oriented', 'organized', 'self-motivated', 'strategic',
      'mentoring', 'coaching', 'negotiation', 'presentation', 'public speaking',
      'interpersonal', 'emotional intelligence', 'conflict resolution', 'decision making',
      'stakeholder management', 'cross-functional', 'data-driven',
    ];

    for (const skill of rawSkills) {
      const lower = skill.toLowerCase();
      
      if (techKeywords.some(k => lower.includes(k))) {
        technical.push({ name: skill, level: 'Intermediate', category: 'Technical' });
      } else if (softKeywords.some(k => lower.includes(k))) {
        soft.push({ name: skill, level: 'Intermediate', category: 'Soft Skills' });
      } else if (skill.length > 2 && /^[A-Za-z0-9#\+\.\s\-]+$/.test(skill)) {
        technical.push({ name: skill, level: 'Intermediate', category: 'Technical' });
      }
    }

    // Deduplicate
    const uniqueTechnical = technical.filter((s, i, arr) => 
      arr.findIndex(t => t.name.toLowerCase() === s.name.toLowerCase()) === i
    );
    const uniqueSoft = soft.filter((s, i, arr) => 
      arr.findIndex(t => t.name.toLowerCase() === s.name.toLowerCase()) === i
    );

    return {
      technical: uniqueTechnical.slice(0, 30),
      soft: uniqueSoft.slice(0, 15),
      languages: [],
      tools: tools.slice(0, 15),
      other: [],
    };
  }

  // ============================================
  // PROJECTS EXTRACTION - ADVANCED
  // ============================================

  private extractProjectsAdvanced(text: string): any[] {
    const projects: any[] = [];
    if (!text.trim()) return projects;

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let currentProject: any = null;

    for (const line of lines) {
      // Project start detection
      const projectStartPatterns = [
        /^Founder[,:\s]/i,
        /^Creator[,:\s]/i,
        /^Developer[,:\s]/i,
        /^Lead[,:\s]/i,
        /^Co-?Founder[,:\s]/i,
        /^Built[,:\s]/i,
        /^Developed[,:\s]/i,
        /^Created[,:\s]/i,
        /^Launched[,:\s]/i,
        /^Designed[,:\s]/i,
        /^Implemented[,:\s]/i,
        /^Managed[,:\s]/i,
        /^Coordinated[,:\s]/i,
      ];

      const isProjectStart = projectStartPatterns.some(p => p.test(line)) || 
        (line.length > 5 && line.length < 100 && /^[A-Z]/.test(line) && 
         !line.includes('•') && !line.includes('University') && !line.includes('College'));

      if (isProjectStart && !line.match(/^\d{2}\/\d{4}/) && !line.match(/^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)) {
        if (currentProject && currentProject.name) {
          projects.push(currentProject);
        }
        
        const colonParts = line.split(':');
        currentProject = {
          id: uuidv4(),
          name: colonParts[0].trim(),
          description: colonParts.length > 1 ? colonParts.slice(1).join(':').trim() : '',
          technologies: [],
          achievements: [],
          role: '',
          current: false,
          startDate: '',
          endDate: '',
        };
      } else if (currentProject) {
        currentProject.description += ' ' + line;
        
        const techMatch = line.match(/(?:technologies|tech stack|built with|using|tools):\s*([^.•]+)/i);
        if (techMatch) {
          currentProject.technologies = techMatch[1].split(/[,;]/).map((t: string) => t.trim()).filter(Boolean);
        }
      }
    }

    if (currentProject && currentProject.name) {
      projects.push(currentProject);
    }

    return projects.slice(0, 15);
  }

  // ============================================
  // CERTIFICATIONS EXTRACTION - ADVANCED
  // ============================================

  private extractCertificationsAdvanced(text: string): any[] {
    const certs: any[] = [];
    if (!text.trim()) return certs;

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    for (const line of lines) {
      const clean = line.replace(/^[•\-*○]\s*/, '').trim();
      if (clean.length > 3) {
        let name = clean;
        let issuer = '';
        
        // Split by dash, comma, or pipe
        const separators = [' - ', ' – ', ' — ', ' | ', ', '];
        for (const sep of separators) {
          if (clean.includes(sep)) {
            const parts = clean.split(sep);
            name = parts[0].trim();
            issuer = parts.slice(1).join(sep).trim();
            break;
          }
        }

        certs.push({
          id: uuidv4(),
          name,
          issuer,
          date: '',
          inProgress: /in progress|ongoing|pursuing/i.test(clean),
        });
      }
    }

    return certs.slice(0, 15);
  }

  // ============================================
  // LANGUAGES EXTRACTION - ADVANCED
  // ============================================

  private extractLanguagesAdvanced(text: string): any[] {
    const languages: any[] = [];
    const languageNames = [
      'English', 'Spanish', 'French', 'German', 'Chinese', 'Mandarin', 'Cantonese',
      'Japanese', 'Korean', 'Arabic', 'Portuguese', 'Russian', 'Italian', 'Dutch',
      'Hindi', 'Urdu', 'Turkish', 'Vietnamese', 'Thai', 'Swahili', 'Kiswahili',
      'Bengali', 'Punjabi', 'Tamil', 'Telugu', 'Marathi', 'Gujarati',
    ];

    for (const lang of languageNames) {
      const pattern = new RegExp(`${lang}\\s*(?:\\(([^)]+)\\))?`, 'i');
      const match = text.match(pattern);
      if (match) {
        const proficiency = match[1] || 'Intermediate';
        languages.push({
          name: lang,
          proficiency: this.mapProficiency(proficiency),
        });
      }
    }

    return languages;
  }

  private mapProficiency(text: string): 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic' {
    const t = text.toLowerCase();
    if (t.includes('native') || t.includes('mother tongue')) return 'Native';
    if (t.includes('fluent') || t.includes('bilingual') || t.includes('c2')) return 'Fluent';
    if (t.includes('advanced') || t.includes('c1') || t.includes('proficient')) return 'Advanced';
    if (t.includes('basic') || t.includes('beginner') || t.includes('a1') || t.includes('a2')) return 'Basic';
    if (t.includes('intermediate') || t.includes('b1') || t.includes('b2')) return 'Intermediate';
    return 'Intermediate';
  }
}

export default ResumeParser;
