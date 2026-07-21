// ============================================
// RESUME PARSER - Browser-Compatible PDF, DOCX, TXT
// ============================================

import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { ResumeSections, ContactInfo, WorkExperience, Education, ResumeImportResult } from './types';
import { v4 as uuidv4 } from 'uuid';

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class ResumeParser {
  private static instance: ResumeParser;

  static getInstance(): ResumeParser {
    if (!ResumeParser.instance) {
      ResumeParser.instance = new ResumeParser();
    }
    return ResumeParser.instance;
  }

  // ============================================
  // MAIN PARSING METHODS
  // ============================================

  async parseFile(file: File): Promise<ResumeImportResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return {
          success: false,
          parsed: {},
          errors: validation.errors,
          warnings: [],
          rawText: '',
        };
      }

      let text = '';
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      switch (fileExtension) {
        case 'pdf':
          text = await this.parsePDF(file);
          break;
        case 'docx':
        case 'doc':
          text = await this.parseDOCX(file);
          break;
        case 'txt':
          text = await this.parseTXT(file);
          break;
        default:
          errors.push(`Unsupported file format: .${fileExtension}`);
          return { success: false, parsed: {}, errors, warnings, rawText: '' };
      }

      if (!text.trim()) {
        errors.push('Could not extract text from the file. The file might be empty or scanned.');
        return { success: false, parsed: {}, errors, warnings, rawText: '' };
      }

      const sections = this.extractSections(text);

      if (!sections.contact?.email) {
        warnings.push('No email address found in the resume.');
      }
      if (!sections.contact?.phone) {
        warnings.push('No phone number found in the resume.');
      }
      if (!sections.experience?.length) {
        warnings.push('No work experience detected.');
      }

      return {
        success: true,
        parsed: sections,
        errors: [],
        warnings,
        rawText: text,
      };
    } catch (error: any) {
      errors.push(`Failed to parse file: ${error.message}`);
      return {
        success: false,
        parsed: {},
        errors,
        warnings,
        rawText: '',
      };
    }
  }

  // ============================================
  // FILE VALIDATION
  // ============================================

  private validateFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedExtensions = ['pdf', 'docx', 'doc', 'txt'];

    if (!file) {
      errors.push('No file provided.');
      return { valid: false, errors };
    }

    if (file.size > maxSize) {
      errors.push(`File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(`Unsupported file type: .${extension}. Allowed: ${allowedExtensions.join(', ')}`);
    }

    return { valid: errors.length === 0, errors };
  }

  // ============================================
  // BROWSER-COMPATIBLE PDF PARSING (pdfjs-dist)
  // ============================================

  private async parsePDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF using pdfjs-dist
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
      }

      if (!fullText.trim()) {
        throw new Error('No text content found in PDF');
      }

      return this.cleanPDFText(fullText);
    } catch (error: any) {
      console.error('PDF Parsing Error:', error);
      
      // Fallback: Try to read as text directly (for text-based PDFs)
      try {
        const text = await file.text();
        const cleaned = this.cleanPDFText(text);
        if (cleaned.length > 50) {
          return cleaned;
        }
      } catch {
        // Fallback failed
      }
      
      throw new Error('Failed to parse PDF file. The file might be scanned or image-based. Please upload a text-based PDF.');
    }
  }

  private cleanPDFText(text: string): string {
    return text
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .replace(/\f/g, '\n') // Form feed to newline
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
      .replace(/\s{2,}/g, ' ') // Reduce multiple spaces
      .trim();
  }

  // ============================================
  // DOCX PARSING
  // ============================================

  private async parseDOCX(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      if (!result.value) {
        throw new Error('No text extracted from DOCX');
      }

      if (result.messages.length > 0) {
        console.warn('DOCX Parsing Warnings:', result.messages);
      }

      return result.value;
    } catch (error: any) {
      console.error('DOCX Parsing Error:', error);
      throw new Error('Failed to parse DOCX file. The file might be corrupted.');
    }
  }

  // ============================================
  // TXT PARSING
  // ============================================

  private async parseTXT(file: File): Promise<string> {
    try {
      const text = await file.text();
      return text.trim();
    } catch (error: any) {
      console.error('TXT Parsing Error:', error);
      throw new Error('Failed to read text file.');
    }
  }

  // ============================================
  // SECTION EXTRACTION
  // ============================================

  private extractSections(text: string): Partial<ResumeSections> {
    const sections: Partial<ResumeSections> = {};

    sections.contact = this.extractContactInfo(text);

    const sectionMap = this.splitIntoSections(text);

    sections.summary = {
      content: sectionMap.get('summary') || sectionMap.get('objective') || sectionMap.get('profile') || '',
      aiOptimized: false,
      lastModified: new Date().toISOString(),
    };

    sections.experience = this.extractExperience(
      sectionMap.get('experience') || sectionMap.get('work experience') || sectionMap.get('employment') || ''
    );

    sections.education = this.extractEducation(
      sectionMap.get('education') || sectionMap.get('academic') || ''
    );

    sections.skills = this.extractSkills(
      sectionMap.get('skills') || sectionMap.get('technologies') || sectionMap.get('competencies') || ''
    );

    sections.certifications = this.extractCertifications(
      sectionMap.get('certifications') || sectionMap.get('certificates') || ''
    );

    sections.projects = this.extractProjects(
      sectionMap.get('projects') || sectionMap.get('portfolio') || ''
    );

    sections.languages = this.extractLanguages(text);

    return sections;
  }

  // ============================================
  // CONTACT INFO EXTRACTION
  // ============================================

  private extractContactInfo(text: string): ContactInfo {
    const contact: ContactInfo = {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      country: '',
    };

    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (!firstLine.includes('@') && !firstLine.match(/^[\d\s\+\-\(\)]+$/)) {
        contact.fullName = firstLine;
      }
    }

    const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w{2,}/);
    if (emailMatch) {
      contact.email = emailMatch[0];
    }

    const phonePatterns = [
      /(?:\+\d{1,3}[\s\-]?)?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}/,
      /\+\d{1,3}[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{4}/,
      /\d{3}[\s\-]?\d{3}[\s\-]?\d{4}/,
    ];
    
    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) {
        contact.phone = match[0];
        break;
      }
    }

    const linkedInMatch = text.match(/linkedin\.com\/in\/[\w\-]+/i);
    if (linkedInMatch) {
      contact.linkedIn = `https://www.${linkedInMatch[0]}`;
    }

    const githubMatch = text.match(/github\.com\/[\w\-]+/i);
    if (githubMatch) {
      contact.github = `https://www.${githubMatch[0]}`;
    }

    return contact;
  }

  // ============================================
  // SECTION SPLITTING
  // ============================================

  private splitIntoSections(text: string): Map<string, string> {
    const sectionMap = new Map<string, string>();
    
    const sectionHeaders = [
      'summary', 'professional summary', 'objective', 'profile',
      'experience', 'work experience', 'employment', 'work history',
      'education', 'academic background', 'qualifications',
      'skills', 'technical skills', 'core competencies', 'technologies',
      'certifications', 'certificates', 'licenses',
      'projects', 'portfolio', 'project experience',
      'awards', 'honors', 'achievements',
      'publications', 'research',
      'volunteer', 'volunteer experience', 'community service',
      'languages', 'language proficiency',
    ];

    const lines = text.split('\n');
    let currentSection = 'header';
    let currentContent: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim().toLowerCase();
      const matchedHeader = sectionHeaders.find(header => 
        trimmedLine === header || 
        trimmedLine.startsWith(header) ||
        trimmedLine.includes(` ${header}`)
      );

      if (matchedHeader && trimmedLine.length < 50) {
        if (currentContent.length > 0) {
          sectionMap.set(currentSection, currentContent.join('\n').trim());
        }
        currentSection = matchedHeader;
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    if (currentContent.length > 0) {
      sectionMap.set(currentSection, currentContent.join('\n').trim());
    }

    if (sectionMap.size === 0) {
      sectionMap.set('general', text);
    }

    return sectionMap;
  }

  // ============================================
  // EXPERIENCE EXTRACTION
  // ============================================

  private extractExperience(text: string): WorkExperience[] {
    if (!text.trim()) return [];

    const experiences: WorkExperience[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentCompany = '';
    let currentPosition = '';
    let currentDescription: string[] = [];
    let currentStartDate = '';
    let currentEndDate = '';

    const datePattern = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*(?:-|–|to)\s*(?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|Present|Current)\b)/gi;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const dateMatch = line.match(datePattern);
      const isHeader = !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*') && line.length < 100;

      if (isHeader && (dateMatch || i === 0 || !lines[i-1]?.trim())) {
        if (currentCompany || currentPosition) {
          experiences.push({
            id: uuidv4(),
            company: currentCompany,
            position: currentPosition,
            startDate: currentStartDate,
            endDate: currentEndDate,
            current: currentEndDate.toLowerCase().includes('present'),
            location: '',
            description: currentDescription.join('\n'),
            achievements: [],
            technologies: [],
            aiSuggestions: [],
          });
        }

        currentCompany = line;
        currentPosition = '';
        currentDescription = [];
        currentStartDate = '';
        currentEndDate = '';

        if (dateMatch) {
          const dates = dateMatch[0].split(/\s*(?:-|–|to)\s*/);
          currentStartDate = dates[0]?.trim() || '';
          currentEndDate = dates[1]?.trim() || '';
        }
      } else {
        currentDescription.push(line);
      }
    }

    if (currentCompany || currentPosition) {
      experiences.push({
        id: uuidv4(),
        company: currentCompany,
        position: currentPosition,
        startDate: currentStartDate,
        endDate: currentEndDate,
        current: currentEndDate.toLowerCase().includes('present'),
        location: '',
        description: currentDescription.join('\n'),
        achievements: [],
        technologies: [],
        aiSuggestions: [],
      });
    }

    return experiences;
  }

  // ============================================
  // EDUCATION EXTRACTION
  // ============================================

  private extractEducation(text: string): Education[] {
    if (!text.trim()) return [];

    const education: Education[] = [];
    const lines = text.split('\n').filter(line => line.trim());

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const degreePatterns = [
        /(?:Bachelor|Master|Doctorate|Ph\.?D|MBA|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|Associate)/i,
        /(?:degree|diploma|certificate)/i,
      ];

      const hasDegree = degreePatterns.some(pattern => pattern.test(line));

      if (hasDegree) {
        const edu: Education = {
          id: uuidv4(),
          institution: '',
          degree: line,
          field: '',
          startDate: '',
          endDate: '',
          honors: [],
          activities: [],
          relevantCourses: [],
        };

        if (i + 1 < lines.length && !degreePatterns.some(p => p.test(lines[i+1]))) {
          edu.institution = lines[i + 1].trim();
        } else if (i > 0 && !degreePatterns.some(p => p.test(lines[i-1]))) {
          edu.institution = lines[i - 1].trim();
        }

        const gpaMatch = line.match(/GPA:?\s*([\d.]+)/i);
        if (gpaMatch) {
          edu.gpa = gpaMatch[1];
        }

        education.push(edu);
      }
    }

    return education;
  }

  // ============================================
  // SKILLS EXTRACTION
  // ============================================

  private extractSkills(text: string): any {
    if (!text.trim()) {
      return { technical: [], soft: [], languages: [], tools: [], other: [] };
    }

    const skillsList = text
      .split(/[,;•\-\n•\|\/]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0 && skill.length < 50);

    const technicalSkills: string[] = [];
    const softSkills: string[] = [];
    const tools: string[] = [];

    const techKeywords = [
      'programming', 'developer', 'engineer', 'coding',
      'javascript', 'python', 'java', 'c++', 'ruby', 'php',
      'html', 'css', 'react', 'angular', 'vue', 'node',
      'sql', 'database', 'cloud', 'aws', 'azure', 'devops',
      'docker', 'kubernetes', 'git', 'linux', 'agile',
    ];

    const softKeywords = [
      'leadership', 'communication', 'teamwork', 'management',
      'problem solving', 'critical thinking', 'creativity',
      'adaptability', 'time management', 'organization',
    ];

    skillsList.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      if (techKeywords.some(keyword => lowerSkill.includes(keyword))) {
        technicalSkills.push(skill);
      } else if (softKeywords.some(keyword => lowerSkill.includes(keyword))) {
        softSkills.push(skill);
      } else if (lowerSkill.includes('tool') || lowerSkill.includes('software')) {
        tools.push(skill);
      } else {
        technicalSkills.push(skill);
      }
    });

    return {
      technical: technicalSkills.slice(0, 20).map(name => ({
        name, level: 'Intermediate' as const, category: 'Technical',
      })),
      soft: softSkills.slice(0, 10).map(name => ({
        name, level: 'Intermediate' as const, category: 'Soft Skills',
      })),
      languages: [],
      tools: tools.slice(0, 10).map(name => ({
        name, level: 'Intermediate' as const, category: 'Tools',
      })),
      other: [],
    };
  }

  // ============================================
  // CERTIFICATIONS EXTRACTION
  // ============================================

  private extractCertifications(text: string): any[] {
    if (!text.trim()) return [];
    const certifications: any[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    lines.forEach(line => {
      if (line.trim().length > 5) {
        certifications.push({
          id: uuidv4(), name: line.trim(), issuer: '', date: '', inProgress: false,
        });
      }
    });
    return certifications.slice(0, 10);
  }

  // ============================================
  // PROJECTS EXTRACTION
  // ============================================

  private extractProjects(text: string): any[] {
    if (!text.trim()) return [];
    const projects: any[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    let currentProject: any = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length < 100 && !trimmed.startsWith('•') && !trimmed.startsWith('-')) {
        if (currentProject) projects.push(currentProject);
        currentProject = {
          id: uuidv4(), name: trimmed, description: '',
          technologies: [], achievements: [], role: '', current: false,
        };
      } else if (currentProject) {
        currentProject.description += trimmed + '\n';
        const techMatch = trimmed.match(/(?:technologies|tech stack|built with):\s*(.+)/i);
        if (techMatch) {
          currentProject.technologies = techMatch[1].split(/[,;]/).map((t: string) => t.trim());
        }
      }
    });

    if (currentProject) projects.push(currentProject);
    return projects.slice(0, 10);
  }

  // ============================================
  // LANGUAGES EXTRACTION
  // ============================================

  private extractLanguages(text: string): any[] {
    const languages: any[] = [];
    const languagePatterns = [
      'English', 'Spanish', 'French', 'German', 'Chinese',
      'Japanese', 'Korean', 'Arabic', 'Portuguese', 'Russian',
      'Italian', 'Dutch', 'Hindi', 'Turkish', 'Vietnamese',
    ];

    languagePatterns.forEach(lang => {
      const pattern = new RegExp(`${lang}\\s*(?:\\(([^)]+)\\))?`, 'i');
      const match = text.match(pattern);
      if (match) {
        languages.push({
          name: lang,
          proficiency: this.mapProficiency(match[1] || 'Intermediate'),
        });
      }
    });

    return languages;
  }

  private mapProficiency(text: string): 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic' {
    const t = text.toLowerCase();
    if (t.includes('native')) return 'Native';
    if (t.includes('fluent')) return 'Fluent';
    if (t.includes('advanced')) return 'Advanced';
    if (t.includes('basic') || t.includes('beginner')) return 'Basic';
    return 'Intermediate';
  }
}

export default ResumeParser;
