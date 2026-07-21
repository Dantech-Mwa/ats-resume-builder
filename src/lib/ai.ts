// ============================================
// MULTI-PROVIDER AI SERVICE - Production Ready
// OpenAI + Google Gemini + Groq with Auto-Fallback
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
} from '../lib/types';

// API Keys - From environment or hardcoded fallbacks
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || '';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

type AIProvider = 'openai' | 'gemini' | 'groq';

class AIService {
  private static instance: AIService;
  private openai: OpenAI | null = null;
  private failedProviders: Set<AIProvider> = new Set();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes

  private constructor() {
    if (OPENAI_API_KEY && OPENAI_API_KEY.length > 20 && !OPENAI_API_KEY.includes('your')) {
      try {
        this.openai = new OpenAI({
          apiKey: OPENAI_API_KEY,
          dangerouslyAllowBrowser: true,
        });
        console.log('✅ OpenAI initialized');
      } catch (e) {
        console.warn('⚠️ OpenAI init failed, will use fallbacks');
      }
    } else {
      console.warn('⚠️ OpenAI key not configured, using free providers');
    }
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // ============================================
  // SMART ROUTING - Try all providers
  // ============================================

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
      }
    }

    throw new Error('All AI providers failed');
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
      case 'openai': return await this.callOpenAI(prompt, systemPrompt, maxTokens, temperature, jsonMode);
      case 'gemini': return await this.callGemini(prompt, systemPrompt, maxTokens, temperature);
      case 'groq':   return await this.callGroq(prompt, systemPrompt, maxTokens, temperature, jsonMode);
      default: throw new Error(`Unknown provider: ${provider}`);
    }
  }

  // ============================================
  // OPENAI
  // ============================================

  private async callOpenAI(prompt: string, systemPrompt: string, maxTokens: number, temperature: number, jsonMode: boolean): Promise<string> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
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

  private async callGemini(prompt: string, systemPrompt: string, maxTokens: number, temperature: number): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    });

    if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // ============================================
  // GROQ (FREE - Very Fast)
  // ============================================

  private async callGroq(prompt: string, systemPrompt: string, maxTokens: number, temperature: number, jsonMode: boolean): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!response.ok) throw new Error(`Groq HTTP ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // ============================================
  // LOCAL FALLBACKS (Zero API calls)
  // ============================================

  private getFallbackScore(): ATSScore {
    return {
      overall: 65,
      breakdown: {
        keywordOptimization: 60, formattingScore: 70, contentQuality: 65,
        sectionCompleteness: 60, actionVerbs: 65, quantifiableResults: 55,
        grammarAndSpelling: 75, contactInfoQuality: 80, skillsRelevance: 65, overallReadability: 70,
      },
      missingKeywords: ['Industry-specific keywords', 'Measurable metrics', 'Action verbs'],
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
  }

  private getFallbackRecommendations(): AIRecommendation[] {
    return [
      { id: 'fb-1', section: 'summary', field: 'content', current: '', suggested: 'Results-driven professional with proven track record of delivering measurable outcomes.', reason: 'Strong summary helps ATS and recruiters.', priority: 'Critical', type: 'addition', applied: false, createdAt: new Date().toISOString() },
      { id: 'fb-2', section: 'experience', field: 'achievements', current: '', suggested: 'Add metrics: "Increased revenue by 25%" or "Reduced costs by $50K"', reason: 'Quantifiable results boost ATS score.', priority: 'High', type: 'improvement', applied: false, createdAt: new Date().toISOString() },
      { id: 'fb-3', section: 'skills', field: 'keywords', current: '', suggested: 'Add industry-standard keywords from job descriptions', reason: 'Missing keywords cause ATS filtering.', priority: 'High', type: 'addition', applied: false, createdAt: new Date().toISOString() },
    ];
  }

  private getFallbackChat(): string {
    return `Here are my resume recommendations:\n\n1. **Professional Summary**: Add 2-3 sentences highlighting achievements.\n2. **Quantifiable Results**: Add numbers (%, $, counts) to bullet points.\n3. **ATS Keywords**: Include terms from target job descriptions.\n4. **Action Verbs**: Start bullets with "Led", "Developed", "Optimized".\n5. **Skills Section**: Organize into Technical, Soft Skills, and Tools.\n\nWhich section would you like me to help with?`;
  }

  // ============================================
  // CACHE MANAGEMENT
  // ============================================

  private getCacheKey(fn: string, params: any): string {
    return `${fn}_${JSON.stringify(params).substring(0, 200)}`;
  }

  private getCache(key: string): any | null {
    const c = this.cache.get(key);
    return c && Date.now() - c.timestamp < this.cacheTimeout ? c.data : null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // ============================================
  // PUBLIC API - Called by AIAssistant & ResumeEditor
  // ============================================

  async analyzeATS(resumeText: string, jobDescription?: string): Promise<ATSScore> {
    const key = this.getCacheKey('ats', resumeText);
    const cached = this.getCache(key);
    if (cached) return cached;

    try {
      const prompt = `Analyze this resume for ATS compatibility. Return ONLY valid JSON with: overall (0-100), breakdown (keywordOptimization, formattingScore, contentQuality, sectionCompleteness, actionVerbs, quantifiableResults, grammarAndSpelling, contactInfoQuality, skillsRelevance, overallReadability), missingKeywords[], improvementTips[], criticalIssues[].\n\n${jobDescription ? 'Job: ' + jobDescription + '\n\n' : ''}Resume:\n${resumeText}`;

      const result = await this.tryAllProviders(prompt, 'You are an expert ATS analyzer. Return valid JSON.', 1500, 0.3, true);
      const score = { ...JSON.parse(result), analyzedAt: new Date().toISOString() };
      this.setCache(key, score);
      return score;
    } catch (e: any) {
      console.error('ATS fallback:', e.message);
      return this.getFallbackScore();
    }
  }

  async getRecommendations(resumeText: string, score: ATSScore): Promise<AIRecommendation[]> {
    try {
      const prompt = `ATS Score: ${score.overall}/100. Resume: ${resumeText}\n\nProvide 5-10 recommendations as JSON array with: id, section, field, current, suggested, reason, priority (Critical|High|Medium|Low), type (improvement|addition|removal|rewrite), applied: false, createdAt.`;
      const result = await this.tryAllProviders(prompt, 'You are a resume expert. Return JSON array.', 2000, 0.7, true);
      return JSON.parse(result);
    } catch (e: any) {
      console.error('Recommendations fallback:', e.message);
      return this.getFallbackRecommendations();
    }
  }

  async chat(messages: AIChatMessage[], resumeContext: string): Promise<string> {
    try {
      const lastMsg = messages[messages.length - 1]?.content || '';
      const prompt = `Resume Context:\n${resumeContext}\n\nUser Question: ${lastMsg}\n\nProvide specific, actionable resume advice. Be concise.`;
      return await this.tryAllProviders(prompt, 'You are an expert career coach. Give specific advice.', 1000, 0.7, false);
    } catch (e: any) {
      console.error('Chat fallback:', e.message);
      return this.getFallbackChat();
    }
  }

  async optimizeBulletPoint(bulletPoint: string): Promise<string> {
    try {
      return await this.tryAllProviders(`Rewrite: "${bulletPoint}"\nReturn ONLY the improved version with metrics and action verb.`, 'You are a resume writer.', 150, 0.7, false);
    } catch {
      return bulletPoint;
    }
  }

  async generateSummary(experiences: WorkExperience[], skills: string[]): Promise<string> {
    try {
      return await this.tryAllProviders(`Write a 3-4 sentence summary. Skills: ${skills.join(', ')}. Experience: ${JSON.stringify(experiences.slice(0, 3))}`, 'You are a resume writer.', 300, 0.7, false);
    } catch {
      return `Experienced professional skilled in ${skills.slice(0, 5).join(', ')} with a proven track record of delivering results.`;
    }
  }

  clearCache(): void { this.cache.clear(); this.failedProviders.clear(); }
  resetProviders(): void { this.failedProviders.clear(); console.log('✅ Providers reset'); }
}

export default AIService;
