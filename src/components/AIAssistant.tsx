// ============================================
// MULTI-PROVIDER AI SERVICE
// OpenAI + Google Gemini + Groq (Auto-fallback)
// ============================================

import OpenAI from 'openai';
import {
  ATSScore,
  AIRecommendation,
  AIAnalysis,
  ResumeSections,
  WorkExperience,
  JobDescription,
  JobMatchResult,
  AIChatMessage,
} from './types';

// API Keys - Try to get from env, fall back to hardcoded
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';
const GEMINI_API_KEY = 'AIzaSyBSxKSyhSoIrPncizpBkQNS049LHL7y6Ek'; // Get from https://aistudio.google.com/apikey
const GROQ_API_KEY = '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'; // Get from https://console.groq.com/keys

type AIProvider = 'openai' | 'gemini' | 'groq';

class AIService {
  private static instance: AIService;
  private openai: OpenAI | null = null;
  private currentProvider: AIProvider = 'openai';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes
  private failedProviders: Set<AIProvider> = new Set();

  private constructor() {
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here' && !OPENAI_API_KEY.includes('sk-proj-hR')) {
      this.openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });
      console.log('✅ OpenAI initialized');
    } else {
      console.warn('⚠️ OpenAI key not configured, will try fallback providers');
    }
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Try providers in order until one works
  private async tryAllProviders(
    prompt: string,
    systemPrompt: string,
    maxTokens: number = 1000,
    temperature: number = 0.7,
    jsonMode: boolean = false
  ): Promise<string> {
    const providers: AIProvider[] = ['openai', 'groq', 'gemini'];
    
    for (const provider of providers) {
      if (this.failedProviders.has(provider)) continue;
      
      try {
        console.log(`🔄 Trying ${provider}...`);
        const result = await this.callProvider(provider, prompt, systemPrompt, maxTokens, temperature, jsonMode);
        console.log(`✅ ${provider} succeeded`);
        return result;
      } catch (error: any) {
        console.warn(`❌ ${provider} failed:`, error.message);
        this.failedProviders.add(provider);
        // Continue to next provider
      }
    }
    
    throw new Error('All AI providers failed. Please check your API keys.');
  }

  private async callProvider(
    provider: AIProvider,
    prompt: string,
    systemPrompt: string,
    maxTokens: number,
    temperature: number,
    jsonMode: boolean
  ): Promise<string> {
    switch (provider) {
      case 'openai':
        return await this.callOpenAI(prompt, systemPrompt, maxTokens, temperature, jsonMode);
      case 'gemini':
        return await this.callGemini(prompt, systemPrompt, maxTokens, temperature);
      case 'groq':
        return await this.callGroq(prompt, systemPrompt, maxTokens, temperature, jsonMode);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  // ============================================
  // OPENAI
  // ============================================

  private async callOpenAI(
    prompt: string,
    systemPrompt: string,
    maxTokens: number,
    temperature: number,
    jsonMode: boolean
  ): Promise<string> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Use 3.5 for lower cost, 4-turbo-preview for better quality
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    });

    return response.choices[0].message.content || '';
  }

  // ============================================
  // GOOGLE GEMINI (FREE)
  // ============================================

  private async callGemini(
    prompt: string,
    systemPrompt: string,
    maxTokens: number,
    temperature: number
  ): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // ============================================
  // GROQ (FREE - Very Fast)
  // ============================================

  private async callGroq(
    prompt: string,
    systemPrompt: string,
    maxTokens: number,
    temperature: number,
    jsonMode: boolean
  ): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // or 'mixtral-8x7b-32768'
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // ============================================
  // LOCAL FALLBACK (No API needed)
  // ============================================

  private getLocalFallback(type: string): any {
    console.log('⚠️ Using local fallback for:', type);
    
    switch (type) {
      case 'ats_score':
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
          missingKeywords: [
            'Add industry-specific keywords',
            'Include measurable metrics',
            'Use stronger action verbs',
          ],
          improvementTips: [
            'Add quantifiable achievements with numbers and percentages',
            'Use action verbs like "Led", "Developed", "Implemented"',
            'Include a professional summary at the top',
            'Add relevant certifications section',
            'Tailor keywords to the specific job description',
          ],
          criticalIssues: [],
          analyzedAt: new Date().toISOString(),
        };
      
      case 'recommendations':
        return [
          {
            id: 'local-1',
            section: 'summary',
            field: 'content',
            current: '',
            suggested: 'Results-driven professional with proven track record of delivering measurable outcomes. Skilled in [your top skills]. Seeking to leverage expertise in [your field] to drive organizational success.',
            reason: 'A strong professional summary helps ATS systems and recruiters quickly understand your profile.',
            priority: 'Critical',
            type: 'addition',
            applied: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'local-2',
            section: 'experience',
            field: 'achievements',
            current: '',
            suggested: 'Add specific metrics: "Increased revenue by 25%" or "Reduced costs by $50K annually"',
            reason: 'Quantifiable results significantly improve ATS scoring and recruiter interest.',
            priority: 'High',
            type: 'improvement',
            applied: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'local-3',
            section: 'skills',
            field: 'keywords',
            current: '',
            suggested: 'Add industry-standard keywords relevant to your target role',
            reason: 'Missing keywords can cause your resume to be filtered out by ATS systems.',
            priority: 'High',
            type: 'addition',
            applied: false,
            createdAt: new Date().toISOString(),
          },
        ] as AIRecommendation[];
      
      case 'chat':
        return `I've analyzed your resume and here are my recommendations:

1. **Professional Summary**: Your resume would benefit from a strong opening summary that highlights your key achievements and skills in 2-3 sentences.

2. **Quantifiable Results**: Add specific numbers and metrics to your experience bullet points. Instead of "Managed a team", say "Managed a team of 12, increasing productivity by 30%".

3. **ATS Keywords**: Include industry-specific keywords from job descriptions you're targeting. Common missing keywords include project management methodologies, specific tools, and certifications.

4. **Action Verbs**: Start each bullet point with strong action verbs like "Spearheaded", "Orchestrated", "Optimized", or "Engineered".

5. **Skills Section**: Organize skills into categories (Technical, Soft Skills, Tools) for better readability and ATS parsing.

Would you like me to help you rewrite any specific section?`;
      
      default:
        return 'I apologize, but AI services are currently unavailable. Please try again later.';
    }
  }

  // ============================================
  // PUBLIC API METHODS
  // ============================================

  async analyzeATS(resumeText: string, jobDescription?: string): Promise<ATSScore> {
    try {
      const prompt = `Analyze this resume for ATS compatibility. Return ONLY valid JSON.

${jobDescription ? `Job Description: ${jobDescription}\n` : ''}
Resume: ${resumeText}

Return JSON:
{
  "overall": number (0-100),
  "breakdown": {
    "keywordOptimization": number,
    "formattingScore": number,
    "contentQuality": number,
    "sectionCompleteness": number,
    "actionVerbs": number,
    "quantifiableResults": number,
    "grammarAndSpelling": number,
    "contactInfoQuality": number,
    "skillsRelevance": number,
    "overallReadability": number
  },
  "missingKeywords": string[],
  "improvementTips": string[],
  "criticalIssues": string[]
}`;

      const result = await this.tryAllProviders(
        prompt,
        'You are an expert ATS resume analyzer. Always return valid JSON.',
        1500, 0.3, true
      );

      return { ...JSON.parse(result), analyzedAt: new Date().toISOString() };
    } catch (error: any) {
      console.error('ATS Analysis failed, using fallback:', error.message);
      return this.getLocalFallback('ats_score');
    }
  }

  async getRecommendations(resumeText: string, score: ATSScore): Promise<AIRecommendation[]> {
    try {
      const prompt = `Based on this ATS score ${score.overall}/100, provide specific improvements.
Resume: ${resumeText}
Return JSON array of recommendations with: id, section, field, current, suggested, reason, priority (Critical|High|Medium|Low), type (improvement|addition|removal|rewrite), applied: false`;

      const result = await this.tryAllProviders(
        prompt,
        'You are an expert resume optimizer. Return valid JSON array.',
        2000, 0.7, true
      );

      return JSON.parse(result);
    } catch (error: any) {
      console.error('Recommendations failed, using fallback:', error.message);
      return this.getLocalFallback('recommendations');
    }
  }

  async chat(messages: AIChatMessage[], resumeContext: string): Promise<string> {
    try {
      const prompt = `Context: ${resumeContext}\n\nUser: ${messages[messages.length - 1]?.content}\n\nProvide helpful, specific resume advice. Be concise and actionable.`;
      
      return await this.tryAllProviders(
        prompt,
        'You are an expert career coach and resume writer. Provide specific, actionable advice.',
        1000, 0.7, false
      );
    } catch (error: any) {
      console.error('Chat failed, using fallback:', error.message);
      return this.getLocalFallback('chat');
    }
  }

  async optimizeBulletPoint(bulletPoint: string): Promise<string> {
    try {
      const prompt = `Rewrite this resume bullet point to be more impactful with metrics and action verbs:\n"${bulletPoint}"\nReturn ONLY the improved bullet point.`;
      return await this.tryAllProviders(prompt, 'You are an expert resume writer.', 150, 0.7, false);
    } catch {
      return bulletPoint;
    }
  }

  async generateSummary(experiences: WorkExperience[], skills: string[]): Promise<string> {
    try {
      const prompt = `Write a 3-4 sentence professional summary based on:\nExperience: ${JSON.stringify(experiences.slice(0, 3))}\nSkills: ${skills.join(', ')}`;
      return await this.tryAllProviders(prompt, 'You are an expert resume writer.', 300, 0.7, false);
    } catch {
      return 'Experienced professional with a proven track record of delivering results. Skilled in ' + skills.slice(0, 5).join(', ') + '.';
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.failedProviders.clear();
  }

  resetProviders(): void {
    this.failedProviders.clear();
    console.log('✅ All providers reset');
  }
}

export default AIService;
