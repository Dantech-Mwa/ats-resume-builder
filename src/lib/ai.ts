// ============================================
// CORS-FRIENDLY MULTI-PROVIDER AI SERVICE
// Uses free CORS proxy to bypass browser blocking
// ============================================

import {
  ATSScore,
  AIRecommendation,
  WorkExperience,
  AIChatMessage,
} from '../lib/types';

// API Keys - Add your keys as GitHub Secrets
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || '';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

// Free CORS Proxies (try in order)
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
];

type AIProvider = 'groq' | 'gemini';

class AIService {
  private static instance: AIService;
  private failedProviders: Set<AIProvider> = new Set();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 10 * 60 * 1000;
  private workingProxy: string | null = null;

  private constructor() {
    console.log('🤖 AI Service initialized (CORS-friendly mode)');
  }

  static getInstance(): AIService {
    if (!AIService.instance) AIService.instance = new AIService();
    return AIService.instance;
  }

  // ============================================
  // FIND WORKING PROXY
  // ============================================

  private async getWorkingProxy(): Promise<string> {
    if (this.workingProxy) return this.workingProxy;

    for (const proxy of CORS_PROXIES) {
      try {
        const testUrl = proxy + encodeURIComponent('https://api.groq.com/openai/v1/models');
        const res = await fetch(testUrl, {
          headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
        });
        if (res.ok) {
          this.workingProxy = proxy;
          console.log('✅ Working proxy:', proxy);
          return proxy;
        }
      } catch { continue; }
    }
    
    // Fallback: try without proxy (might work on some networks)
    this.workingProxy = '';
    return '';
  }

  // ============================================
  // SMART ROUTING WITH PROXY
  // ============================================

  private async tryAllProviders(
    prompt: string,
    systemPrompt: string,
    maxTokens: number = 1000,
    temperature: number = 0.7,
    jsonMode: boolean = false
  ): Promise<string> {
    const proxy = await this.getWorkingProxy();
    const providers: AIProvider[] = ['groq', 'gemini'];

    for (const provider of providers) {
      if (this.failedProviders.has(provider)) continue;

      try {
        console.log(`🔄 Trying ${provider}...`);
        const result = await this.callProviderWithProxy(provider, prompt, systemPrompt, maxTokens, temperature, jsonMode, proxy);
        console.log(`✅ ${provider} succeeded`);
        return result;
      } catch (error: any) {
        console.warn(`❌ ${provider} failed:`, error.message);
        this.failedProviders.add(provider);
      }
    }

    throw new Error('All AI providers failed');
  }

  private async callProviderWithProxy(
    provider: AIProvider,
    prompt: string,
    systemPrompt: string,
    maxTokens: number,
    temperature: number,
    jsonMode: boolean,
    proxy: string
  ): Promise<string> {
    switch (provider) {
      case 'groq': return await this.callGroqProxy(prompt, systemPrompt, maxTokens, temperature, jsonMode, proxy);
      case 'gemini': return await this.callGeminiProxy(prompt, systemPrompt, maxTokens, temperature, proxy);
      default: throw new Error(`Unknown provider: ${provider}`);
    }
  }

  // ============================================
  // GROQ VIA PROXY
  // ============================================

