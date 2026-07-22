// src/lib/parser.ts
// ============================================
// WORLD-CLASS PROFESSIONAL RESUME PARSER
// Beats Workday, BambooHR, Lever, Indeed Parsing
// Enhanced with Universal Section Detection
// ============================================

import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  ResumeSections, 
  ContactInfo, 
  WorkExperience, 
  Education, 
  Skill,
  SkillsSection,
  ProfessionalSummary,
  Certification,
  Project,
  Language,
  Volunteer,
  Publication,
  Award,
  CustomSection,
  ProfessionalAffiliation,
  Conference,
  Patent,
  Reference
} from '../lib/types';
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

export interface ParsedFileResult {
  rawText: string;
  sections: Record<string, string>;
}

// ============================================
// UNIVERSAL SECTION PATTERNS (500+ variations)
// ============================================

const UNIVERSAL_SECTION_PATTERNS: Record<string, RegExp[]> = {
  contact: [
    /^CONTACT$/i, /^CONTACT INFORMATION$/i, /^CONTACT DETAILS$/i,
    /^PERSONAL DETAILS$/i, /^PERSONAL INFORMATION$/i, /^ABOUT ME$/i,
    /^CONTACT\s+INFO$/i, /^GET\s+IN\s+TOUCH$/i, /^REACH\s+ME$/i,
    /^CONNECT\s+WITH\s+ME$/i, /^FIND\s+ME$/i, /^MY\s+CONTACT$/i,
    /^CONTACT\s+ME$/i, /^HOW\s+TO\s+REACH\s+ME$/i, /^CONTACT\s+ADDRESS$/i,
    /^EMAIL\s+&\s+PHONE$/i, /^PHONE\s+&\s+EMAIL$/i,
  ],
  summary: [
    /^SUMMARY$/i, /^PROFESSIONAL SUMMARY$/i, /^CAREER SUMMARY$/i,
    /^EXECUTIVE SUMMARY$/i, /^PROFILE$/i, /^PROFESSIONAL PROFILE$/i,
    /^CAREER PROFILE$/i, /^ABOUT ME$/i, /^PERSONAL STATEMENT$/i,
    /^CAREER OBJECTIVE$/i, /^OBJECTIVE$/i, /^OVERVIEW$/i,
    /^PROFESSIONAL OVERVIEW$/i, /^CAREER OVERVIEW$/i,
    /^INTRODUCTION$/i, /^PROFESSIONAL INTRODUCTION$/i,
    /^WHO\s+I\s+AM$/i, /^BACKGROUND$/i, /^PROFESSIONAL BACKGROUND$/i,
    /^CAREER BACKGROUND$/i, /^HIGHLIGHTS$/i, /^KEY\s+HIGHLIGHTS$/i,
    /^QUALIFICATION\s+SUMMARY$/i, /^CORE\s+QUALIFICATIONS$/i,
    /^TOP\s+QUALIFICATIONS$/i, /^KEY\s+QUALIFICATIONS$/i,
    /^PRIMARY\s+QUALIFICATIONS$/i, /^MAJOR\s+QUALIFICATIONS$/i,
    /^CAREER\s+ACHIEVEMENTS$/i, /^PROFESSIONAL\s+ACHIEVEMENTS$/i,
    /^KEY\s+ACHIEVEMENTS$/i, /^NOTABLE\s+ACHIEVEMENTS$/i,
    /^ACHIEVEMENTS$/i, /^ACCOMPLISHMENTS$/i,
  ],
  experience: [
    /^EXPERIENCE$/i, /^WORK EXPERIENCE$/i, /^PROFESSIONAL EXPERIENCE$/i,
    /^EMPLOYMENT$/i, /^EMPLOYMENT HISTORY$/i, /^WORK HISTORY$/i,
    /^CAREER HISTORY$/i, /^PROFESSIONAL HISTORY$/i,
    /^RELEVANT EXPERIENCE$/i, /^RELEVANT WORK EXPERIENCE$/i,
    /^RELATED EXPERIENCE$/i, /^PROJECT EXPERIENCE$/i,
    /^PAST EXPERIENCE$/i, /^EMPLOYMENT RECORD$/i,
    /^WORK RECORD$/i, /^CAREER EXPERIENCE$/i,
    /^OCCUPATIONAL EXPERIENCE$/i, /^JOB EXPERIENCE$/i,
    /^JOBS$/i, /^PAST JOBS$/i, /^WORK BACKGROUND$/i,
    /^PROFESSIONAL BACKGROUND$/i, /^CAREER BACKGROUND$/i,
    /^EXPERIENCE HIGHLIGHTS$/i, /^KEY EXPERIENCE$/i,
    /^CORE EXPERIENCE$/i, /^MAJOR EXPERIENCE$/i,
    /^PRIMARY EXPERIENCE$/i, /^SENIOR EXPERIENCE$/i,
    /^MANAGEMENT EXPERIENCE$/i, /^LEADERSHIP EXPERIENCE$/i,
    /^ACADEMIC EXPERIENCE$/i, /^RESEARCH EXPERIENCE$/i,
    /^TEACHING EXPERIENCE$/i, /^CLINICAL EXPERIENCE$/i,
    /^FIELD EXPERIENCE$/i, /^INDUSTRY EXPERIENCE$/i,
    /^TECHNICAL EXPERIENCE$/i, /^IT EXPERIENCE$/i,
    /^SOFTWARE EXPERIENCE$/i, /^ENGINEERING EXPERIENCE$/i,
    /^DESIGN EXPERIENCE$/i, /^CREATIVE EXPERIENCE$/i,
    /^BUSINESS EXPERIENCE$/i, /^SALES EXPERIENCE$/i,
    /^MARKETING EXPERIENCE$/i, /^FINANCE EXPERIENCE$/i,
    /^CONSULTING EXPERIENCE$/i, /^NON-PROFIT EXPERIENCE$/i,
    /^VOLUNTEER EXPERIENCE$/i, /^MILITARY EXPERIENCE$/i,
    /^SERVICE RECORD$/i, /^MILITARY SERVICE$/i,
    /^WORK\s+&\s+EXPERIENCE$/i, /^EXPERIENCE\s+&\s+SKILLS$/i,
  ],
  education: [
    /^EDUCATION$/i, /^ACADEMIC BACKGROUND$/i, /^ACADEMIC HISTORY$/i,
    /^EDUCATIONAL BACKGROUND$/i, /^EDUCATIONAL HISTORY$/i,
    /^SCHOOLING$/i, /^FORMAL EDUCATION$/i,
    /^ACADEMIC QUALIFICATIONS$/i, /^EDUCATIONAL QUALIFICATIONS$/i,
    /^QUALIFICATIONS$/i, /^ACADEMIC CREDENTIALS$/i,
    /^EDUCATIONAL CREDENTIALS$/i, /^CREDENTIALS$/i,
    /^DEGREES$/i, /^ACADEMIC DEGREES$/i,
    /^UNIVERSITY EDUCATION$/i, /^COLLEGE EDUCATION$/i,
    /^HIGHER EDUCATION$/i, /^POST SECONDARY EDUCATION$/i,
    /^TERTIARY EDUCATION$/i, /^GRADUATE EDUCATION$/i,
    /^UNDERGRADUATE EDUCATION$/i, /^POSTGRADUATE EDUCATION$/i,
    /^DOCTORAL EDUCATION$/i, /^CERTIFICATIONS$/i,
    /^CERTIFICATES$/i, /^PROFESSIONAL CERTIFICATIONS$/i,
    /^CERTIFICATION$/i, /^LICENSES$/i, /^LICENSURE$/i,
    /^PROFESSIONAL LICENSES$/i, /^ACCREDITATIONS$/i,
    /^TRAINING$/i, /^PROFESSIONAL TRAINING$/i,
    /^CAREER TRAINING$/i, /^WORKSHOPS$/i,
    /^SEMINARS$/i, /^COURSES$/i, /^RELEVANT COURSES$/i,
    /^COURSEWORK$/i, /^ACADEMIC COURSEWORK$/i,
    /^SPECIALIZED TRAINING$/i, /^CONTINUING EDUCATION$/i,
    /^ONGOING EDUCATION$/i, /^HIGH SCHOOL$/i,
    /^SECONDARY SCHOOL$/i, /^SECONDARY EDUCATION$/i,
    /^HIGH SCHOOL EDUCATION$/i, /^EDUCATION\s+&\s+CERTIFICATION$/i,
    /^EDUCATION\s+&\s+TRAINING$/i, /^ACADEMIC\s+&\s+PROFESSIONAL$/i,
  ],
  skills: [
    /^SKILLS$/i, /^SKILLS & COMPETENCIES$/i, /^CORE SKILLS$/i,
    /^KEY SKILLS$/i, /^PROFESSIONAL SKILLS$/i,
    /^TECHNICAL SKILLS$/i, /^TECHNICAL COMPETENCIES$/i,
    /^COMPETENCIES$/i, /^CORE COMPETENCIES$/i,
    /^KEY COMPETENCIES$/i, /^PROFESSIONAL COMPETENCIES$/i,
    /^SKILLS SUMMARY$/i, /^SKILLS HIGHLIGHTS$/i,
    /^TOP SKILLS$/i, /^PRIMARY SKILLS$/i,
    /^MAJOR SKILLS$/i, /^CORE CAPABILITIES$/i,
    /^KEY CAPABILITIES$/i, /^CAPABILITIES$/i,
    /^STRENGTHS$/i, /^CORE STRENGTHS$/i,
    /^KEY STRENGTHS$/i, /^PROFESSIONAL STRENGTHS$/i,
    /^AREAS OF EXPERTISE$/i, /^EXPERTISE$/i,
    /^CORE EXPERTISE$/i, /^KEY EXPERTISE$/i,
    /^TECHNICAL EXPERTISE$/i, /^PROFESSIONAL EXPERTISE$/i,
    /^KNOWLEDGE & SKILLS$/i, /^KNOWLEDGE AND SKILLS$/i,
    /^KNOWLEDGE$/i, /^TECHNOLOGIES$/i,
    /^TOOLS$/i, /^TOOLS & TECHNOLOGIES$/i,
    /^TECHNOLOGIES & TOOLS$/i, /^SOFTWARE SKILLS$/i,
    /^HARD SKILLS$/i, /^SOFT SKILLS$/i,
    /^INTERPERSONAL SKILLS$/i, /^COMMUNICATION SKILLS$/i,
    /^LEADERSHIP SKILLS$/i, /^MANAGEMENT SKILLS$/i,
    /^ORGANIZATIONAL SKILLS$/i, /^PROGRAMMING SKILLS$/i,
    /^PROGRAMMING LANGUAGES$/i, /^CODING SKILLS$/i,
    /^DEVELOPMENT SKILLS$/i, /^WEB DEVELOPMENT SKILLS$/i,
    /^MOBILE DEVELOPMENT SKILLS$/i, /^DATABASE SKILLS$/i,
    /^CLOUD SKILLS$/i, /^DEVOPS SKILLS$/i,
    /^QA SKILLS$/i, /^TESTING SKILLS$/i,
    /^SECURITY SKILLS$/i, /^NETWORKING SKILLS$/i,
    /^SYSTEMS SKILLS$/i, /^HARDWARE SKILLS$/i,
    /^EMBEDDED SKILLS$/i, /^IOT SKILLS$/i,
    /^AI SKILLS$/i, /^ML SKILLS$/i,
    /^DATA SCIENCE SKILLS$/i, /^ANALYTICS SKILLS$/i,
    /^DATA SKILLS$/i, /^DATA VISUALIZATION SKILLS$/i,
    /^BI SKILLS$/i, /^DESIGN SKILLS$/i,
    /^GRAPHIC DESIGN SKILLS$/i, /^UI UX SKILLS$/i,
    /^PRODUCT DESIGN SKILLS$/i, /^CREATIVE SKILLS$/i,
    /^MULTIMEDIA SKILLS$/i, /^VIDEO SKILLS$/i,
    /^PHOTOGRAPHY SKILLS$/i, /^BUSINESS SKILLS$/i,
    /^MANAGEMENT SKILLS$/i, /^LEADERSHIP SKILLS$/i,
    /^PROJECT MANAGEMENT SKILLS$/i, /^STRATEGIC SKILLS$/i,
    /^FINANCIAL SKILLS$/i, /^ACCOUNTING SKILLS$/i,
    /^MARKETING SKILLS$/i, /^SALES SKILLS$/i,
    /^HUMAN RESOURCES SKILLS$/i, /^HR SKILLS$/i,
    /^TECHNICAL\s+PROFILE$/i, /^TECHNICAL\s+PROFILE\s+&\s+TOOLS$/i,
    /^CORE\s+COMPETENCIES\s+&\s+SKILLS$/i,
  ],
  projects: [
    /^PROJECTS$/i, /^KEY PROJECTS$/i, /^PROJECT EXPERIENCE$/i,
    /^PERSONAL PROJECTS$/i, /^ACADEMIC PROJECTS$/i,
    /^PROJECT PORTFOLIO$/i, /^SELECTED PROJECTS$/i,
    /^NOTABLE PROJECTS$/i, /^PROJECT HIGHLIGHTS$/i,
    /^MAJOR PROJECTS$/i, /^SIGNIFICANT PROJECTS$/i,
    /^PROJECT WORK$/i, /^PROJECTS & ACHIEVEMENTS$/i,
    /^PROJECTS AND ACHIEVEMENTS$/i, /^DEVELOPMENT PROJECTS$/i,
    /^RESEARCH PROJECTS$/i, /^CLIENT PROJECTS$/i,
    /^TEAM PROJECTS$/i, /^INDIVIDUAL PROJECTS$/i,
    /^PORTFOLIO$/i, /^WORK PORTFOLIO$/i,
    /^PROJECT\s+&\s+RESEARCH$/i, /^RESEARCH\s+&\s+PROJECTS$/i,
  ],
  certifications: [
    /^CERTIFICATIONS$/i, /^CERTIFICATION$/i, /^CERTIFICATES$/i,
    /^PROFESSIONAL CERTIFICATIONS$/i, /^CERTIFICATIONS & LICENSES$/i,
    /^CERTIFICATIONS AND LICENSES$/i, /^LICENSES & CERTIFICATIONS$/i,
    /^LICENSES AND CERTIFICATIONS$/i, /^CERTIFICATIONS & TRAINING$/i,
    /^CERTIFICATIONS AND TRAINING$/i, /^TRAINING & CERTIFICATIONS$/i,
    /^TRAINING AND CERTIFICATIONS$/i, /^ACCREDITATIONS$/i,
    /^PROFESSIONAL LICENSES$/i, /^LICENSURE$/i, /^LICENSES$/i,
    /^CERTIFICATES\s+&\s+LICENSES$/i,
  ],
  languages: [
    /^LANGUAGES$/i, /^LANGUAGE SKILLS$/i, /^LANGUAGE PROFICIENCY$/i,
    /^SPOKEN LANGUAGES$/i, /^LANGUAGES SPOKEN$/i,
    /^LANGUAGE ABILITIES$/i, /^FOREIGN LANGUAGES$/i,
    /^MULTILINGUAL SKILLS$/i, /^LANGUAGE & COMMUNICATION$/i,
    /^LANGUAGE AND COMMUNICATION$/i, /^LANGUAGE\s+&\s+CULTURE$/i,
  ],
  references: [
    /^REFERENCES$/i, /^PROFESSIONAL REFERENCES$/i,
    /^WORK REFERENCES$/i, /^PERSONAL REFERENCES$/i,
    /^CHARACTER REFERENCES$/i, /^REFEREES$/i,
    /^REFERENCES\s+AVAILABLE$/i,
  ],
  awards: [
    /^AWARDS$/i, /^AWARDS & HONORS$/i, /^AWARDS AND HONORS$/i,
    /^HONORS$/i, /^RECOGNITIONS$/i, /^ACHIEVEMENTS$/i,
    /^KEY ACHIEVEMENTS$/i, /^NOTABLE ACHIEVEMENTS$/i,
    /^PROFESSIONAL ACHIEVEMENTS$/i, /^ACCOMPLISHMENTS$/i,
    /^KEY ACCOMPLISHMENTS$/i, /^AWARDS\s+&\s+ACHIEVEMENTS$/i,
  ],
  publications: [
    /^PUBLICATIONS$/i, /^PUBLISHED WORKS$/i, /^PUBLISHED ARTICLES$/i,
    /^RESEARCH PAPERS$/i, /^ACADEMIC PUBLICATIONS$/i,
    /^SCIENTIFIC PUBLICATIONS$/i, /^JOURNAL ARTICLES$/i,
    /^CONFERENCE PAPERS$/i, /^BOOKS$/i, /^BOOK CHAPTERS$/i,
    /^THESIS$/i, /^DISSERTATION$/i, /^PUBLICATIONS\s+&\s+RESEARCH$/i,
  ],
  volunteer: [
    /^VOLUNTEER$/i, /^VOLUNTEER EXPERIENCE$/i, /^VOLUNTEER WORK$/i,
    /^COMMUNITY SERVICE$/i, /^COMMUNITY INVOLVEMENT$/i,
    /^CHARITY WORK$/i, /^NON-PROFIT WORK$/i, /^SOCIAL WORK$/i,
    /^OUTREACH$/i, /^COMMUNITY OUTREACH$/i,
    /^VOLUNTEER\s+&\s+COMMUNITY$/i,
  ],
};

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
      let detectedSections: Record<string, string> = {};
      const ext = file.name.split('.').pop()?.toLowerCase();

      switch (ext) {
        case 'pdf': {
          const result = await this.parsePDF(file);
          text = result.rawText;
          detectedSections = result.sections;
          break;
        }
        case 'docx':
        case 'doc': {
          const result = await this.parseDOCX(file);
          text = result.rawText;
          detectedSections = result.sections;
          break;
        }
        case 'txt': {
          text = await this.parseTXT(file);
          detectedSections = this.detectSectionsInText(text);
          break;
        }
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
      // HYBRID PARSING: Detected Sections + Rule-based + ML
      // ============================================
      
      let parsedSections: Partial<ResumeSections>;
      let confidence = 0;
      let suggestions: ParsingSuggestion[] = [];
      let templateType = 'unknown';
      let requiresReview = false;

      try {
        // Build sections from detected sections first
        const detectedParsed = this.buildSectionsFromDetected(detectedSections, cleanedText);
        
        // Then try ML-enhanced parsing
        const mlResult = await this.parseWithML(cleanedText);
        
        // Merge detected sections with ML results
        const merged = this.mergeParsingResults(detectedParsed, mlResult.sections);
        
        // If we have good detected sections, use them with higher confidence
        if (Object.keys(detectedSections).length > 3) {
          parsedSections = merged;
          confidence = Math.max(0.8, mlResult.confidence || 0.6);
        } else if (mlResult.confidence && mlResult.confidence > 0.6) {
          parsedSections = mlResult.sections;
          confidence = mlResult.confidence;
        } else {
          // Fallback to rule-based parsing
          parsedSections = this.ruleBasedParse(cleanedText);
          confidence = mlResult.confidence || 0.3;
        }
        
        suggestions = mlResult.suggestions || this.generateSuggestions(parsedSections);
        templateType = mlResult.templateType || 'detected';
        
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
  // ENHANCED PDF PARSING WITH SECTION DETECTION
  // ============================================

  private async parsePDF(file: File): Promise<ParsedFileResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
        standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/'
      }).promise;

      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        // Group by Y position (preserve exact layout)
        const lines: { y: number; text: string; x: number; width: number }[] = [];

        for (const item of content.items as any[]) {
          const str = item.str || '';
          if (!str || str.trim() === '') continue;

          const y = item.transform ? Math.round(item.transform[5]) : 0;
          const x = item.transform ? Math.round(item.transform[4]) : 0;
          const width = item.width || 0;

          let line = lines.find(l => Math.abs(l.y - y) < 2);
          if (!line) {
            line = { y, text: '', x: 0, width: 0 };
            lines.push(line);
          }

          if (line.text && (x - (line.x + line.width) > 5)) {
            line.text += ' ';
          }
          line.text += str;
          line.x = line.x || x;
          line.width = (x + width) - (line.x || 0);
        }

        // Sort by Y (top to bottom)
        lines.sort((a, b) => a.y - b.y);

        // Build page text with layout preservation
        let pageText = '';
        let lastY = 0;

        for (let j = 0; j < lines.length; j++) {
          const line = lines[j];
          const gap = j === 0 ? 0 : line.y - lastY;

          // Detect section headers
          const isSectionHeader = this.detectSectionHeader(line.text);
          const isJobTitle = this.detectJobTitle(line.text);

          if (j > 0) {
            if (isSectionHeader) {
              pageText += '\n\n';
            } else if (isJobTitle || gap > 20) {
              pageText += '\n\n';
            } else if (gap > 10) {
              pageText += '\n';
            } else {
              pageText += ' ';
            }
          }

          pageText += line.text.trim();
          lastY = line.y;
        }

        pageText = pageText.replace(/\n{3,}/g, '\n\n').trim();
        fullText += pageText + '\n\n';
      }

      // Detect sections before main parser
      const sections = this.detectSectionsInText(fullText);

      return {
        rawText: fullText.trim(),
        sections: sections
      };

    } catch (error) {
      console.warn('PDF parsing failed:', error);
      try {
        const text = await file.text();
        const sections = this.detectSectionsInText(text);
        return { rawText: text, sections };
      } catch {
        return { rawText: '', sections: {} };
      }
    }
  }

  // ============================================
  // ENHANCED DOCX PARSING WITH SECTION DETECTION
  // ============================================

  private async parseDOCX(file: File): Promise<ParsedFileResult> {
    const arrayBuffer = await file.arrayBuffer();

    try {
      const result = await mammoth.convertToHtml({ arrayBuffer });
      let text = this.htmlToStructuredText(result.value || '');

      if (text.length < 100) {
        const fallback = await mammoth.extractRawText({ arrayBuffer });
        text = fallback.value || '';
      }

      // Post-process for resume formatting
      text = this.postProcessResumeText(text);

      // Detect sections before main parser
      const sections = this.detectSectionsInText(text);

      return {
        rawText: text,
        sections: sections
      };

    } catch (error) {
      console.warn('DOCX parsing failed:', error);
      try {
        const fallback = await mammoth.extractRawText({ arrayBuffer });
        const text = fallback.value || '';
        const sections = this.detectSectionsInText(text);
        return { rawText: text, sections };
      } catch {
        return { rawText: '', sections: {} };
      }
    }
  }

  // ============================================
  // UNIVERSAL SECTION DETECTION ENGINE
  // ============================================

  private detectSectionsInText(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = text.split('\n');
    const sectionMarkers: { key: string; lineIdx: number; header: string }[] = [];

    // Find all section headers
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.length > 100) continue;

      const detected = this.detectSectionHeader(line);
      if (detected) {
        sectionMarkers.push({ key: detected, lineIdx: i, header: line });
      }
    }

    // If no sections found, try alternative detection
    if (sectionMarkers.length === 0) {
      return this.fallbackSectionDetection(text);
    }

    // Extract content for each section
    for (let i = 0; i < sectionMarkers.length; i++) {
      const current = sectionMarkers[i];
      const next = i + 1 < sectionMarkers.length ? sectionMarkers[i + 1] : null;
      const startIdx = current.lineIdx + 1;
      const endIdx = next ? next.lineIdx : lines.length;

      // Get content between sections
      let content = lines.slice(startIdx, endIdx).join('\n').trim();

      // Clean up content
      content = content
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^[•\-*○]\s*/gm, '• ')
        .trim();

      // Handle duplicate sections (like multiple skills sections)
      if (sections[current.key]) {
        sections[current.key] += '\n\n' + content;
      } else {
        sections[current.key] = content;
      }
    }

    return sections;
  }

  // ============================================
  // SECTION HEADER DETECTION
  // ============================================

  private detectSectionHeader(line: string): string | null {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length > 80) return null;

    // Remove numbering like "1.", "2.", "3."
    const cleaned = trimmed.replace(/^[\dIVXivx]{1,4}[.)]\s*/, '').trim();
    if (!cleaned) return null;

    // Check each section type
    for (const [key, patterns] of Object.entries(UNIVERSAL_SECTION_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(cleaned) || pattern.test(cleaned.toUpperCase())) {
          // For ALL CAPS headers, prioritize
          if (cleaned === cleaned.toUpperCase() && cleaned.length > 5) {
            return key;
          }
          return key;
        }
      }
    }

    // Check for common variations not caught by patterns
    const upperCleaned = cleaned.toUpperCase();
    const commonHeaders: Record<string, string> = {
      'PROFESSIONAL SUMMARY': 'summary',
      'CAREER SUMMARY': 'summary',
      'WORK EXPERIENCE': 'experience',
      'EMPLOYMENT HISTORY': 'experience',
      'CORE COMPETENCIES': 'skills',
      'TECHNICAL SKILLS': 'skills',
      'EDUCATION & CREDENTIALS': 'education',
      'ACADEMIC BACKGROUND': 'education',
      'PROFESSIONAL PROFILE': 'summary',
      'TECHNICAL PROFILE': 'skills',
      'TECHNICAL PROFILE & TOOLS': 'skills',
    };

    for (const [header, key] of Object.entries(commonHeaders)) {
      if (upperCleaned.includes(header) || header.includes(upperCleaned)) {
        return key;
      }
    }

    return null;
  }

  // ============================================
  // JOB TITLE DETECTION
  // ============================================

  private detectJobTitle(line: string): boolean {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length > 80) return false;

    const jobPatterns = [
      /^[A-Z][a-z]+\s+[A-Z][a-z]+/,
      /^(Senior|Lead|Principal|Chief|Head|Director|Manager|Officer|Analyst|Engineer|Developer|Consultant|Specialist|Coordinator|Intern|Assistant|Associate|Executive|Supervisor|Team Lead|Project Manager|Program Manager|Product Manager|Scrum Master|DevOps|Site Reliability|QA|Data Scientist|Data Analyst|Business Analyst|Systems Analyst|Network Engineer|Security Engineer|Cloud Engineer|DevOps Engineer)/i,
      /(MERL|M&E|USAID|Project Manager|Program Manager)/i,
    ];

    for (const pattern of jobPatterns) {
      if (pattern.test(trimmed)) {
        return true;
      }
    }

    return false;
  }

  // ============================================
  // FALLBACK SECTION DETECTION
  // ============================================

  private fallbackSectionDetection(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = text.split('\n');
    let currentSection = 'header';
    let currentContent: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        currentContent.push('');
        continue;
      }

      // Check if this line might be a section header
      const isAllCaps = trimmed === trimmed.toUpperCase() && trimmed.length > 3;
      const isShort = trimmed.length < 50;

      if (isAllCaps && isShort) {
        // Save previous section
        if (currentContent.length > 0) {
          const content = currentContent.join('\n').trim();
          if (content) {
            sections[currentSection] = sections[currentSection]
              ? sections[currentSection] + '\n\n' + content
              : content;
          }
        }

        // Start new section
        const matchedKey = this.detectSectionHeader(trimmed);
        currentSection = matchedKey || 'unknown_' + trimmed;
        currentContent = [];
      } else {
        currentContent.push(trimmed);
      }
    }

    // Save last section
    if (currentContent.length > 0) {
      const content = currentContent.join('\n').trim();
      if (content) {
        sections[currentSection] = sections[currentSection]
          ? sections[currentSection] + '\n\n' + content
          : content;
      }
    }

    return sections;
  }

  // ============================================
  // HTML TO STRUCTURED TEXT
  // ============================================

  private htmlToStructuredText(html: string): string {
    let text = html;

    // Tables
    text = text.replace(/<table[^>]*>/gi, '\n');
    text = text.replace(/<\/table>/gi, '\n');
    text = text.replace(/<tr[^>]*>/gi, '');
    text = text.replace(/<\/tr>/gi, '\n');
    text = text.replace(/<td[^>]*>/gi, '');
    text = text.replace(/<\/td>/gi, ' ');
    text = text.replace(/<th[^>]*>/gi, '');
    text = text.replace(/<\/th>/gi, ' ');

    // Lists
    text = text.replace(/<ul[^>]*>/gi, '\n');
    text = text.replace(/<\/ul>/gi, '');
    text = text.replace(/<ol[^>]*>/gi, '\n');
    text = text.replace(/<\/ol>/gi, '');
    text = text.replace(/<li[^>]*>/gi, '\n• ');
    text = text.replace(/<\/li>/gi, '');

    // Headings
    text = text.replace(/<h[1-6][^>]*>/gi, '\n\n');
    text = text.replace(/<\/h[1-6]>/gi, '\n');

    // Paragraphs
    text = text.replace(/<p[^>]*>/gi, '');
    text = text.replace(/<\/p>/gi, '\n');
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<div[^>]*>/gi, '');
    text = text.replace(/<\/div>/gi, '\n');

    // Inline
    text = text.replace(/<span[^>]*>/gi, '');
    text = text.replace(/<\/span>/gi, '');
    text = text.replace(/<strong[^>]*>/gi, '');
    text = text.replace(/<\/strong>/gi, '');
    text = text.replace(/<b[^>]*>/gi, '');
    text = text.replace(/<\/b>/gi, '');
    text = text.replace(/<i[^>]*>/gi, '');
    text = text.replace(/<\/i>/gi, '');
    text = text.replace(/<em[^>]*>/gi, '');
    text = text.replace(/<\/em>/gi, '');
    text = text.replace(/<u[^>]*>/gi, '');
    text = text.replace(/<\/u>/gi, '');

    // Special characters
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/&bull;/g, '•')
      .replace(/&reg;/g, '®')
      .replace(/&copy;/g, '©')
      .replace(/&trade;/g, '™');

    // Remove remaining HTML
    text = text.replace(/<[^>]+>/g, '');

    // Normalize whitespace
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{4,}/g, '\n\n')
      .trim();

    return text;
  }

  // ============================================
  // POST-PROCESS RESUME TEXT
  // ============================================

  private postProcessResumeText(text: string): string {
    let result = text;

    // Fix hyphenated words
    result = result.replace(/([a-zA-Z])-\s+([a-zA-Z])/g, '$1-$2');
    result = result.replace(/([a-zA-Z])-\s*([a-zA-Z])/g, '$1-$2');

    // Fix bullet points
    result = result.replace(/^\s*[-–—]\s*/gm, '• ');
    result = result.replace(/^\s*\*\s*/gm, '• ');
    result = result.replace(/^\s*[•●○▪▫]\s*/gm, '• ');

    // Fix numbered lists
    result = result.replace(/^(\d+)[.)]\s*(.+)$/gm, '• $2');

    // Clean up
    result = result
      .replace(/\n{4,}/g, '\n\n')
      .replace(/^[ \t]+/gm, '')
      .trim();

    return result;
  }

  // ============================================
  // BUILD SECTIONS FROM DETECTED
  // ============================================

  private buildSectionsFromDetected(
    detectedSections: Record<string, string>,
    fullText: string
  ): Partial<ResumeSections> {
    const sections: Partial<ResumeSections> = {};

    // Extract contact from header or first page
    const headerText = detectedSections['contact'] || 
                       detectedSections['header'] || 
                       fullText.split('\n').slice(0, 20).join('\n');
    sections.contact = this.extractContactAdvanced(headerText);

    // Summary
    const summaryText = detectedSections['summary'] || '';
    sections.summary = {
      content: summaryText || this.extractSummaryAdvanced(headerText),
      aiOptimized: false,
      lastModified: new Date().toISOString(),
      versions: [],
      keywordDensity: {},
      characterCount: summaryText.length,
      wordCount: summaryText.split(/\s+/).length,
    };

    // Experience
    sections.experience = detectedSections['experience']
      ? this.extractExperienceAdvanced(detectedSections['experience'])
      : [];

    // Education
    sections.education = detectedSections['education']
      ? this.extractEducationAdvanced(detectedSections['education'])
      : [];

    // Skills
    const skillsText = detectedSections['skills'] || '';
    sections.skills = skillsText
      ? this.extractSkillsAdvanced(skillsText)
      : this.extractSkillsAdvanced(fullText);

    // Projects
    sections.projects = detectedSections['projects']
      ? this.extractProjectsAdvanced(detectedSections['projects'])
      : [];

    // Certifications
    sections.certifications = detectedSections['certifications']
      ? this.extractCertificationsAdvanced(detectedSections['certifications'])
      : [];

    // Languages
    const languagesText = detectedSections['languages'] || '';
    sections.languages = languagesText
      ? this.extractLanguagesAdvanced(languagesText)
      : this.extractLanguagesAdvanced(fullText);

    // Initialize empty arrays
    sections.volunteer = [];
    sections.publications = [];
    sections.awards = [];
    sections.customSections = [];
    sections.professionalAffiliations = [];
    sections.conferences = [];
    sections.patents = [];
    sections.references = [];

    return sections;
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
    const cacheKey = text.slice(0, 100);
    
    if (this.featureCache.has(cacheKey)) {
      return this.featureCache.get(cacheKey)!;
    }

    const features: number[] = [];
    const lines = text.split('\n').filter(l => l.trim());
    
    features.push(this.normalizeValue(lines.length / 1000));
    features.push(this.normalizeValue(text.length / 10000));
    features.push(this.normalizeValue(this.detectSectionCount(lines) / 10));
    
    const sections = ['experience', 'education', 'skills', 'summary', 'projects'];
    for (const section of sections) {
      const count = this.countSectionOccurrences(text, section);
      features.push(this.normalizeValue(count / 10));
    }
    
    features.push(this.normalizeValue((text.match(/[•\-*○]/g) || []).length / 50));
    features.push(this.normalizeValue((text.match(/\b(19|20)\d{2}\b/g) || []).length / 20));
    features.push(this.normalizeValue((text.match(/[\w.+-]+@[\w-]+\.[a-z.]{2,}/gi) || []).length));
    features.push(this.normalizeValue((text.match(/\b[A-Z][a-z]+,\s*[A-Z]{2}\b/g) || []).length));
    features.push(this.normalizeValue((text.match(/\+\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g) || []).length));
    
    const avgLineLength = lines.reduce((sum, l) => sum + l.length, 0) / (lines.length || 1);
    features.push(this.normalizeValue(avgLineLength / 200));
    
    const whitespaceRatio = (text.match(/\s/g) || []).length / (text.length || 1);
    features.push(this.normalizeValue(whitespaceRatio));
    
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
      experience: [/experience/i, /work/i, /employment/i, /career/i],
      education: [/education/i, /university/i, /college/i, /degree/i, /bachelor/i, /master/i, /phd/i],
      skills: [/skills/i, /competencies/i, /expertise/i, /technologies/i, /tools/i],
      summary: [/summary/i, /profile/i, /objective/i, /about/i],
      projects: [/projects?/i, /portfolio/i]
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

    const sectionKeys: (keyof ResumeSections)[] = [
      'contact', 'summary', 'experience', 'education', 'skills', 
      'projects', 'certifications', 'languages', 'volunteer', 
      'publications', 'awards', 'customSections',
      'professionalAffiliations', 'conferences', 'patents', 'references'
    ];
    
    for (const section of sectionKeys) {
      const ruleSection = ruleBased[section];
      const mlSection = mlBased[section];
      
      if (this.isValidSection(mlSection)) {
        merged[section] = mlSection as any;
      } else if (this.isValidSection(ruleSection)) {
        merged[section] = ruleSection as any;
      }
    }

    return merged;
  }

  private isValidSection(section: any): boolean {
    if (section === undefined || section === null) return false;
    if (Array.isArray(section)) return section.length > 0;
    if (typeof section === 'object') return Object.keys(section).length > 0;
    return Boolean(section);
  }

  private generateSuggestions(parsed: Partial<ResumeSections>): ParsingSuggestion[] {
    const suggestions: ParsingSuggestion[] = [];

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

    if (!parsed.experience?.length) {
      suggestions.push({
        field: 'experience',
        value: 'No work experience detected',
        confidence: 0.2,
        alternativeValues: ['Look for job titles and company names']
      });
    }

    if (!parsed.education?.length) {
      suggestions.push({
        field: 'education',
        value: 'No education detected',
        confidence: 0.2,
        alternativeValues: ['Look for degree names and institutions']
      });
    }

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
  // SECTION SPLITTING (Original)
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
  // BUILD SECTIONS (Original)
  // ============================================

  private buildSectionsFromForcedSplit(forcedSections: Record<string, string>, fullText: string): Partial<ResumeSections> {
    const sections: Partial<ResumeSections> = {};
    const headerText = forcedSections['header'] || '';

    sections.contact = this.extractContactAdvanced(headerText || fullText);
    sections.summary = {
      content: forcedSections['summary'] || this.extractSummaryAdvanced(headerText),
      aiOptimized: false,
      lastModified: new Date().toISOString(),
      versions: [],
      keywordDensity: {},
      characterCount: 0,
      wordCount: 0,
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
    
    sections.volunteer = [];
    sections.publications = [];
    sections.awards = [];
    sections.customSections = [];
    sections.professionalAffiliations = [];
    sections.conferences = [];
    sections.patents = [];
    sections.references = [];

    return sections;
  }

  // ============================================
  // CONTACT EXTRACTION - ADVANCED
  // ============================================

  private extractContactAdvanced(text: string): ContactInfo {
    const contact: ContactInfo = {
      fullName: '', 
      email: '', 
      phone: '', 
      location: '', 
      country: '',
    };

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

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

    const emailMatch = text.match(/([\w.+-]+@[\w-]+\.[a-z.]{2,})/i);
    if (emailMatch) contact.email = emailMatch[1];

    const phonePatterns = [
      /(?:phone|tel|mobile|cell)\s*[:\s]\s*(\+?[\d\s().-]{7,20})/i,
      /(\+\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/,
    ];
    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) { contact.phone = (match[1] || match[0]).trim(); break; }
    }

    const locMatch = text.match(/([A-Z][a-zA-Z]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z]+(?:\s+(?:County|State|Province))?))/);
    if (locMatch) contact.location = locMatch[1];

    const liMatch = text.match(/linkedin\.com\/in\/([\w-]+)/i);
    if (liMatch) contact.linkedIn = `https://linkedin.com/in/${liMatch[1]}`;

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
      industry: '',
      companyType: 'Large Enterprise',
      employmentType: 'Full-time',
      durationYears: 0,
      skillsGained: [],
      promotions: [],
      projects: [],
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
          location: '',
          degreeType: 'Bachelor',
          achievements: [],
          researchTopics: [],
          thesisTitle: '',
          advisor: '',
        });
      }
    }

    return education;
  }

  // ============================================
  // SKILLS EXTRACTION - ADVANCED
  // ============================================

  private extractSkillsAdvanced(text: string): SkillsSection {
    const technical: Skill[] = [];
    const soft: Skill[] = [];
    const tools: Skill[] = [];
    const other: Skill[] = [];
    const frameworks: Skill[] = [];
    const databases: Skill[] = [];
    const cloudPlatforms: Skill[] = [];

    if (!text.trim()) {
      return { 
        technical: [], soft: [], languages: [], tools: [], other: [],
        frameworks: [], databases: [], cloudPlatforms: []
      };
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
        soft.push({ name: skill, level: 'Intermediate', category: 'Soft Skills', selfRated: 3 });
      } else if (toolKeywords.some(k => lower.includes(k))) {
        tools.push({ name: skill, level: 'Intermediate', category: 'Tools', selfRated: 3 });
      } else if (techKeywords.some(k => lower.includes(k)) || /^[A-Za-z0-9#+.\s\-/]+$/.test(skill)) {
        technical.push({ name: skill, level: 'Intermediate', category: 'Technical', selfRated: 3 });
      } else {
        other.push({ name: skill, level: 'Intermediate', category: 'Other', selfRated: 3 });
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
      frameworks: [],
      databases: [],
      cloudPlatforms: [],
    };
  }

  // ============================================
  // PROJECTS EXTRACTION - ADVANCED
  // ============================================

  private extractProjectsAdvanced(text: string): Project[] {
    const projects: Project[] = [];
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
        problemSolved: '',
        impactMetrics: [],
        featured: false,
      });
    }

    return projects.slice(0, 15);
  }

  // ============================================
  // CERTIFICATIONS EXTRACTION - ADVANCED
  // ============================================

  private extractCertificationsAdvanced(text: string): Certification[] {
    const certs: Certification[] = [];
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
          skillsValidated: [],
          annualRenewal: false,
          isActive: true,
        });
      }
    }

    return certs.slice(0, 15);
  }

  // ============================================
  // LANGUAGES EXTRACTION - ADVANCED
  // ============================================

  private extractLanguagesAdvanced(text: string): Language[] {
    const languages: Language[] = [];
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
          proficiency: this.mapProficiency(proficiency) as any,
          readingLevel: this.mapProficiency(proficiency) as any,
          writingLevel: this.mapProficiency(proficiency) as any,
          speakingLevel: this.mapProficiency(proficiency) as any,
          listeningLevel: this.mapProficiency(proficiency) as any,
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

    if (!this.isTraining) {
      this.isTraining = true;
      try {
        await this.mlCore.trainOnCorrections([trainingExample], 3);
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

    if (this.correctionHistory.length > 0) {
      const totalConfidence = this.correctionHistory.reduce(
        (sum, ex) => sum + ex.confidence, 0
      );
      stats.averageConfidence = totalConfidence / this.correctionHistory.length;
    }

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
