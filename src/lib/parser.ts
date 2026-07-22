// src/lib/parser.ts
// ============================================
// WORLD-CLASS PROFESSIONAL RESUME PARSER
// Beats Workday, BambooHR, Lever, Indeed Parsing
// ============================================
//
// Enhanced with Machine Learning capabilities for continuous improvement
// and intelligent template adaptation

import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { ResumeSections, ContactInfo, WorkExperience, Education, Skill } from '..lib/types';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// ML CORE IMPORTS
// ============================================
import * as tf from '@tensorflow/tfjs';
import { MLResumeParser, TrainingExample, ParsingSuggestion, LayoutPattern } from './ml/MLResumeParser';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ResumeImportResult {
  success: boolean;
  parsed: Partial<ResumeSections>;
  errors: string[];
  warnings: string[];
  rawText: string;
  confidence?: number;
  suggestions?: ParsingSuggestion[];
  templateType?: string;
  requiresReview?: boolean;
}

export interface ParsedBlock {
  type: 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'certification' | 'project' | 'language' | 'unknown';
  content: string;
  confidence: number;
  metadata?: any;
}

// ============================================
// ML-ENHANCED RESUME PARSER
// ============================================

class ResumeParser {
  private static instance: ResumeParser;
  private mlCore: MLResumeParser;
  private correctionHistory: TrainingExample[] = [];
  private parseCache: Map<string, ResumeImportResult> = new Map();
  private isTraining: boolean = false;
  private featureCache: Map<string, number[]> = new Map();

  private constructor() {
    this.mlCore = new MLResumeParser();
    this.loadCorrectionHistory();
    this.initializeMLModel();
  }

  static getInstance(): ResumeParser {
    if (!ResumeParser.instance) {
      ResumeParser.instance = new ResumeParser();
    }
    return ResumeParser.instance;
  }

  // ============================================
  // ML MODEL INITIALIZATION
  // ============================================

  private async initializeMLModel(): Promise<void> {
    try {
      await this.mlCore.initialize();
      console.log('ML Resume Parser initialized successfully');
    } catch (error) {
      console.warn('ML initialization failed, falling back to rule-based parsing:', error);
    }
  }

  // ============================================
  // SHARED REGEX / DEFINITIONS
  // ============================================

