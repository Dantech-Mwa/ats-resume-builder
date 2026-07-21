// ============================================
// PROFESSIONAL RESUME PARSER - AI-Enhanced
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
  // MAIN PARSING
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

      // PROFESSIONAL PARSING PIPELINE
      const cleanedText = this.cleanText(text);
      const lines = this.splitIntoLines(cleanedText);
      const blocks = this.identifyBlocks(lines);
      const sections = this.blocksToSections(blocks, lines);

      // Validation & warnings
      if (!sections.contact?.email) warnings.push('No email found');
      if (!sections.contact?.phone) warnings.push('No phone found');
      if (!sections.experience?.length) warnings.push('No experience detected - check format');
      if (!sections.education?.length) warnings.push('No education detected');
      if (!sections.skills?.technical?.length && !sections.skills?.soft?.length) {
        warnings.push('No skills detected');
      }

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
  // LINE SPLITTING (Smart)
  // ============================================

  private splitIntoLines(text: string): string[] {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  // ============================================
  // BLOCK IDENTIFICATION (The Secret Sauce)
  // ============================================

  private identifyBlocks(lines: string[]): ParsedBlock[] {
    const blocks: ParsedBlock[] = [];
    let currentBlock = '';
    let blockStart = 0;

    const sectionHeaders = [
      { pattern: /^(?:professional\s+)?summary|objective|profile|about\s+me|personal\s+statement|career\s+objective/i, type: 'summary' as const },
      { pattern: /^(?:work\s+)?experience|employment|work\s+history|professional\s+background|career\s+history|relevant\s+experience/i, type: 'experience' as const },
      { pattern: /^education|academic|qualification|academic\s+background|educational/i, type: 'education' as const },
      { pattern: /^skills?|technical\s+skills?|core\s+competenc|technolog|expertise|proficienc/i, type: 'skills' as const },
      { pattern: /^certification|certificate|license|accreditation/i, type: 'certification' as const },
      { pattern: /^project|portfolio|key\s+project/i, type: 'project' as const },
      { pattern: /^languages?|language\s+proficiency/i, type: 'language' as const },
      { pattern: /^award|honor|achievement|recognition/i, type: 'unknown' as const },
      { pattern: /^publication|research|paper/i, type: 'unknown' as const },
      { pattern: /^volunteer|community|extracurricular/i, type: 'unknown' as const },
      { pattern: /^reference/i, type: 'unknown' as const },
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const matchedHeader = sectionHeaders.find(h => h.pattern.test(line) && line.length < 60);

      if (matchedHeader) {
       if (currentBlock.trim()) {
  const blockType = this.determineBlockType(
    blocks.length === 0 ? 'contact' : 'unknown', 
    lines.slice(blockStart, i)
  ) as ParsedBlock['type'];
  
  blocks.push({
    type: blockType,
    content: currentBlock.trim(),
    confidence: 0.8,
  });
}

        currentBlock = line + '\n';
        blockStart = i;
      } else {
        currentBlock += line + '\n';
      }
    }

    if (currentBlock.trim()) {
      blocks.push({
        type: 'unknown',
        content: currentBlock.trim(),
        confidence: 0.5,
      });
    }

    // Re-classify blocks
    return this.reclassifyBlocks(blocks, lines);
  }

private determineBlockType(defaultType: string, blockLines: string[]): ParsedBlock['type'] {
  const text = blockLines.join(' ').toLowerCase();
  
  if (blockLines.length <= 5 && (
    text.includes('@') || 
    text.includes('phone') || 
    text.includes('linkedin') ||
    text.match(/[\d\s\+\-\(\)]{10,}/)
  )) return 'contact';

  if (text.includes('@') && text.includes('.com')) return 'contact';
  
  // Must return a valid type
  if (defaultType === 'contact') return 'contact';
  if (defaultType === 'summary') return 'summary';
  if (defaultType === 'experience') return 'experience';
  if (defaultType === 'education') return 'education';
  if (defaultType === 'skills') return 'skills';
  if (defaultType === 'certification') return 'certification';
  if (defaultType === 'project') return 'project';
  if (defaultType === 'language') return 'language';
  
  return 'unknown';
}

  private reclassifyBlocks(blocks: ParsedBlock[], allLines: string[]): ParsedBlock[] {
    const firstBlock = blocks[0];
    
    // First block is usually contact info
    if (firstBlock && firstBlock.type === 'unknown') {
      const content = firstBlock.content.toLowerCase();
      if (content.includes('@') || content.match(/[\d\s\+\-\(\)]{10,}/) || content.includes('linkedin')) {
        firstBlock.type = 'contact';
        firstBlock.confidence = 0.9;
      }
    }

    // Last block might be skills
    const lastBlock = blocks[blocks.length - 1];
    if (lastBlock && lastBlock.type === 'unknown') {
      const lines = lastBlock.content.split('\n');
      const commaCount = (lastBlock.content.match(/,/g) || []).length;
      if (commaCount > 5 || lines.some(l => l.includes('•') && l.length < 40)) {
        lastBlock.type = 'skills';
        lastBlock.confidence = 0.7;
      }
    }

    return blocks;
  }

  // ============================================
  // BLOCKS TO SECTIONS
  // ============================================

  private blocksToSections(blocks: ParsedBlock[], lines: string[]): Partial<ResumeSections> {
    const sections: Partial<ResumeSections> = {};
    const fullText = lines.join('\n');

    // Extract contact
    sections.contact = this.extractContact(fullText, blocks);

    // Extract summary
    const summaryBlock = blocks.find(b => b.type === 'summary');
    sections.summary = {
      content: summaryBlock ? this.extractSummaryText(summaryBlock.content) : this.findSummaryInText(fullText),
      aiOptimized: false,
      lastModified: new Date().toISOString(),
    };

    // Extract experience
    const expBlocks = blocks.filter(b => b.type === 'experience' || b.type === 'unknown');
    sections.experience = this.extractAllExperience(expBlocks, fullText);

    // Extract education
    const eduBlocks = blocks.filter(b => b.type === 'education' || b.type === 'unknown');
    sections.education = this.extractAllEducation(eduBlocks, fullText);

    // Extract skills
    sections.skills = this.extractAllSkills(fullText, blocks);

    // Extract certifications
    sections.certifications = this.extractCertifications(fullText);

    // Extract projects
    sections.projects = this.extractProjects(fullText);

    return sections;
  }

  // ============================================
  // CONTACT EXTRACTION (Enhanced)
  // ============================================

  private extractContact(text: string, blocks: ParsedBlock[]): ContactInfo {
    const contact: ContactInfo = {
      fullName: '', email: '', phone: '', location: '', country: '',
    };

    // Try first block for contact
    const contactBlock = blocks.find(b => b.type === 'contact') || blocks[0];
    const contactText = contactBlock?.content || text.split('\n').slice(0, 10).join('\n');

    // Extract name (first non-empty line that's not email/phone)
    const lines = contactText.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.includes('@') && 
          !trimmed.match(/^[\d\s\+\-\(\)\.]{7,}$/) &&
          !trimmed.match(/^(linkedin|github|portfolio)/i) &&
          trimmed.length > 2 && trimmed.length < 60 &&
          /^[A-Za-z\s\.\-']+$/.test(trimmed)) {
        contact.fullName = trimmed;
        break;
      }
    }

    // Extract email (multiple patterns)
    const emailPatterns = [
      /([\w\.\-\+]+@[\w\.\-]+\.[a-z]{2,})/gi,
      /email:?\s*([\w\.\-\+]+@[\w\.\-]+\.[a-z]{2,})/gi,
      /e-?mail:?\s*([\w\.\-\+]+@[\w\.\-]+\.[a-z]{2,})/gi,
    ];
    for (const pattern of emailPatterns) {
      const match = pattern.exec(text);
      if (match) { contact.email = match[1] || match[0]; break; }
    }

    // Extract phone (enhanced patterns)
    const phonePatterns = [
      /(?:\+\d{1,3}[\s\-\.]?)?\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4}/,
      /phone:?\s*([\+\d\s\-\(\)\.]{10,})/i,
      /tel:?\s*([\+\d\s\-\(\)\.]{10,})/i,
      /mobile:?\s*([\+\d\s\-\(\)\.]{10,})/i,
      /cell:?\s*([\+\d\s\-\(\)\.]{10,})/i,
    ];
    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) { contact.phone = match[1] || match[0]; break; }
    }

    // Extract location
    const locationPatterns = [
      /(?:location|address|city|based in):\s*([^\n,]+(?:,\s*[A-Z]{2})?)/i,
      /([A-Z][a-z]+,\s*(?:[A-Z]{2}|[A-Z][a-z]+))/,
      /([A-Z][a-z]+,\s*(?:United States|USA|UK|Canada|Australia))/i,
    ];
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) { contact.location = match[1].trim(); break; }
    }

    // Extract LinkedIn
    const linkedinMatch = text.match(/(?:linkedin\.com\/in\/|linkedin:?\s*)([\w\-]+)/i);
    if (linkedinMatch) contact.linkedIn = `https://linkedin.com/in/${linkedinMatch[1]}`;

    // Extract GitHub
    const githubMatch = text.match(/(?:github\.com\/|github:?\s*)([\w\-]+)/i);
    if (githubMatch) contact.github = `https://github.com/${githubMatch[1]}`;

    // Extract portfolio/website
    const urlMatch = text.match(/(?:portfolio|website|web):?\s*(https?:\/\/[\w\.\-]+\.[a-z]{2,}(?:\/[\w\-\.]*)*)/i);
    if (urlMatch) contact.portfolio = urlMatch[1];

    return contact;
  }

  // ============================================
  // SUMMARY EXTRACTION
  // ============================================

  private extractSummaryText(blockContent: string): string {
    // Remove the header line
    const lines = blockContent.split('\n');
    const contentLines = lines.filter(l => 
      !/^(?:professional\s+)?summary|objective|profile/i.test(l) || l.length > 60
    );
    return contentLines.join(' ').trim();
  }

  private findSummaryInText(text: string): string {
    // Look for paragraph after contact info and before experience
    const lines = text.split('\n');
    let contactEnded = false;
    let summaryLines: string[] = [];

    for (const line of lines) {
      if (!contactEnded && (line.includes('@') || line.match(/[\d\s\+\-\(\)]{10,}/))) {
        contactEnded = true;
        continue;
      }
      if (contactEnded && line.length > 50 && !/^(?:experience|education|skills|work)/i.test(line)) {
        summaryLines.push(line);
        if (summaryLines.length >= 4) break;
      }
      if (/^(?:experience|education|skills|work)/i.test(line)) break;
    }

    return summaryLines.join(' ').trim();
  }

  // ============================================
  // EXPERIENCE EXTRACTION (Enhanced)
  // ============================================

  private extractAllExperience(blocks: ParsedBlock[], fullText: string): WorkExperience[] {
    const experiences: WorkExperience[] = [];
    
    // Try to find experience section
    const expSection = this.findSection(fullText, [
      'experience', 'work experience', 'employment', 'work history',
      'professional experience', 'professional background', 'career history',
    ]);

    if (!expSection) return experiences;

    // Split into individual job entries
    const entries = this.splitExperienceEntries(expSection);
    
    for (const entry of entries) {
      const exp = this.parseExperienceEntry(entry);
      if (exp.company || exp.position) {
        experiences.push(exp);
      }
    }

    return experiences;
  }

  private findSection(text: string, headers: string[]): string | null {
    const lines = text.split('\n');
    let startIndex = -1;
    let endIndex = lines.length;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase().trim();
      if (startIndex === -1 && headers.some(h => line.includes(h) && line.length < 50)) {
        startIndex = i + 1;
        continue;
      }
      if (startIndex !== -1 && this.isSectionHeader(line) && line.length < 50) {
        endIndex = i;
        break;
      }
    }

    if (startIndex === -1) return null;
    return lines.slice(startIndex, endIndex).join('\n');
  }

  private isSectionHeader(line: string): boolean {
    const headers = [
      'education', 'skills', 'certification', 'project', 'language',
      'award', 'publication', 'volunteer', 'reference',
      'academic', 'technical skills', 'core competencies',
    ];
    return headers.some(h => line.includes(h));
  }

  private splitExperienceEntries(text: string): string[] {
    // Split by date patterns or company separators
    const datePattern = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*(?:-|–|to)\s*(?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|Present|Current)\b)/gi;
    
    // Try splitting by dates first
    const parts = text.split(datePattern);
    if (parts.length > 1) {
      const entries: string[] = [];
      for (let i = 0; i < parts.length - 1; i += 2) {
        entries.push((parts[i] || '') + (parts[i + 1] || ''));
      }
      if (entries.length > 0) return entries;
    }

    // Fallback: split by double newlines
    const chunks = text.split(/\n\s*\n/);
    if (chunks.length > 1) return chunks;

    return [text];
  }

  private parseExperienceEntry(text: string): WorkExperience {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    
    let company = '';
    let position = '';
    let startDate = '';
    let endDate = '';
    let current = false;
    let location = '';
    const description: string[] = [];
    const achievements: string[] = [];

    // Extract dates
    const datePattern = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})\s*(?:-|–|to)\s*(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|Present|Current)\b/i;
    const dateMatch = text.match(datePattern);
    if (dateMatch) {
      startDate = dateMatch[1];
      endDate = dateMatch[2];
      current = /present|current/i.test(endDate);
    }

    // First meaningful line is usually the company/position
    for (const line of lines) {
      if (!position && line.length > 3 && line.length < 80 && !line.startsWith('•') && !line.startsWith('-')) {
        // Check if line contains company and position separated by | or -
        const separator = line.match(/\s*[|\-–—]\s*/);
        if (separator && line.length < 100) {
          const parts = line.split(separator[0]);
          position = parts[0].trim();
          company = parts[1]?.trim() || '';
        } else {
          position = line;
          // Next line might be company
        }
        continue;
      }
      
      if (position && !company && line.length < 80 && !line.startsWith('•')) {
        company = line;
        continue;
      }

      // Location
      const locMatch = line.match(/(?:location:?\s*)?([A-Z][a-z]+,\s*(?:[A-Z]{2}|[A-Z][a-z]+))/);
      if (locMatch && !location) {
        location = locMatch[1];
        continue;
      }

      // Achievements
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        achievements.push(line.replace(/^[•\-*]\s*/, ''));
      } else if (line.length > 10) {
        description.push(line);
      }
    }

    return {
      id: uuidv4(),
      company: company || this.extractCompanyFromText(text),
      position: position || '',
      startDate,
      endDate,
      current,
      location,
      description: description.join(' '),
      achievements,
      technologies: [],
      aiSuggestions: [],
    };
  }

  private extractCompanyFromText(text: string): string {
    // Common company patterns
    const patterns = [
      /(?:at|with|for)\s+([A-Z][A-Za-z\s&\.]+?)(?:\s*,|\s*$|\s*\n)/,
      /([A-Z][A-Za-z]+(?:\s+(?:Inc|LLC|Ltd|Corp|Corporation|Group|Technologies|Solutions|Systems)))/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return '';
  }

  // ============================================
  // EDUCATION EXTRACTION
  // ============================================

  private extractAllEducation(blocks: ParsedBlock[], fullText: string): Education[] {
    const education: Education[] = [];
    
    const eduSection = this.findSection(fullText, [
      'education', 'academic background', 'qualifications', 'academic',
      'educational background', 'educational qualification',
    ]);

    if (!eduSection) return education;

    const entries = eduSection.split(/\n\s*\n/);
    
    for (const entry of entries) {
      const lines = entry.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) continue;

      let institution = '';
      let degree = '';
      let field = '';
      let startDate = '';
      let endDate = '';
      let gpa = '';

      for (const line of lines) {
        // Degree patterns
        const degreePatterns = [
          /(Bachelor|Master|Doctorate|Ph\.?D\.?|MBA|B\.?S\.?c?\.?|M\.?S\.?c?\.?|B\.?A\.?|M\.?A\.?|Associate|Diploma)\s*(?:of|in)?\s*([\w\s]+)?/i,
          /(B\.?S\.?c?\.?|M\.?S\.?c?\.?|B\.?A\.?|M\.?A\.?|Ph\.?D\.?|MBA)\s*(?:in\s*)?([\w\s]+)?/i,
        ];
        for (const pattern of degreePatterns) {
          const match = line.match(pattern);
          if (match) {
            degree = match[0];
            field = match[2] || '';
            break;
          }
        }

        // Institution patterns (usually a proper noun line)
        if (!institution && /^[A-Z]/.test(line) && line.length > 5 && line.length < 80) {
          const commonWords = ['university', 'college', 'institute', 'school', 'academy'];
          if (commonWords.some(w => line.toLowerCase().includes(w)) || /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/.test(line)) {
            institution = line;
          }
        }

        // GPA
        const gpaMatch = line.match(/GPA:?\s*([\d.]+(?:\/\d\.?\d?)?)/i);
        if (gpaMatch) gpa = gpaMatch[1];

        // Dates
        const datePattern = /(\d{4})\s*(?:-|–|to)\s*(\d{4}|Present|Current)/i;
        const dateMatch = line.match(datePattern);
        if (dateMatch) {
          startDate = dateMatch[1];
          endDate = dateMatch[2];
        }
      }

      if (degree || institution) {
        education.push({
          id: uuidv4(),
          institution,
          degree,
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
  // SKILLS EXTRACTION (Enhanced)
  // ============================================

  private extractAllSkills(fullText: string, blocks: ParsedBlock[]): any {
    const skillsSection = this.findSection(fullText, [
      'skills', 'technical skills', 'core competencies', 'technologies',
      'expertise', 'proficiencies', 'technical proficiencies',
    ]);

    const skillsText = skillsSection || fullText;
    
    // Split by common delimiters
    const rawSkills = skillsText
      .split(/[,;•\|\/\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 60 && !/^(?:skills|technical|core|competencies)/i.test(s));

    const technical: Skill[] = [];
    const soft: Skill[] = [];
    const tools: Skill[] = [];

    const techKeywords = [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust',
      'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel', 'rails',
      'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'jquery',
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'mssql',
      'aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible',
      'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
      'api', 'rest', 'graphql', 'microservices', 'serverless',
      'machine learning', 'ai', 'data science', 'analytics', 'tableau', 'power bi',
      'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd',
      'linux', 'unix', 'windows', 'macos', 'bash', 'shell',
      'figma', 'sketch', 'photoshop', 'illustrator', 'indesign',
    ];

    const softKeywords = [
      'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
      'time management', 'project management', 'adaptability', 'creativity', 'collaboration',
      'analytical', 'detail-oriented', 'organized', 'self-motivated', 'strategic planning',
      'mentoring', 'coaching', 'negotiation', 'presentation', 'public speaking',
      'interpersonal', 'emotional intelligence', 'conflict resolution', 'decision making',
    ];

    const toolKeywords = [
      'excel', 'word', 'powerpoint', 'outlook', 'office', 'google suite', 'slack', 'teams',
      'zoom', 'salesforce', 'hubspot', 'sap', 'oracle', 'netsuite',
      'photoshop', 'illustrator', 'premiere', 'after effects', 'lightroom',
    ];

    for (const skill of rawSkills) {
      const lower = skill.toLowerCase();
      
      if (techKeywords.some(k => lower.includes(k))) {
        technical.push({ name: skill, level: 'Intermediate', category: 'Technical' });
      } else if (softKeywords.some(k => lower.includes(k))) {
        soft.push({ name: skill, level: 'Intermediate', category: 'Soft Skills' });
      } else if (toolKeywords.some(k => lower.includes(k))) {
        tools.push({ name: skill, level: 'Intermediate', category: 'Tools' });
      } else if (skill.length > 2 && /^[A-Za-z#\+\.\s]+$/.test(skill)) {
        // Unknown but looks like a skill
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
  // CERTIFICATIONS
  // ============================================

  private extractCertifications(fullText: string): any[] {
    const certSection = this.findSection(fullText, [
      'certifications', 'certificates', 'licenses', 'certification',
      'professional certifications', 'accreditations',
    ]);

    if (!certSection) return [];

    const certs: any[] = [];
    const lines = certSection.split('\n').filter(l => l.trim().length > 3);

    for (const line of lines) {
      const clean = line.replace(/^[•\-*]\s*/, '').trim();
      if (clean.length > 3) {
        // Try to extract issuer (after dash or comma)
        let name = clean;
        let issuer = '';
        const dashMatch = clean.match(/^(.+?)\s*[-–—]\s*(.+)$/);
        if (dashMatch) {
          name = dashMatch[1].trim();
          issuer = dashMatch[2].trim();
        }
        certs.push({
          id: uuidv4(),
          name,
          issuer,
          date: '',
          inProgress: false,
        });
      }
    }

    return certs.slice(0, 15);
  }

  // ============================================
  // PROJECTS
  // ============================================

  private extractProjects(fullText: string): any[] {
    const projectSection = this.findSection(fullText, [
      'projects', 'portfolio', 'project experience', 'key projects',
      'personal projects', 'academic projects',
    ]);

    if (!projectSection) return [];

    const projects: any[] = [];
    const entries = projectSection.split(/\n\s*\n/);

    for (const entry of entries) {
      const lines = entry.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;

      const name = lines[0].replace(/^[•\-*]\s*/, '').trim();
      const description = lines.slice(1).join(' ').trim();
      
      // Extract technologies
      const techMatch = description.match(/(?:technologies|tech stack|built with|using):\s*([^.•]+)/i);
      const technologies = techMatch 
        ? techMatch[1].split(/[,;]/).map(t => t.trim()).filter(Boolean)
        : [];

      if (name.length > 2) {
        projects.push({
          id: uuidv4(),
          name,
          description: description.substring(0, 500),
          technologies,
          achievements: [],
          role: '',
          current: false,
          startDate: '',
          endDate: '',
        });
      }
    }

    return projects.slice(0, 10);
  }
}

export default ResumeParser;
