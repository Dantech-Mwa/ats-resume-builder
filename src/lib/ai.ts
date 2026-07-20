// ============================================
// AI SERVICE - OpenAI Integration with Real Key
// ============================================

import OpenAI from 'openai';
import {
  ATSScore,
  ATSBreakdown,
  AIRecommendation,
  AIAnalysis,
  ResumeSections,
  WorkExperience,
  ProfessionalSummary,
  JobDescription,
  JobMatchResult,
  AIChatMessage,
} from './types';

class AIService {
  private static instance: AIService;
  private openai: OpenAI;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Use the provided OpenAI API key
   const apiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
    if (!apiKey || apiKey.includes('your')) {
      console.warn('⚠️ OpenAI API key not configured properly. AI features will be limited.');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });

    console.log('✅ AI Service initialized with OpenAI');
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Cache management
  private getCacheKey(functionName: string, params: any): string {
    return `${functionName}_${JSON.stringify(params)}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // ============================================
  // ATS SCORING
  // ============================================

  async analyzeATS(
    resumeText: string,
    jobDescription?: string
  ): Promise<ATSScore> {
    const cacheKey = this.getCacheKey('analyzeATS', { 
      resumeText: resumeText.substring(0, 100), 
      jobDescription: jobDescription?.substring(0, 100) 
    });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `You are an expert ATS (Applicant Tracking System) analyzer for DanJobs. Analyze this resume and provide a detailed score.

${jobDescription ? `Job Description for comparison:\n${jobDescription}\n\n` : ''}

Resume Text:
${resumeText}

Provide analysis in this exact JSON format:
{
  "overall": number (0-100),
  "breakdown": {
    "keywordOptimization": number (0-100),
    "formattingScore": number (0-100),
    "contentQuality": number (0-100),
    "sectionCompleteness": number (0-100),
    "actionVerbs": number (0-100),
    "quantifiableResults": number (0-100),
    "grammarAndSpelling": number (0-100),
    "contactInfoQuality": number (0-100),
    "skillsRelevance": number (0-100),
    "overallReadability": number (0-100)
  },
  "missingKeywords": string[],
  "improvementTips": string[] (5-10 specific tips),
  "criticalIssues": string[],
  "jobDescriptionMatch": number (0-100, only if job description provided)
}

Rules:
- Be honest and critical
- Focus on ATS compatibility for DanJobs platform
- Check for proper formatting and keywords
- Identify missing sections
- Evaluate action verb usage
- Check for quantifiable achievements`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert ATS resume analyzer for DanJobs. Always respond with valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('Empty response from AI');

      const score: ATSScore = {
        ...JSON.parse(content),
        analyzedAt: new Date().toISOString(),
      };

      this.setCache(cacheKey, score);
      return score;
    } catch (error: any) {
      console.error('ATS Analysis Error:', error);
      return this.getFallbackATSScore();
    }
  }

  private getFallbackATSScore(): ATSScore {
    return {
      overall: 65,
      breakdown: {
        keywordOptimization: 60,
        formattingScore: 70,
        contentQuality: 65,
        sectionCompleteness: 60,
        actionVerbs: 65,
        quantifiableResults: 55,
        grammarAndSpelling: 75,
        contactInfoQuality: 80,
        skillsRelevance: 65,
        overallReadability: 70,
      },
      missingKeywords: ['Add more industry-specific keywords'],
      improvementTips: [
        'Add quantifiable achievements with metrics',
        'Use stronger action verbs',
        'Include a professional summary',
        'Add relevant certifications section',
        'Optimize for ATS with standard headings',
      ],
      criticalIssues: [],
      analyzedAt: new Date().toISOString(),
    };
  }

  // ============================================
  // AI RECOMMENDATIONS
  // ============================================

  async getRecommendations(
    resumeText: string,
    currentScore: ATSScore,
    targetRole?: string
  ): Promise<AIRecommendation[]> {
    const cacheKey = this.getCacheKey('getRecommendations', { 
      resumeText: resumeText.substring(0, 100), 
      score: currentScore.overall 
    });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `Based on this resume and its ATS score breakdown, provide specific improvements.

ATS Score: ${currentScore.overall}/100
Score Breakdown: ${JSON.stringify(currentScore.breakdown)}
Target Role: ${targetRole || 'General'}
Missing Keywords: ${currentScore.missingKeywords.join(', ')}

Resume Text:
${resumeText}

Provide 5-10 specific, actionable recommendations in this JSON format:
[
  {
    "id": "unique-id",
    "section": "section name",
    "field": "specific field name",
    "current": "current text (if applicable)",
    "suggested": "improved version",
    "reason": "why this improvement helps for DanJobs ATS",
    "priority": "Critical|High|Medium|Low",
    "type": "improvement|addition|removal|rewrite",
    "applied": false,
    "createdAt": "ISO date"
  }
]

Rules:
- Be specific and actionable
- Focus on ATS optimization for DanJobs
- Include keyword improvements
- Suggest quantifiable metrics where possible`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume optimizer for DanJobs. Always respond with valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('Empty response from AI');

      const recommendations: AIRecommendation[] = JSON.parse(content);
      
      this.setCache(cacheKey, recommendations);
      return recommendations;
    } catch (error: any) {
      console.error('Recommendation Error:', error);
      return this.getFallbackRecommendations();
    }
  }

  private getFallbackRecommendations(): AIRecommendation[] {
    return [
      {
        id: 'rec-1',
        section: 'summary',
        field: 'content',
        current: '',
        suggested: 'Add a compelling professional summary highlighting your key achievements and skills.',
        reason: 'A professional summary helps ATS systems understand your profile quickly.',
        priority: 'Critical',
        type: 'addition',
        applied: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rec-2',
        section: 'experience',
        field: 'achievements',
        current: '',
        suggested: 'Add quantifiable achievements using metrics (%, $, numbers).',
        reason: 'Quantifiable results significantly improve ATS scoring on DanJobs.',
        priority: 'High',
        type: 'improvement',
        applied: false,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  // ============================================
  // BULLET POINT OPTIMIZATION
  // ============================================

  async optimizeBulletPoint(
    bulletPoint: string,
    context?: {
      jobTitle?: string;
      company?: string;
      industry?: string;
    }
  ): Promise<string> {
    try {
      const prompt = `Transform this resume bullet point to be more impactful and ATS-friendly for DanJobs.

Original: "${bulletPoint}"
${context?.jobTitle ? `Job Title: ${context.jobTitle}` : ''}
${context?.industry ? `Industry: ${context.industry}` : ''}

Rules:
- Start with a strong action verb
- Include quantifiable results where possible
- Be specific and achievement-focused
- Keep it concise (1-2 lines)
- Use industry-relevant keywords
- Return ONLY the improved bullet point`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at writing resume bullet points for DanJobs.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      return response.choices[0].message.content?.trim() || bulletPoint;
    } catch (error: any) {
      console.error('Bullet Point Optimization Error:', error);
      return bulletPoint;
    }
  }

  async optimizeMultipleBullets(
    bulletPoints: string[],
    context?: any
  ): Promise<string[]> {
    const optimized = await Promise.all(
      bulletPoints.map(point => this.optimizeBulletPoint(point, context))
    );
    return optimized;
  }

  // ============================================
  // PROFESSIONAL SUMMARY GENERATION
  // ============================================

  async generateSummary(
    experiences: WorkExperience[],
    skills: string[],
    targetRole?: string
  ): Promise<string> {
    try {
      const experienceSummary = experiences
        .map(exp => `${exp.position} at ${exp.company}: ${exp.description}`)
        .join('\n');

      const prompt = `Generate a compelling professional summary for a resume on DanJobs.

Target Role: ${targetRole || 'Professional'}
Key Skills: ${skills.join(', ')}
Experience:
${experienceSummary}

Requirements:
- 3-4 sentences maximum
- Include years of experience
- Highlight key achievements
- Mention core competencies
- Use industry keywords
- Be specific and impactful
- Return ONLY the summary text`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume writer specializing in professional summaries for DanJobs.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      return response.choices[0].message.content?.trim() || '';
    } catch (error: any) {
      console.error('Summary Generation Error:', error);
      return 'Experienced professional with a proven track record of delivering results. Seeking to leverage skills and experience in a challenging new role.';
    }
  }

  // ============================================
  // SKILL EXTRACTION
  // ============================================

  async extractSkills(text: string): Promise<{
    technical: string[];
    soft: string[];
    tools: string[];
  }> {
    try {
      const prompt = `Extract and categorize all skills from this text for DanJobs resume.

Text: ${text}

Return in JSON format:
{
  "technical": string[],
  "soft": string[],
  "tools": string[]
}

Rules:
- Be comprehensive
- Standardize skill names
- Remove duplicates
- Group similar skills`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at skill identification. Always respond with valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      return content ? JSON.parse(content) : { technical: [], soft: [], tools: [] };
    } catch (error: any) {
      console.error('Skill Extraction Error:', error);
      return { technical: [], soft: [], tools: [] };
    }
  }

  // ============================================
  // JOB MATCHING
  // ============================================

  async matchJob(
    resumeData: ResumeSections,
    jobDescription: JobDescription
  ): Promise<JobMatchResult> {
    try {
      const resumeText = this.sectionsToText(resumeData);

      const prompt = `Compare this resume against the job description for DanJobs and provide a match analysis.

Job Description:
Title: ${jobDescription.title}
Company: ${jobDescription.company}
Requirements: ${jobDescription.requirements.join(', ')}
Keywords: ${jobDescription.keywords.join(', ')}

Resume:
${resumeText}

Return in JSON format:
{
  "overallScore": number (0-100),
  "keywordMatch": number (0-100),
  "skillsMatch": number (0-100),
  "experienceMatch": number (0-100),
  "missingKeywords": string[],
  "recommendations": [
    {
      "id": "string",
      "section": "string",
      "field": "string",
      "current": "string",
      "suggested": "string",
      "reason": "string",
      "priority": "Critical|High|Medium|Low",
      "type": "improvement|addition",
      "applied": false,
      "createdAt": "ISO date"
    }
  ]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert job matching analyzer for DanJobs. Always respond with valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('Empty response from AI');

      return JSON.parse(content);
    } catch (error: any) {
      console.error('Job Matching Error:', error);
      return {
        overallScore: 50,
        keywordMatch: 50,
        skillsMatch: 50,
        experienceMatch: 50,
        missingKeywords: [],
        recommendations: [],
      };
    }
  }

  // ============================================
  // AI CHAT ASSISTANT
  // ============================================

  async chat(
    messages: AIChatMessage[],
    resumeContext?: string
  ): Promise<string> {
    try {
      const systemPrompt = `You are an expert resume writing assistant for DanJobs. 
${resumeContext ? `Current resume context:\n${resumeContext}\n` : ''}
Help the user improve their resume with specific, actionable advice.
Be concise, professional, and focused on ATS optimization.`;

      const chatMessages: any[] = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0].message.content || 'I apologize, but I could not generate a response.';
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      return 'I apologize, but I encountered an error. Please try again.';
    }
  }

  // ============================================
  // GRAMMAR & SPELL CHECK
  // ============================================

  async checkGrammar(text: string): Promise<{
    corrected: string;
    errors: Array<{ original: string; corrected: string; explanation: string }>;
  }> {
    try {
      const prompt = `Check this text for grammar and spelling errors. 
Return the corrected version and list of errors.

Text: ${text}

Return in JSON format:
{
  "corrected": "corrected text",
  "errors": [
    {
      "original": "original text",
      "corrected": "corrected text",
      "explanation": "brief explanation"
    }
  ]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert proofreader for DanJobs. Always respond with valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      return content ? JSON.parse(content) : { corrected: text, errors: [] };
    } catch (error: any) {
      console.error('Grammar Check Error:', error);
      return { corrected: text, errors: [] };
    }
  }

  // ============================================
  // FULL ANALYSIS
  // ============================================

  async fullAnalysis(
    resumeText: string,
    jobDescription?: string
  ): Promise<AIAnalysis> {
    try {
      const [score, recommendations] = await Promise.all([
        this.analyzeATS(resumeText, jobDescription),
        this.getRecommendations(resumeText, 
          await this.analyzeATS(resumeText, jobDescription)
        ),
      ]);

      const skills = await this.extractSkills(resumeText);

      return {
        score,
        recommendations,
        enhancedContent: {
          skills: {
            technical: skills.technical.map(s => ({
              name: s,
              level: 'Intermediate' as const,
              category: 'Technical',
            })),
            soft: skills.soft.map(s => ({
              name: s,
              level: 'Intermediate' as const,
              category: 'Soft Skills',
            })),
            languages: [],
            tools: skills.tools.map(s => ({
              name: s,
              level: 'Intermediate' as const,
              category: 'Tools',
            })),
            other: [],
          },
        },
        keywords: [...skills.technical, ...skills.soft, ...skills.tools],
      };
    } catch (error: any) {
      console.error('Full Analysis Error:', error);
      throw error;
    }
  }

  // ============================================
  // UTILITY
  // ============================================

  private sectionsToText(sections: ResumeSections): string {
    let text = '';

    if (sections.summary?.content) {
      text += `Summary: ${sections.summary.content}\n\n`;
    }

    if (sections.experience?.length) {
      text += 'Experience:\n';
      sections.experience.forEach(exp => {
        text += `${exp.position} at ${exp.company}\n`;
        text += `${exp.description}\n`;
        if (exp.achievements?.length) {
          exp.achievements.forEach(ach => {
            text += `- ${ach}\n`;
          });
        }
        text += '\n';
      });
    }

    if (sections.skills) {
      const allSkills = [
        ...(sections.skills.technical || []).map(s => s.name),
        ...(sections.skills.soft || []).map(s => s.name),
        ...(sections.skills.tools || []).map(s => s.name),
      ];
      text += `Skills: ${allSkills.join(', ')}\n`;
    }

    return text;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export default AIService;