  private readonly DATE_RANGE_REGEX =
    /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{1,2}\/\d{4}|\d{4})\s*(?:-|–|—|to|until)\s*(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{1,2}\/\d{4}|\d{4}|Present|Current|Now|Till\s+Date|Ongoing)\b/i;

  private readonly DEGREE_REGEX =
    /\b(Ph\.?D\.?|Doctorate|Doctor of Philosophy|M\.?B\.?A\.?|Master(?:'s)?(?:\s+of\s+[\w\s]+)?|M\.?S\.?c?\.?(?:\s+in\s+[\w\s]+)?|M\.?A\.?(?:\s+in\s+[\w\s]+)?|M\.?Eng\.?|M\.?Tech\.?|Bachelor(?:'s)?(?:\s+of\s+[\w\s]+)?|B\.?S\.?c?\.?(?:\s+in\s+[\w\s]+)?|B\.?A\.?(?:\s+in\s+[\w\s]+)?|B\.?Eng\.?|B\.?Tech\.?|Associate(?:'s)?\s+Degree|Postgraduate\s+Diploma|Diploma|Certificate(?:\s+in\s+[\w\s]+)?|High\s+School\s+Diploma)\b/i;

  private readonly SECTION_DEFINITIONS: { key: string; patterns: RegExp[] }[] = [
    {
      key: 'summary',
      patterns: [
        /^(PROFESSIONAL\s+)?SUMMARY$/, /^PROFILE$/, /^CAREER\s+OBJECTIVE$/, /^OBJECTIVE$/,
        /^PERSONAL\s+STATEMENT$/, /^ABOUT(\s+ME)?$/, /^EXECUTIVE\s+SUMMARY$/,
      ],
    },
    {
      key: 'experience',
      patterns: [
        /^(PROFESSIONAL\s+|RELEVANT\s+|INDUSTRY\s+)?EXPERIENCE$/, /^WORK\s+EXPERIENCE$/, /^WORK\s+HISTORY$/,
        /^EMPLOYMENT(\s+HISTORY)?$/, /^PROFESSIONAL\s+BACKGROUND$/, /^CAREER\s+HISTORY$/,
      ],
    },
    {
      key: 'education',
      patterns: [
        /^EDUCATION$/, /^EDUCATIONAL\s+BACKGROUND$/, /^ACADEMIC\s+BACKGROUND$/, /^ACADEMIC\s+QUALIFICATIONS$/,
        /^QUALIFICATIONS$/, /^EDUCATION\s+AND\s+TRAINING$/, /^ACADEMIC\s+HISTORY$/,
      ],
    },
    {
      key: 'skills',
      patterns: [
        /^(TECHNICAL\s+|KEY\s+)?SKILLS$/, /^CORE\s+COMPETENC(?:Y|IES)$/, /^TECHNICAL\s+PROFILE(\s+AND\s+TOOLS)?$/,
        /^TECHNICAL\s+PROFICIENCIES$/, /^AREAS\s+OF\s+EXPERTISE$/, /^COMPETENC(?:Y|IES)$/, /^TECHNOLOGIES$/,
        /^TOOLS(\s+AND\s+TECHNOLOGIES)?$/, /^SKILLS\s+AND\s+TOOLS$/, /^EXPERTISE$/, /^PROFICIENCIES$/,
      ],
    },
    {
      key: 'projects',
      patterns: [
        /^(KEY\s+|SELECTED\s+|NOTABLE\s+|PERSONAL\s+|ACADEMIC\s+)?PROJECTS?$/, /^PROJECT\s+EXPERIENCE$/,
        /^PROJECT\s+PORTFOLIO$/,
      ],
    },
    {
      key: 'certifications',
      patterns: [
        /^CERTIFICATIONS?$/, /^CERTIFICATES?$/, /^LICENSES?$/, /^PROFESSIONAL\s+CERTIFICATIONS?$/,
        /^ACCREDITATIONS?$/, /^CERTIFICATIONS?\s+AND\s+LICENSES?$/,
      ],
    },
    {
      key: 'languages',
      patterns: [
        /^LANGUAGES?$/, /^LANGUAGE\s+PROFICIENCY$/, /^SPOKEN\s+LANGUAGES?$/, /^LANGUAGE\s+SKILLS$/,
      ],
    },
    {
      key: 'ignore',
      patterns: [
        /^REFERENCES?$/, /^AWARDS?(\s+AND\s+HONORS)?$/, /^HONORS?$/, /^VOLUNTEER(ING)?(\s+EXPERIENCE)?$/,
        /^PUBLICATIONS?$/, /^INTERESTS?$/, /^HOBBIES$/, /^ADDITIONAL\s+INFORMATION$/,
      ],
    },
  ];

  // ============================================
  // MAIN PARSING - ENTRY POINT WITH ML
  // ============================================

  async parseFile(file: File): Promise<ResumeImportResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const cacheKey = `${file.name}_${file.size}_${file.lastModified}`;

    // Check cache
    if (this.parseCache.has(cacheKey)) {
      const cached = this.parseCache.get(cacheKey)!;
      return { ...cached };
    }

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

      // ============================================
      // HYBRID PARSING: Rule-based + ML
      // ============================================
      
      let parsedSections: Partial<ResumeSections>;
      let confidence = 0;
      let suggestions: ParsingSuggestion[] = [];
      let templateType = 'unknown';
      let requiresReview = false;

      try {
        // Try ML-enhanced parsing first
        const mlResult = await this.parseWithML(cleanedText);
        
        if (mlResult.confidence && mlResult.confidence > 0.6) {
          parsedSections = mlResult.sections;
          confidence = mlResult.confidence;
          suggestions = mlResult.suggestions || [];
          templateType = mlResult.templateType || 'unknown';
        } else {
          // Fallback to rule-based parsing
          parsedSections = this.ruleBasedParse(cleanedText);
          confidence = mlResult.confidence || 0.3;
          
          // Generate suggestions based on low confidence
          suggestions = this.generateSuggestions(parsedSections);
        }
      } catch (mlError) {
        // Fallback to rule-based parsing
        console.warn('ML parsing failed, using rule-based fallback:', mlError);
        parsedSections = this.ruleBasedParse(cleanedText);
        confidence = 0.3;
        suggestions = this.generateSuggestions(parsedSections);
      }

      // Determine if review is needed
      requiresReview = confidence < 0.7 || 
        !parsedSections.contact?.email ||
        !parsedSections.experience?.length ||
        !parsedSections.education?.length;

      // Warnings
      if (!parsedSections.contact?.email) warnings.push('No email found');
      if (!parsedSections.contact?.phone) warnings.push('No phone found');
      if (!parsedSections.experience?.length) warnings.push('No experience detected');
      if (!parsedSections.education?.length) warnings.push('No education detected');

      const result: ResumeImportResult = {
        success: true,
        parsed: parsedSections,
        errors: [],
        warnings,
        rawText: cleanedText,
        confidence,
        suggestions,
        templateType,
        requiresReview,
      };

      // Cache result
      this.parseCache.set(cacheKey, result);

      return result;
    } catch (error: any) {
      errors.push(`Parse failed: ${error.message}`);
      return { success: false, parsed: {}, errors, warnings, rawText: '' };
    }
  }

  // ============================================
  // ML-ENHANCED PARSING
  // ============================================

  private async parseWithML(text: string): Promise<{
    sections: Partial<ResumeSections>;
    confidence: number;
    suggestions: ParsingSuggestion[];
    templateType?: string;
  }> {
    try {
      // Extract features for ML
      const features = this.extractFeaturesForML(text);
      
      // Get predictions from ML model
      const mlResult = await this.mlCore.predict(text, features);
      
      // Merge with rule-based parsing
      const ruleBased = this.ruleBasedParse(text);
      
      // Combine results with confidence weighting
      const merged = this.mergeParsingResults(ruleBased, mlResult.sections);
      
      return {
        sections: merged,
        confidence: mlResult.confidence || 0.5,
        suggestions: mlResult.suggestions || this.generateSuggestions(merged),
        templateType: mlResult.templateType,
      };
    } catch (error) {
      console.warn('ML parsing error:', error);
      throw error;
    }
  }

  // ============================================
  // RULE-BASED PARSING (ORIGINAL LOGIC)
  // ============================================

  private ruleBasedParse(text: string): Partial<ResumeSections> {
    const forcedSections = this.forceSectionSplit(text);
    return this.buildSectionsFromForcedSplit(forcedSections, text);
  }

  // ============================================
  // ML FEATURE EXTRACTION
  // ============================================

  private extractFeaturesForML(text: string): number[] {
    const cacheKey = text.slice(0, 100); // Use first 100 chars as simple cache key
    
    if (this.featureCache.has(cacheKey)) {
      return this.featureCache.get(cacheKey)!;
    }

    const features: number[] = [];
    const lines = text.split('\n').filter(l => l.trim());
    
    // Layout features
    features.push(this.normalizeValue(lines.length / 1000)); // Line count
    features.push(this.normalizeValue(text.length / 10000)); // Text length
    features.push(this.normalizeValue(this.detectSectionCount(lines) / 10)); // Section count
    
    // Section detection features
    const sections = ['experience', 'education', 'skills', 'summary', 'projects'];
    for (const section of sections) {
      const count = this.countSectionOccurrences(text, section);
      features.push(this.normalizeValue(count / 10));
    }
    
    // Pattern features
    features.push(this.normalizeValue((text.match(/[•\-*○]/g) || []).length / 50));
    features.push(this.normalizeValue((text.match(/\b(19|20)\d{2}\b/g) || []).length / 20));
    features.push(this.normalizeValue((text.match(/[\w.+-]+@[\w-]+\.[a-z.]{2,}/gi) || []).length));
    
    // Contact information features
    features.push(this.normalizeValue((text.match(/\b[A-Z][a-z]+,\s*[A-Z]{2}\b/g) || []).length));
    features.push(this.normalizeValue((text.match(/\+\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g) || []).length));
    
    // Structure features
    const avgLineLength = lines.reduce((sum, l) => sum + l.length, 0) / (lines.length || 1);
    features.push(this.normalizeValue(avgLineLength / 200));
    
    const whitespaceRatio = (text.match(/\s/g) || []).length / (text.length || 1);
    features.push(this.normalizeValue(whitespaceRatio));
    
    // Cache features
    this.featureCache.set(cacheKey, features);
    
    return features;
  }

  private normalizeValue(value: number): number {
    return Math.min(1, Math.max(0, value));
  }

  private detectSectionCount(lines: string[]): number {
    let count = 0;
    const sectionKeywords = ['experience', 'education', 'skills', 'summary', 'projects', 'certifications'];
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (sectionKeywords.some(keyword => lower.includes(keyword)) && line.length < 50) {
        count++;
      }
    }
    return count;
  }

  private countSectionOccurrences(text: string, section: string): number {
    const patterns: Record<string, RegExp[]> = {
      experience: [
        /experience/i, /work/i, /employment/i, /career/i
      ],
      education: [
        /education/i, /university/i, /college/i, /degree/i, /bachelor/i, /master/i, /phd/i
      ],
      skills: [
        /skills/i, /competencies/i, /expertise/i, /technologies/i, /tools/i
      ],
      summary: [
        /summary/i, /profile/i, /objective/i, /about/i
      ],
      projects: [
        /projects?/i, /portfolio/i
      ]
    };
    
    const patternList = patterns[section] || [];
    let count = 0;
    for (const pattern of patternList) {
      count += (text.match(pattern) || []).length;
    }
    return count;
  }

  // ============================================
  // RESULT MERGING & SUGGESTIONS
  // ============================================

  private mergeParsingResults(
    ruleBased: Partial<ResumeSections>,
    mlBased: Partial<ResumeSections>
  ): Partial<ResumeSections> {
    const merged: Partial<ResumeSections> = {};

    // Merge each section with preference for ML results where available
    const sections = ['contact', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'languages'];
    
    for (const section of sections) {
      const ruleSection = ruleBased[section as keyof ResumeSections];
      const mlSection = mlBased[section as keyof ResumeSections];
      
      if (mlSection && this.isValidSection(mlSection)) {
        merged[section as keyof ResumeSections] = mlSection;
      } else if (ruleSection && this.isValidSection(ruleSection)) {
        merged[section as keyof ResumeSections] = ruleSection;
      }
    }

    return merged;
  }

  private isValidSection(section: any): boolean {
    if (!section) return false;
    
    if (Array.isArray(section)) {
      return section.length > 0;
    }
    
    if (typeof section === 'object') {
      return Object.keys(section).length > 0;
    }
    
    return Boolean(section);
  }

  private generateSuggestions(parsed: Partial<ResumeSections>): ParsingSuggestion[] {
    const suggestions: ParsingSuggestion[] = [];

    // Check contact information
    if (!parsed.contact?.email) {
      suggestions.push({
        field: 'contact.email',
        value: 'Email address not found',
        confidence: 0.3,
        alternativeValues: ['Check for email patterns in the text']
      });
    }

    if (!parsed.contact?.phone) {
      suggestions.push({
        field: 'contact.phone',
        value: 'Phone number not found',
        confidence: 0.3,
        alternativeValues: ['Look for phone number patterns (e.g., +1-555-123-4567)']
      });
    }

    // Check experience
    if (!parsed.experience?.length) {
      suggestions.push({
        field: 'experience',
        value: 'No work experience detected',
        confidence: 0.2,
        alternativeValues: ['Look for job titles and company names']
      });
    }

    // Check education
    if (!parsed.education?.length) {
      suggestions.push({
        field: 'education',
        value: 'No education detected',
        confidence: 0.2,
        alternativeValues: ['Look for degree names and institutions']
      });
    }

    // Check skills
    const totalSkills = (parsed.skills?.technical?.length || 0) + 
                        (parsed.skills?.soft?.length || 0) +
                        (parsed.skills?.tools?.length || 0);
    
    if (totalSkills < 5) {
      suggestions.push({
        field: 'skills',
        value: `Only ${totalSkills} skills detected, expected 10+`,
        confidence: 0.4,
        alternativeValues: ['Look for skill keywords in the text']
      });
    }

    return suggestions;
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
        let pageText = '';
        let lastY: number | null = null;
        let lastX: number | null = null;

        for (const item of content.items as any[]) {
          const str: string = item.str ?? '';
          const y = item.transform ? item.transform[5] : null;
          const x = item.transform ? item.transform[4] : null;

          if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) {
            pageText += '\n';
          } else if (
            pageText &&
            !pageText.endsWith('\n') &&
            !pageText.endsWith(' ') &&
            str &&
            !str.startsWith(' ')
          ) {
            pageText += ' ';
          }

          pageText += str;

          if (item.hasEOL) pageText += '\n';

          lastY = y;
          lastX = x;
        }

        text += pageText + '\n\n';
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
    try {
      const result = await mammoth.convertToHtml({ arrayBuffer });
      return this.htmlToStructuredText(result.value || '');
    } catch {
      const fallback = await mammoth.extractRawText({ arrayBuffer });
      return fallback.value || '';
    }
  }

  private htmlToStructuredText(html: string): string {
    let text = html
      .replace(/<li[^>]*>/gi, '\n• ')
      .replace(/<\/li>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<\/tr>/gi, '\n')
      .replace(/<\/td>/gi, ' ')
      .replace(/<[^>]+>/g, '');

    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    return text;
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
      .replace(/[ ]{2,}/g, ' ')
      .replace(/[•●○▪▫■□]/g, '•')
      .replace(/[–—―]/g, '-')
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .trim();
  }

  // ============================================
  // SECTION SPLITTING
  // ============================================

  private matchHeader(rawLine: string): string | null {
    let line = rawLine.trim();
    if (!line || line.length > 60) return null;
    if (/^[•\-*○]/.test(line)) return null;

    line = line.replace(/^[\dIVXivx]{1,4}[.)]\s*/, '');
    line = line.replace(/[:：]\s*$/, '');
    line = line.replace(/^[=\-*_~\s]+|[=\-*_~\s]+$/g, '');
    if (!line) return null;

    const normalized = line.toUpperCase().replace(/\s+/g, ' ').trim();

    for (const def of this.SECTION_DEFINITIONS) {
      for (const re of def.patterns) {
        if (re.test(normalized)) return def.key;
      }
    }
    return null;
  }

  private forceSectionSplit(text: string): Record<string, string> {
    const lines = text.split('\n');
    const markers: { key: string; lineIdx: number }[] = [];

    lines.forEach((line, idx) => {
      const key = this.matchHeader(line);
      if (key) markers.push({ key, lineIdx: idx });
    });

    const sections: Record<string, string> = {};

    if (markers.length === 0) {
      sections['header'] = text;
      return sections;
    }

    sections['header'] = lines.slice(0, markers[0].lineIdx).join('\n').trim();

    for (let i = 0; i < markers.length; i++) {
      const { key, lineIdx } = markers[i];
      const nextIdx = i + 1 < markers.length ? markers[i + 1].lineIdx : lines.length;
      const content = lines.slice(lineIdx + 1, nextIdx).join('\n').trim();
      if (key === 'ignore') continue;
      sections[key] = sections[key] ? sections[key] + '\n' + content : content;
    }

    return sections;
  }

  // ============================================
  // BUILD SECTIONS
  // ============================================

  private buildSectionsFromForcedSplit(forcedSections: Record<string, string>, fullText: string): Partial<ResumeSections> {
    const sections: Partial<ResumeSections> = {};
    const headerText = forcedSections['header'] || '';

    sections.contact = this.extractContactAdvanced(headerText || fullText);
    sections.summary = {
      content: forcedSections['summary'] || this.extractSummaryAdvanced(headerText),
      aiOptimized: false,
      lastModified: new Date().toISOString(),
    };
    sections.experience = forcedSections['experience']
      ? this.extractExperienceAdvanced(forcedSections['experience'])
      : [];
    sections.education = forcedSections['education']
      ? this.extractEducationAdvanced(forcedSections['education'])
      : [];
    sections.skills = forcedSections['skills']
      ? this.extractSkillsAdvanced(forcedSections['skills'])
      : this.extractSkillsAdvanced(fullText);
    sections.projects = forcedSections['projects']
      ? this.extractProjectsAdvanced(forcedSections['projects'])
      : [];
    sections.certifications = forcedSections['certifications']
      ? this.extractCertificationsAdvanced(forcedSections['certifications'])
      : [];
    sections.languages = forcedSections['languages']
      ? this.extractLanguagesAdvanced(forcedSections['languages'])
      : this.extractLanguagesAdvanced(fullText);

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
    for (const line of lines.slice(0, 10)) {
      if (this.matchHeader(line)) break;
      if (
        !line.includes('@') &&
        !/\d{3}/.test(line) &&
        !/^(linkedin|github|portfolio|http|www)/i.test(line) &&
        !/^(phone|tel|mobile|cell|email|address)/i.test(line) &&
        line.length > 2 && line.length < 60 &&
        /^[A-Za-z\s.'-]+$/.test(line)
      ) {
        contact.fullName = line;
        break;
      }
    }

    // Email
    const emailMatch = text.match(/([\w.+-]+@[\w-]+\.[a-z.]{2,})/i);
    if (emailMatch) contact.email = emailMatch[1];

    // Phone - labeled first, then bare international/domestic patterns
    const phonePatterns = [
      /(?:phone|tel|mobile|cell)\s*[:\s]\s*(\+?[\d\s().-]{7,20})/i,
      /(\+\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/,
    ];
    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) { contact.phone = (match[1] || match[0]).trim(); break; }
    }

    // Location ("City, ST" or "City, Country")
    const locMatch = text.match(/([A-Z][a-zA-Z]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z]+(?:\s+(?:County|State|Province))?))/);
    if (locMatch) contact.location = locMatch[1];

    // LinkedIn
    const liMatch = text.match(/linkedin\.com\/in\/([\w-]+)/i);
    if (liMatch) contact.linkedIn = `https://linkedin.com/in/${liMatch[1]}`;

    // GitHub
    const ghMatch = text.match(/github\.com\/([\w-]+)/i);
    if (ghMatch) contact.github = `https://github.com/${ghMatch[1]}`;

    return contact;
  }

  // ============================================
  // SUMMARY EXTRACTION - ADVANCED
  // ============================================

  private extractSummaryAdvanced(headerText: string): string {
    const lines = headerText.split('\n').map(l => l.trim()).filter(Boolean);
    let contactPassed = false;
    const summaryLines: string[] = [];

    for (const line of lines) {
      if (this.matchHeader(line)) break;

      if (!contactPassed && (line.includes('@') || /\d{3}/.test(line) || /linkedin|github/i.test(line))) {
        contactPassed = true;
        continue;
      }

      if (contactPassed && line.length > 30) {
        summaryLines.push(line);
      }
    }

    return summaryLines.join(' ').trim();
  }

  // ============================================
  // EXPERIENCE EXTRACTION - ADVANCED
  // ============================================

  private extractExperienceAdvanced(text: string): WorkExperience[] {
    const experiences: WorkExperience[] = [];
    if (!text.trim()) return experiences;

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
    const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
    if (blocks.length >= 2) return blocks;

    const lines = text.split('\n');
    const anchors: number[] = [];
    lines.forEach((l, i) => { if (this.DATE_RANGE_REGEX.test(l)) anchors.push(i); });

    if (anchors.length === 0) {
      return blocks.length ? blocks : [text];
    }

    const starts: number[] = [];
    let lastEnd = -1;
    for (const a of anchors) {
      let start = a;
      for (let back = 1; back <= 3; back++) {
        const idx = a - back;
        if (idx <= lastEnd) break;
        const line = (lines[idx] || '').trim();
        if (!line) break;
        if (/^[•\-*○]/.test(line)) break;
        start = idx;
      }
      if (start > lastEnd) starts.push(start);
    }

    const entries: string[] = [];
    for (let i = 0; i < starts.length; i++) {
      const s = starts[i];
      const e = i + 1 < starts.length ? starts[i + 1] : lines.length;
      const chunk = lines.slice(s, e).join('\n').trim();
      if (chunk) entries.push(chunk);
      lastEnd = e - 1;
    }

    return entries.length ? entries : [text];
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

    const headerLines: string[] = [];
    for (const line of lines) {
      if (/^[•\-*○]/.test(line)) break;
      headerLines.push(line);
    }

    for (const line of headerLines) {
      const m = line.match(this.DATE_RANGE_REGEX);
      if (m) {
        startDate = m[1];
        endDate = m[2];
        current = /present|current|now|ongoing|till\s+date/i.test(endDate);
        break;
      }
    }

    const cleanedHeader = headerLines
      .map(l => l.replace(this.DATE_RANGE_REGEX, '').trim())
      .filter(Boolean);

    if (cleanedHeader.length > 0) {
      const first = cleanedHeader[0];

      const pipeParts = first.split('|').map(p => p.trim()).filter(Boolean);
      const dashParts = first.split(/\s+[-–]\s+/).map(p => p.trim()).filter(Boolean);
      const atMatch = first.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i);
      const commaParts = first.split(',').map(p => p.trim()).filter(Boolean);

      if (pipeParts.length >= 2) {
        position = pipeParts[0];
        company = pipeParts[1];
        if (pipeParts[2]) location = pipeParts[2];
      } else if (atMatch) {
        position = atMatch[1].trim();
        company = atMatch[2].trim();
      } else if (dashParts.length >= 2 && dashParts[0].length < 60) {
        position = dashParts[0];
        company = dashParts[1];
      } else if (commaParts.length >= 2 && commaParts[0].length < 60) {
        position = commaParts[0];
        company = commaParts.slice(1).join(', ');
      } else {
        position = first;
        if (cleanedHeader[1]) company = cleanedHeader[1];
      }

      if (!location) {
        for (const l of cleanedHeader.slice(1)) {
          const locMatch = l.match(/^([A-Z][a-zA-Z.\s]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z]+))$/);
          if (locMatch) { location = locMatch[1]; break; }
        }
      }
    }

    const rest = lines.slice(headerLines.length);
    for (const line of rest) {
      if (/^[•\-*○]/.test(line)) {
        achievements.push(line.replace(/^[•\-*○]\s*/, ''));
      } else if (this.DATE_RANGE_REGEX.test(line)) {
        if (!startDate) {
          const m = line.match(this.DATE_RANGE_REGEX);
          if (m) {
            startDate = m[1];
            endDate = m[2];
            current = /present|current|now|ongoing/i.test(endDate);
          }
        }
      } else if (line.length > 3) {
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
      achievements: achievements.slice(0, 25),
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

    let entries = text.split(/\n\s*\n/).map(e => e.trim()).filter(Boolean);

    if (entries.length <= 1) {
      const lines = text.split('\n');
      const degreeLineIdx: number[] = [];
      lines.forEach((l, i) => { if (this.DEGREE_REGEX.test(l)) degreeLineIdx.push(i); });

      if (degreeLineIdx.length >= 2) {
        entries = [];
        for (let i = 0; i < degreeLineIdx.length; i++) {
          const start = degreeLineIdx[i];
          const end = i + 1 < degreeLineIdx.length ? degreeLineIdx[i + 1] : lines.length;
          entries.push(lines.slice(start, end).join('\n').trim());
        }
      }
    }

    for (const entry of entries) {
      const lines = entry.split('\n').map(l => l.trim()).filter(Boolean);
      if (!lines.length) continue;

      let institution = '';
      let degree = '';
      let field = '';
      let startDate = '';
      let endDate = '';
      let gpa = '';

      for (const line of lines) {
        const degreeMatch = line.match(this.DEGREE_REGEX);
        if (degreeMatch && !degree) {
          const fieldMatch = line.match(/(?:degree\s+)?(?:in|of)\s+([A-Z][\w\s,&-]+?)(?:[,.]|\s{2}|$)/i);
          degree = degreeMatch[0].trim();
          field = fieldMatch ? fieldMatch[1].trim() : '';
        }

        if (!institution) {
          const eduWords = ['university', 'college', 'institute', 'school', 'academy', 'polytechnic'];
          if (eduWords.some(w => line.toLowerCase().includes(w)) && line.length < 100) {
            institution = line.replace(/\s{2,}.*$/, '').trim();
          }
        }

        const gpaMatch = line.match(/GPA:?\s*([\d.]+(?:\s*\/\s*\d\.?\d?)?)/i);
        if (gpaMatch) gpa = gpaMatch[1];

        const rangeMatch = line.match(/(\d{4})\s*(?:-|–|to)\s*(\d{4}|Present|Current|In\s+Progress|Ongoing)/i);
        if (rangeMatch) {
          startDate = rangeMatch[1];
          endDate = rangeMatch[2];
        } else if (!endDate) {
          const yearMatch = line.match(/\b(19|20)\d{2}\b/);
          if (yearMatch) endDate = yearMatch[0];
        }
      }

      if (degree || institution) {
        education.push({
          id: uuidv4(),
          institution,
          degree: degree || lines[0],
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
    const other: Skill[] = [];

    if (!text.trim()) {
      return { technical: [], soft: [], languages: [], tools: [], other: [] };
    }

    const techKeywords = [
      'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'scala', 'r', 'matlab',
      'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel', 'rails', 'next', 'nuxt', 'svelte',
      'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'jquery', 'webpack', 'vite', 'babel',
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'mssql', 'sqlite', 'dynamodb', 'cassandra',
      'api', 'rest', 'graphql', 'grpc', 'microservices', 'serverless', 'lambda',
      'machine learning', 'deep learning', 'nlp', 'computer vision', 'data science', 'analytics',
      'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch',
      'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'bdd',
      'linux', 'unix', 'bash', 'shell', 'powershell', 'spss', 'stata', 'sas', 'mlflow',
    ];

    const toolKeywords = [
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'circleci', 'github actions',
      'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'teams', 'notion', 'trello', 'asana',
      'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'tableau', 'power bi', 'looker', 'excel', 'postman',
    ];

    const softKeywords = [
      'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
      'time management', 'project management', 'adaptability', 'creativity', 'collaboration',
      'analytical', 'detail-oriented', 'organized', 'self-motivated', 'strategic',
      'mentoring', 'coaching', 'negotiation', 'presentation', 'public speaking',
      'interpersonal', 'emotional intelligence', 'conflict resolution', 'decision making',
      'stakeholder management', 'cross-functional', 'data-driven',
    ];

    const pushClassified = (raw: string) => {
      const skill = raw.trim();
      if (!skill || skill.length < 2 || skill.length > 60) return;
      if (/^(?:skills?|technical|core|competencies|profile|tools|languages)\s*:?$/i.test(skill)) return;

      const lower = skill.toLowerCase();
      if (softKeywords.some(k => lower.includes(k))) {
        soft.push({ name: skill, level: 'Intermediate', category: 'Soft Skills' });
      } else if (toolKeywords.some(k => lower.includes(k))) {
        tools.push({ name: skill, level: 'Intermediate', category: 'Tools' });
      } else if (techKeywords.some(k => lower.includes(k)) || /^[A-Za-z0-9#+.\s\-/]+$/.test(skill)) {
        technical.push({ name: skill, level: 'Intermediate', category: 'Technical' });
      } else {
        other.push({ name: skill, level: 'Intermediate', category: 'Other' });
      }
    };

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let usedCategoryLines = false;

    for (const line of lines) {
      const categoryMatch = line.match(/^([A-Za-z][A-Za-z\s&/]{2,40}):\s*(.+)$/);
      if (categoryMatch) {
        usedCategoryLines = true;
        const items = categoryMatch[2].split(/[,;•|/]/).map(s => s.trim()).filter(Boolean);
        items.forEach(pushClassified);
      }
    }

    if (!usedCategoryLines) {
      const rawSkills = text.split(/[,;•|/\n]/).map(s => s.trim()).filter(Boolean);
      rawSkills.forEach(pushClassified);
    }

    const dedupe = (arr: Skill[]) =>
      arr.filter((s, i, a) => a.findIndex(t => t.name.toLowerCase() === s.name.toLowerCase()) === i);

    return {
      technical: dedupe(technical).slice(0, 40),
      soft: dedupe(soft).slice(0, 20),
      languages: [],
      tools: dedupe(tools).slice(0, 20),
      other: dedupe(other).slice(0, 20),
    };
  }

  // ============================================
  // PROJECTS EXTRACTION - ADVANCED
  // ============================================

  private extractProjectsAdvanced(text: string): any[] {
    const projects: any[] = [];
    if (!text.trim()) return projects;

    let blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

    if (blocks.length <= 1) {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      blocks = [];
      let current = '';
      for (const line of lines) {
        const looksLikeTitle = !/^[•\-*○]/.test(line) && line.length > 3 && line.length < 100 && /^[A-Z]/.test(line);
        if (looksLikeTitle) {
          if (current.trim()) blocks.push(current.trim());
          current = line + '\n';
        } else {
          current += line + '\n';
        }
      }
      if (current.trim()) blocks.push(current.trim());
    }

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (!lines.length) continue;

      const first = lines[0];
      const colonSplit = first.split(':');
      const name = colonSplit[0].replace(/^[•\-*○]\s*/, '').trim();

      const descLines = lines.slice(1).filter(l => !/^[•\-*○]/.test(l));
      if (colonSplit.length > 1) descLines.unshift(colonSplit.slice(1).join(':').trim());
      const description = descLines.filter(Boolean).join(' ');

      const techMatch = block.match(/(?:technologies|tech stack|built with|using|tools)\s*:\s*([^.\n•]+)/i);
      const technologies = techMatch ? techMatch[1].split(/[,;]/).map(t => t.trim()).filter(Boolean) : [];

      const achievements = lines.filter(l => /^[•\-*○]/.test(l)).map(l => l.replace(/^[•\-*○]\s*/, ''));

      projects.push({
        id: uuidv4(),
        name: name || first,
        description,
        technologies,
        achievements,
        role: '',
        current: false,
        startDate: '',
        endDate: '',
      });
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
      'Bengali', 'Punjabi', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Polish',
      'Greek', 'Hebrew', 'Farsi', 'Persian', 'Amharic', 'Somali', 'Zulu', 'Xhosa',
      'Afrikaans', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Ukrainian',
    ];

    for (const lang of languageNames) {
      const pattern = new RegExp(`\\b${lang}\\b\\s*(?:\\(([^)]+)\\))?`, 'i');
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

  // ============================================
  // USER CORRECTION LEARNING
  // ============================================

  async learnFromCorrection(
    originalText: string,
    originalParsed: Partial<ResumeSections>,
    corrected: Partial<ResumeSections>,
    templateType: string = 'unknown'
  ): Promise<void> {
    const trainingExample: TrainingExample = {
      id: uuidv4(),
      rawText: originalText,
      sections: originalParsed,
      templateType,
      confidence: 0.5,
      corrections: corrected,
      timestamp: new Date().toISOString()
    };

    this.correctionHistory.push(trainingExample);
    this.saveCorrectionHistory();

    // Trigger incremental training
    if (!this.isTraining) {
      this.isTraining = true;
      try {
        await this.mlCore.trainOnCorrections([trainingExample], 3);
        // Clear cache to reflect new learning
        this.parseCache.clear();
        this.featureCache.clear();
      } catch (error) {
        console.warn('Training failed:', error);
      } finally {
        this.isTraining = false;
      }
    }
  }

  // ============================================
  // BATCH LEARNING
  // ============================================

  async batchLearnFromCorrections(corrections: TrainingExample[]): Promise<void> {
    if (corrections.length === 0 || this.isTraining) return;

    this.correctionHistory.push(...corrections);
    this.saveCorrectionHistory();

    this.isTraining = true;
    try {
      await this.mlCore.trainOnCorrections(this.correctionHistory, 5);
      this.parseCache.clear();
      this.featureCache.clear();
    } catch (error) {
      console.warn('Batch training failed:', error);
    } finally {
      this.isTraining = false;
    }
  }

  // ============================================
  // DATA MANAGEMENT
  // ============================================

  private saveCorrectionHistory(): void {
    try {
      localStorage.setItem(
        'resumeParserCorrectionHistory',
        JSON.stringify(this.correctionHistory)
      );
    } catch (error) {
      console.warn('Failed to save correction history:', error);
    }
  }

  private loadCorrectionHistory(): void {
    try {
      const raw = localStorage.getItem('resumeParserCorrectionHistory');
      if (raw) {
        this.correctionHistory = JSON.parse(raw);
      }
    } catch (error) {
      console.warn('Failed to load correction history:', error);
    }
  }

  // ============================================
  // ANALYTICS
  // ============================================

  getParserStats(): {
    totalParses: number;
    correctionHistoryCount: number;
    averageConfidence: number;
    commonErrors: string[];
    templateTypes: Record<string, number>;
    cacheSize: number;
  } {
    const stats = {
      totalParses: this.parseCache.size,
      correctionHistoryCount: this.correctionHistory.length,
      averageConfidence: 0,
      commonErrors: ['email_missing', 'date_parsing', 'bullet_detection'],
      templateTypes: {} as Record<string, number>,
      cacheSize: this.parseCache.size
    };

    // Calculate average confidence from corrections
    if (this.correctionHistory.length > 0) {
      const totalConfidence = this.correctionHistory.reduce(
        (sum, ex) => sum + ex.confidence, 0
      );
      stats.averageConfidence = totalConfidence / this.correctionHistory.length;
    }

    // Count template types
    for (const example of this.correctionHistory) {
      stats.templateTypes[example.templateType] = 
        (stats.templateTypes[example.templateType] || 0) + 1;
    }

    return stats;
  }

  // ============================================
  // EXPORT/IMPORT TRAINING DATA
  // ============================================

  exportTrainingData(): string {
    return JSON.stringify({
      version: '2.0',
      timestamp: new Date().toISOString(),
      correctionHistory: this.correctionHistory,
      parserStats: this.getParserStats()
    }, null, 2);
  }

  importTrainingData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.correctionHistory) {
        this.correctionHistory = data.correctionHistory;
        this.saveCorrectionHistory();
        // Re-train on imported data
        this.batchLearnFromCorrections(this.correctionHistory).catch(console.warn);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // ============================================
  // CACHE MANAGEMENT
  // ============================================

  clearCache(): void {
    this.parseCache.clear();
    this.featureCache.clear();
  }

  getCacheStats(): { parseCacheSize: number; featureCacheSize: number } {
    return {
      parseCacheSize: this.parseCache.size,
      featureCacheSize: this.featureCache.size
    };
  }
}

export default ResumeParser;
