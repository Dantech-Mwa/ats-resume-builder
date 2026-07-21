// ============================================
// BROWSER-NATIVE AI SERVICE - No Proxy Required
// Groq & Gemini support browser CORS natively
// ============================================

import {
  ATSScore,
  AIRecommendation,
  WorkExperience,
  AIChatMessage,
} from '../lib/types';

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || '';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

class AIService {
  private static instance: AIService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 10 * 60 * 1000;

  private constructor() {
    console.log('🤖 AI Service ready (Groq: ' + (GROQ_API_KEY ? '✅' : '❌') + ', Gemini: ' + (GEMINI_API_KEY ? '✅' : '❌') + ')');
  }

  static getInstance(): AIService {
    if (!AIService.instance) AIService.instance = new AIService();
    return AIService.instance;
  }

  // ============================================
  // GROQ - Native browser CORS support
  // ============================================

  private async callGroq(
    prompt: string,
    systemPrompt: string,
    maxTokens: number = 1000,
    temperature: number = 0.7,
    jsonMode: boolean = false
  ): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
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
      throw new Error(`Groq ${response.status}: ${err.substring(0, 150)}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // ============================================
  // GEMINI - Native browser CORS support
  // ============================================

  private async callGemini(
    prompt: string,
    systemPrompt: string,
    maxTokens: number = 1000,
    temperature: number = 0.7
  ): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
          generationConfig: { temperature, maxOutputTokens: maxTokens },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini ${response.status}: ${err.substring(0, 150)}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // ============================================
  // SMART ROUTING
  // ============================================

  private async tryProvider(
    prompt: string,
    systemPrompt: string,
    maxTokens: number,
    temperature: number,
    jsonMode: boolean
  ): Promise<string> {
    // Try Groq first (faster, better JSON)
    if (GROQ_API_KEY) {
      try {
        return await this.callGroq(prompt, systemPrompt, maxTokens, temperature, jsonMode);
      } catch (e: any) {
        console.warn('Groq failed:', e.message);
      }
    }

    // Fallback to Gemini
    if (GEMINI_API_KEY) {
      try {
        return await this.callGemini(prompt, systemPrompt, maxTokens, temperature);
      } catch (e: any) {
        console.warn('Gemini failed:', e.message);
      }
    }

    throw new Error('No API keys configured');
  }

  // ============================================
  // FALLBACKS
  // ============================================

  private getFallbackScore(): ATSScore {
    return {
      overall: 65,
      breakdown: {
        keywordOptimization: 60, formattingScore: 70, contentQuality: 65,
        sectionCompleteness: 60, actionVerbs: 65, quantifiableResults: 55,
        grammarAndSpelling: 75, contactInfoQuality: 80, skillsRelevance: 65, overallReadability: 70,
      },
      missingKeywords: ['Industry keywords', 'Measurable metrics'],
      improvementTips: ['Add numbers to achievements', 'Use action verbs', 'Add summary'],
      criticalIssues: [],
      analyzedAt: new Date().toISOString(),
    };
  }

  private getFallbackRecommendations(): AIRecommendation[] {
    return [
      { id: '1', section: 'summary', field: 'content', current: '', suggested: 'Add a professional summary.', reason: 'Helps ATS', priority: 'High', type: 'addition', applied: false, createdAt: new Date().toISOString() },
      { id: '2', section: 'experience', field: 'achievements', current: '', suggested: 'Add metrics to bullet points.', reason: 'Boosts score', priority: 'High', type: 'improvement', applied: false, createdAt: new Date().toISOString() },
    ];
  }

  private getFallbackChat(): string {
    return `Here's how to improve your resume:\n\n1. Add a 2-3 sentence professional summary\n2. Include numbers in achievements ("Increased sales 30%")\n3. Use action verbs (Led, Developed, Optimized)\n4. Add industry keywords from job descriptions\n\nWhich section should I help with?`;
  }

  // ============================================
  // CACHE
  // ============================================

  private getCacheKey(fn: string, p: any): string { return `${fn}_${JSON.stringify(p).substring(0, 100)}`; }
  private getCache(k: string): any { const c = this.cache.get(k); return c && Date.now() - c.timestamp < this.cacheTimeout ? c.data : null; }
  private setCache(k: string, d: any): void { this.cache.set(k, { data: d, timestamp: Date.now() }); }

  // ============================================
  // PUBLIC API
  // ============================================

  async analyzeATS(resumeText: string, jobDescription?: string): Promise<ATSScore> {
    try {
      const prompt = `Analyze this resume for ATS. Return JSON: {"overall": number, "breakdown": {"keywordOptimization": number, "formattingScore": number, "contentQuality": number, "sectionCompleteness": number, "actionVerbs": number, "quantifiableResults": number, "grammarAndSpelling": number, "contactInfoQuality": number, "skillsRelevance": number, "overallReadability": number}, "missingKeywords": string[], "improvementTips": string[], "criticalIssues": string[]}\n\nResume:\n${resumeText}`;
      const result = await this.tryProvider(prompt, 'Return valid JSON only.', 1500, 0.3, true);
      return { ...JSON.parse(result), analyzedAt: new Date().toISOString() };
    } catch (e: any) {
      console.error('ATS fallback:', e.message);
      return this.getFallbackScore();
    }
  }

  async getRecommendations(resumeText: string, score: ATSScore): Promise<AIRecommendation[]> {
    try {
      const prompt = `ATS Score: ${score.overall}/100\nResume: ${resumeText}\n\nReturn JSON array: [{"id":"1","section":"summary","field":"content","current":"","suggested":"improved text","reason":"why","priority":"High","type":"improvement","applied":false,"createdAt":"now"}]`;
      const result = await this.tryProvider(prompt, 'Return JSON array only.', 2000, 0.7, true);
      return JSON.parse(result);
    } catch (e: any) {
      console.error('Recs fallback:', e.message);
      return this.getFallbackRecommendations();
    }
  }

  async chat(messages: AIChatMessage[], resumeContext: string): Promise<string> {
    try {
      const lastMsg = messages[messages.length - 1]?.content || '';
      return await this.tryProvider(
        `Resume:\n${resumeContext}\n\nQuestion: ${lastMsg}\n\nGive specific resume advice. Be concise.`,
        'You are a career coach.',
        800, 0.7, false
      );
    } catch (e: any) {
      console.error('Chat fallback:', e.message);
      return this.getFallbackChat();
    }
  }

  async optimizeBulletPoint(bulletPoint: string): Promise<string> {
    try { return await this.tryProvider(`Rewrite: "${bulletPoint}"`, 'Return only the improved version.', 100, 0.7, false); }
    catch { return bulletPoint; }
  }

  async generateSummary(experiences: WorkExperience[], skills: string[]): Promise<string> {
    try { return await this.tryProvider(`Write summary. Skills: ${skills.join(', ')}.`, 'Be concise.', 300, 0.7, false); }
    catch { return `Experienced professional skilled in ${skills.slice(0, 5).join(', ')}.`; }
  }

  clearCache(): void { this.cache.clear(); }
}

export default AIService;