  private async callGroqProxy(
    prompt: string,
    systemPrompt: string,
    maxTokens: number,
    temperature: number,
    jsonMode: boolean,
    proxy: string
  ): Promise<string> {
    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    const url = proxy ? proxy + encodeURIComponent(apiUrl) : apiUrl;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        ...(proxy ? {} : { 'Origin': window.location.origin }),
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
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
      const err = await response.text();
      throw new Error(`Groq HTTP ${response.status}: ${err.substring(0, 200)}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // ============================================
  // GEMINI VIA PROXY
  // ============================================

  private async callGeminiProxy(
    prompt: string,
    systemPrompt: string,
    maxTokens: number,
    temperature: number,
    proxy: string
  ): Promise<string> {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const url = proxy ? proxy + encodeURIComponent(apiUrl) : apiUrl;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini HTTP ${response.status}: ${err.substring(0, 200)}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // ============================================
  // LOCAL FALLBACKS
  // ============================================

  private getFallbackScore(): ATSScore {
    return {
      overall: 65,
      breakdown: {
        keywordOptimization: 60, formattingScore: 70, contentQuality: 65,
        sectionCompleteness: 60, actionVerbs: 65, quantifiableResults: 55,
        grammarAndSpelling: 75, contactInfoQuality: 80, skillsRelevance: 65, overallReadability: 70,
      },
      missingKeywords: ['Industry keywords', 'Measurable metrics', 'Action verbs'],
      improvementTips: [
        'Add quantifiable achievements with numbers',
        'Use strong action verbs like Led, Developed, Implemented',
        'Include a professional summary',
        'Add certifications section if applicable',
        'Tailor keywords to target job description',
      ],
      criticalIssues: [],
      analyzedAt: new Date().toISOString(),
    };
  }

  private getFallbackRecommendations(): AIRecommendation[] {
    return [
      { id: 'fb-1', section: 'summary', field: 'content', current: '', suggested: 'Results-driven professional with proven track record.', reason: 'Strong summary helps ATS.', priority: 'Critical', type: 'addition', applied: false, createdAt: new Date().toISOString() },
      { id: 'fb-2', section: 'experience', field: 'achievements', current: '', suggested: 'Add metrics: "Increased revenue 25%"', reason: 'Quantifiable results boost score.', priority: 'High', type: 'improvement', applied: false, createdAt: new Date().toISOString() },
      { id: 'fb-3', section: 'skills', field: 'keywords', current: '', suggested: 'Add keywords from job descriptions', reason: 'Missing keywords cause ATS filtering.', priority: 'High', type: 'addition', applied: false, createdAt: new Date().toISOString() },
    ];
  }

  private getFallbackChat(): string {
    return `Here are my resume recommendations:\n\n1. **Professional Summary**: Add 2-3 sentences highlighting your key achievements.\n2. **Quantifiable Results**: Add numbers (%, $, counts) to your bullet points.\n3. **ATS Keywords**: Include industry terms from target job descriptions.\n4. **Action Verbs**: Start each bullet with strong verbs like "Led", "Developed", "Optimized".\n5. **Skills Section**: Organize into Technical, Soft Skills, and Tools categories.\n\nWhich section would you like me to help improve?`;
  }

  // ============================================
  // CACHE
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
  // PUBLIC API
  // ============================================

  async analyzeATS(resumeText: string, jobDescription?: string): Promise<ATSScore> {
    const key = this.getCacheKey('ats', resumeText);
    const cached = this.getCache(key);
    if (cached) return cached;

    try {
      const prompt = `Analyze this resume for ATS compatibility. Return ONLY valid JSON with: overall (0-100), breakdown (keywordOptimization, formattingScore, contentQuality, sectionCompleteness, actionVerbs, quantifiableResults, grammarAndSpelling, contactInfoQuality, skillsRelevance, overallReadability), missingKeywords[], improvementTips[], criticalIssues[].\n\n${jobDescription ? 'Job: ' + jobDescription + '\n\n' : ''}Resume:\n${resumeText}`;
      const result = await this.tryAllProviders(prompt, 'You are an ATS expert. Return valid JSON.', 1500, 0.3, true);
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
      const prompt = `ATS Score: ${score.overall}/100. Resume: ${resumeText}\n\nProvide 5-10 recommendations as JSON array with: id, section, field, current, suggested, reason, priority, type, applied:false, createdAt.`;
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
      const prompt = `Resume:\n${resumeContext}\n\nUser: ${lastMsg}\n\nGive specific, actionable resume advice. Be concise (under 300 words).`;
      return await this.tryAllProviders(prompt, 'You are a career coach. Give specific advice.', 800, 0.7, false);
    } catch (e: any) {
      console.error('Chat fallback:', e.message);
      return this.getFallbackChat();
    }
  }

  async optimizeBulletPoint(bulletPoint: string): Promise<string> {
    try {
      return await this.tryAllProviders(`Rewrite: "${bulletPoint}"\nReturn ONLY the improved version.`, 'You are a resume writer.', 150, 0.7, false);
    } catch { return bulletPoint; }
  }

  async generateSummary(experiences: WorkExperience[], skills: string[]): Promise<string> {
    try {
      return await this.tryAllProviders(`Write a 3-4 sentence summary. Skills: ${skills.join(', ')}.`, 'Be concise.', 300, 0.7, false);
    } catch { return `Experienced professional skilled in ${skills.slice(0, 5).join(', ')}.`; }
  }

  clearCache(): void { this.cache.clear(); this.failedProviders.clear(); this.workingProxy = null; }
}

export default AIService;
