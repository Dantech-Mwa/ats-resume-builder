// ============================================
// INSTITUTIONAL-GRADE ATS SCORING ENGINE
// Local scoring + AI enhancement = Consistent results
// ============================================

import {
  ATSScore,
  AIRecommendation,
  WorkExperience,
  AIChatMessage,
} from '../lib/types';

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || '';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

// ============================================
// INDUSTRY-SPECIFIC SCORING PROFILES
// ============================================

export interface IndustryProfile {
  requiredSections: string[];
  criticalKeywords: string[];
  weightOverrides: Record<string, number>;
  minWordCount: number;
  expectedFormats: string[];
}

export const INDUSTRY_PROFILES: Record<string, IndustryProfile> = {
  technology: {
    requiredSections: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
    criticalKeywords: ['agile', 'scrum', 'api', 'cloud', 'ci/cd', 'git', 'docker', 'kubernetes'],
    weightOverrides: { skillsRelevance: 0.30, keywordOptimization: 0.25 },
    minWordCount: 400,
    expectedFormats: ['pdf', 'docx'],
  },
  finance: {
    requiredSections: ['summary', 'experience', 'education', 'certifications', 'licenses'],
    criticalKeywords: ['financial analysis', 'risk management', 'compliance', 'audit', 'forecasting'],
    weightOverrides: { quantifiableResults: 0.25, keywordOptimization: 0.20 },
    minWordCount: 500,
    expectedFormats: ['pdf'],
  },
  healthcare: {
    requiredSections: ['summary', 'experience', 'education', 'licenses', 'certifications', 'clinical'],
    criticalKeywords: ['patient care', 'clinical', 'hipaa', 'emr', 'diagnostics'],
    weightOverrides: { sectionCompleteness: 0.30, keywordOptimization: 0.20 },
    minWordCount: 450,
    expectedFormats: ['pdf', 'docx'],
  },
  creative: {
    requiredSections: ['summary', 'experience', 'education', 'portfolio', 'projects'],
    criticalKeywords: ['portfolio', 'design', 'creative', 'branding', 'campaign'],
    weightOverrides: { contentQuality: 0.30, formattingScore: 0.20 },
    minWordCount: 300,
    expectedFormats: ['pdf'],
  },
  executive: {
    requiredSections: ['summary', 'experience', 'education', 'board', 'achievements', 'publications'],
    criticalKeywords: ['leadership', 'strategy', 'executive', 'board', 'revenue', 'transformation'],
    weightOverrides: { quantifiableResults: 0.30, actionVerbs: 0.20 },
    minWordCount: 600,
    expectedFormats: ['pdf'],
  },
};

// ============================================
// ATS KEYWORD DATABASE & VERBS
// ============================================

const ATS_KEYWORDS: Record<string, string[]> = {
  technology: ['agile', 'scrum', 'sdlc', 'api', 'cloud', 'devops', 'ci/cd', 'microservices', 'full stack', 'machine learning', 'data science'],
  finance: ['financial analysis', 'risk management', 'portfolio', 'audit', 'compliance', 'forecasting', 'budgeting', 'reconciliation'],
  healthcare: ['patient care', 'clinical', 'hipaa', 'emr', 'ehr', 'diagnostics', 'treatment', 'pharmaceutical'],
  marketing: ['seo', 'sem', 'content strategy', 'branding', 'campaign', 'analytics', 'social media', 'lead generation'],
  sales: ['business development', 'lead generation', 'crm', 'pipeline', 'negotiation', 'account management', 'revenue growth'],
  education: ['curriculum', 'instructional design', 'assessment', 'accreditation', 'pedagogy', 'e-learning'],
  engineering: ['cad', 'prototyping', 'testing', 'qa', 'manufacturing', 'design', 'specifications', 'compliance'],
  general: ['leadership', 'project management', 'communication', 'teamwork', 'problem solving', 'analytical', 'strategic', 'innovation'],
};

const ACTION_VERBS = [
  'achieved', 'led', 'developed', 'implemented', 'managed', 'created', 'designed',
  'increased', 'reduced', 'improved', 'optimized', 'streamlined', 'launched',
  'directed', 'coordinated', 'spearheaded', 'orchestrated', 'delivered', 'executed',
  'transformed', 'accelerated', 'maximized', 'generated', 'established', 'pioneered',
];

const MEASURABLE_PATTERNS = [
  /\d+%/g,
  /\$\d+[kKmM]?/g,
  /\d+\s*(?:people|staff|team|clients|customers|users)/gi,
  /\d+x/gi,
  /\d+\s*(?:hours|days|weeks|months|years)/gi,
  /increased|reduced|improved|saved|generated|grew/gi,
];

// ============================================
// FORMAT VALIDATOR
// ============================================

export class FormatValidator {
  static validate(text: string): {
    issues: string[];
    score: number;
    recommendations: string[];
  } {
    const issues: string[] = [];

    if (/[📊📈🎯💼🔥⭐✅❌]/u.test(text)) issues.push('Emojis detected - ATS cannot parse emojis cleanly.');
    if (/[│┌┐└┘├┤┬┴┼]/u.test(text)) issues.push('Table characters detected - ATS parsers often scramble table structures.');
    if (/<[^>]+>/.test(text)) issues.push('HTML tags detected - strip raw code before parsing.');
    if (/\t/.test(text)) issues.push('Tab characters detected - prefer standard spacing for line balance.');
    if (/[^\x00-\x7F\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026\u00A9\u00AE\u2122]/.test(text)) {
      issues.push('Unusual Unicode characters detected - may disrupt character extraction.');
    }

    return {
      issues,
      score: Math.max(0, 100 - (issues.length * 15)),
      recommendations: issues.map(i => `Fix formatting: ${i}`),
    };
  }
}

// ============================================
// DEEP SECTION ANALYZER
// ============================================

export interface SectionAnalysis {
  name: string;
  present: boolean;
  score: number;
  wordCount: number;
  bulletPoints: number;
  metrics: number;
  issues: string[];
  suggestions: string[];
}

export class DeepSectionAnalyzer {
  static analyzeAllSections(text: string): SectionAnalysis[] {
    const sections = this.extractSections(text);
    return sections.map(section => this.analyzeSection(section));
  }

  private static extractSections(text: string): { name: string; content: string }[] {
    const sections: { name: string; content: string }[] = [];

    const patterns: Record<string, RegExp> = {
      contact: /^(.+?)(?=\n(?:SUMMARY|PROFESSIONAL|OBJECTIVE|EXPERIENCE|EDUCATION|SKILLS))/is,
      summary: /(?:SUMMARY|PROFESSIONAL\s+SUMMARY|OBJECTIVE)(.+?)(?=\n(?:EXPERIENCE|EMPLOYMENT|WORK|EDUCATION|SKILLS))/is,
      experience: /(?:EXPERIENCE|EMPLOYMENT|WORK\s+HISTORY)(.+?)(?=\n(?:EDUCATION|SKILLS|CERTIFICATION|PROJECT))/is,
      education: /(?:EDUCATION|ACADEMIC)(.+?)(?=\n(?:SKILLS|CERTIFICATION|PROJECT|LANGUAGE))/is,
      skills: /(?:SKILLS|TECHNOLOGIES|COMPETENCIES)(.+?)(?=\n(?:CERTIFICATION|PROJECT|LANGUAGE|AWARD))/is,
    };

    for (const [name, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        sections.push({ name, content: match[1]?.trim() || match[0]?.trim() || '' });
      }
    }

    return sections;
  }

  private static analyzeSection(section: { name: string; content: string }): SectionAnalysis {
    const content = section.content;
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const bullets = (content.match(/[•\-*●○▪▫]/g) || []).length;
    const metrics = (content.match(/\d+%|\$\d+|\d+x|\d+\s*(?:people|users|clients)/gi) || []).length;

    const issues: string[] = [];
    const suggestions: string[] = [];

    switch (section.name) {
      case 'summary':
        if (words.length < 20) issues.push('Summary too short (aim for 30-80 words).');
        if (words.length > 150) issues.push('Summary too long (keep under 100 words).');
        if (!/\b(?:years|experience|skilled|expertise|background)\b/i.test(content)) {
          suggestions.push('Include explicitly stated years of domain expertise in summary.');
        }
        break;
      case 'experience':
        if (bullets < 3) issues.push('Add more bullet points per role (3-7 ideal).');
        if (metrics < 2) suggestions.push('Add quantifiable metrics (%, $, numbers) in experience section.');
        if (!ACTION_VERBS.some(v => content.toLowerCase().includes(v))) {
          suggestions.push('Start bullet points in work history with distinct action verbs.');
        }
        break;
      case 'skills':
        if (words.length < 5) issues.push('List more skills (aim for 10-20 keywords).');
        if (!content.includes(',')) suggestions.push('Separate skills with clear separators like commas for clean indexing.');
        break;
    }

    let score = 100;
    score -= issues.length * 15;
    score -= (3 - Math.min(3, metrics)) * 10;
    if (words.length < 10) score -= 20;

    return {
      name: section.name,
      present: true,
      score: Math.max(0, score),
      wordCount: words.length,
      bulletPoints: bullets,
      metrics,
      issues,
      suggestions,
    };
  }
}

// ============================================
// COMPETITIVE BENCHMARKING
// ============================================

export interface BenchmarkData {
  industry: string;
  role: string;
  avgScore: number;
  topQuartileScore: number;
  commonKeywords: string[];
  missingKeywords: string[];
  gapAnalysis: string[];
}

export class CompetitiveBenchmarker {
  private static benchmarks: Record<string, BenchmarkData> = {
    'software-engineer': {
      industry: 'technology',
      role: 'Software Engineer',
      avgScore: 72,
      topQuartileScore: 88,
      commonKeywords: ['react', 'node.js', 'python', 'aws', 'docker', 'kubernetes', 'microservices'],
      missingKeywords: [],
      gapAnalysis: [],
    },
    'data-scientist': {
      industry: 'technology',
      role: 'Data Scientist',
      avgScore: 75,
      topQuartileScore: 90,
      commonKeywords: ['python', 'machine learning', 'sql', 'tensorflow', 'pytorch', 'statistics'],
      missingKeywords: [],
      gapAnalysis: [],
    },
  };

  static compare(resumeText: string, targetRole: string): BenchmarkData {
    const key = targetRole.toLowerCase().replace(/\s+/g, '-');
    const template = this.benchmarks[key] || {
      industry: 'general',
      role: targetRole,
      avgScore: 68,
      topQuartileScore: 85,
      commonKeywords: ['leadership', 'collaboration', 'strategy', 'execution'],
      missingKeywords: [],
      gapAnalysis: [],
    };

    const missingKeywords = template.commonKeywords.filter(
      kw => !resumeText.toLowerCase().includes(kw)
    );

    const gapAnalysis = missingKeywords.map(
      kw => `Missing benchmark keyword: "${kw}" (commonly found in top-quartile ${template.role} resumes).`
    );

    return {
      ...template,
      missingKeywords,
      gapAnalysis,
    };
  }
}

// ============================================
// SCORE CONSISTENCY ENGINE
// ============================================

export class ScoreConsistencyEngine {
  private scoreHistory: Map<string, number[]> = new Map();

  private hashText(text: string): string {
    let hash = 0;
    for (let i = 0; i < Math.min(text.length, 1000); i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  getConsistentScore(text: string, newScore: number): number {
    const hash = this.hashText(text);

    if (!this.scoreHistory.has(hash)) {
      this.scoreHistory.set(hash, []);
    }

    const history = this.scoreHistory.get(hash)!;
    history.push(newScore);

    if (history.length > 5) history.shift();
    if (history.length === 1) return history[0];

    const weightedSum = history.reduce((sum, score, i) => {
      const weight = (i + 1) / history.length;
      return sum + score * weight;
    }, 0);

    const totalWeight = history.reduce((sum, _, i) => sum + (i + 1) / history.length, 0);

    return Math.round(weightedSum / totalWeight);
  }

  getScoreTrend(text: string): 'improving' | 'declining' | 'stable' {
    const hash = this.hashText(text);
    const history = this.scoreHistory.get(hash) || [];

    if (history.length < 2) return 'stable';

    const first = history[0];
    const last = history[history.length - 1];
    const diff = last - first;

    if (diff > 3) return 'improving';
    if (diff < -3) return 'declining';
    return 'stable';
  }
}

// ============================================
// BASE ATS SCORING ENGINE
// ============================================

class ATSScoringEngine {
  static scoreResume(text: string, industryKey?: string): ATSScore {
  const normalizedText = text.toLowerCase();
  const profile = industryKey ? INDUSTRY_PROFILES[industryKey] : null;

  const keywordScore = this.scoreKeywords(normalizedText, profile);
  const formattingScore = this.scoreFormatting(text);
  const contentScore = this.scoreContent(text);
  const sectionScore = this.scoreSections(normalizedText, profile);
  const verbScore = this.scoreActionVerbs(normalizedText);
  const quantifiableScore = this.scoreQuantifiable(normalizedText);
  const grammarScore = this.scoreGrammar(text);
  const contactScore = this.scoreContact(text);

  // Define default component scores map
  const scores: Record<string, number> = {
    keywordOptimization: keywordScore,
    formattingScore: formattingScore,
    contentQuality: contentScore,
    sectionCompleteness: sectionScore,
    actionVerbs: verbScore,
    quantifiableResults: quantifiableScore,
    grammarAndSpelling: grammarScore,
    contactInfoQuality: contactScore,
    skillsRelevance: keywordScore,
    overallReadability: contentScore,
  };

  // Base weights map
  let weights: Record<string, number> = {
    keywordOptimization: 0.20,
    formattingScore: 0.10,
    contentQuality: 0.10,
    sectionCompleteness: 0.15,
    actionVerbs: 0.10,
    quantifiableResults: 0.10,
    grammarAndSpelling: 0.05,
    contactInfoQuality: 0.05,
    skillsRelevance: 0.10,
    overallReadability: 0.05,
  };

  // Safely apply overrides
  if (profile?.weightOverrides) {
    weights = { ...weights, ...profile.weightOverrides };
  }

  // Calculate sum of weights safely
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + (Number(w) || 0), 0);

  // Compute weighted sum dynamic loop (prevents manual NaN additions)
  let rawSum = 0;
  for (const [key, weight] of Object.entries(weights)) {
    const componentScore = scores[key] ?? 50; // Fallback to 50 if key missing
    const normalizedWeight = totalWeight > 0 ? (weight / totalWeight) : 0;
    rawSum += componentScore * normalizedWeight;
  }

  const overallCalculated = Math.round(rawSum);
  const overall = isNaN(overallCalculated) ? 50 : Math.min(100, Math.max(0, overallCalculated));

  return {
    overall,
    breakdown: {
      keywordOptimization: keywordScore,
      formattingScore,
      contentQuality: contentScore,
      sectionCompleteness: sectionScore,
      actionVerbs: verbScore,
      quantifiableResults: quantifiableScore,
      grammarAndSpelling: grammarScore,
      contactInfoQuality: contactScore,
      skillsRelevance: keywordScore,
      overallReadability: contentScore,
    },
    missingKeywords: this.getMissingKeywords(normalizedText, profile),
    improvementTips: this.getImprovementTips(text, overall),
    criticalIssues: this.getCriticalIssues(text),
    analyzedAt: new Date().toISOString(),
  };
} 

  private static scoreKeywords(text: string, profile?: IndustryProfile | null): number {
    let found = 0;
    let total = 0;

    const categories = profile
      ? { target: profile.criticalKeywords, ...ATS_KEYWORDS }
      : ATS_KEYWORDS;

    for (const list of Object.values(categories)) {
      for (const keyword of list) {
        total++;
        if (text.includes(keyword.toLowerCase())) found++;
      }
    }

    return Math.round((found / Math.max(1, total)) * 100);
  }

  private static scoreFormatting(text: string): number {
    let score = 100;

    if (text.includes('•') || text.includes('●')) score += 5;
    if (text.length < 500) score -= 20;
    if (text.length > 5000) score -= 10;
    if (/\n{3,}/.test(text)) score -= 10;
    if (/[^\x00-\x7F]/.test(text)) score -= 15;
    if (/[{}]/.test(text)) score -= 20;

    return Math.min(100, Math.max(0, score));
  }

  private static scoreContent(text: string): number {
    let score = 50;
    const lines = text.split('\n').filter(l => l.trim());

    if (lines.length > 20) score += 15;
    if (text.split(' ').length > 200) score += 10;

    const uniqueWords = new Set(text.toLowerCase().split(/\s+/));
    if (uniqueWords.size > 100) score += 15;

    const wordCount: Record<string, number> = {};
    text.toLowerCase().split(/\s+/).forEach(w => { wordCount[w] = (wordCount[w] || 0) + 1; });
    const repeatedWords = Object.values(wordCount).filter(c => c > 10).length;
    if (repeatedWords > 5) score -= 10;

    return Math.min(100, Math.max(0, score));
  }

  private static scoreSections(text: string, profile?: IndustryProfile | null): number {
    const requiredSections = profile?.requiredSections.map(s => new RegExp(s, 'i')) || [
      /(?:summary|objective|profile|about)/i,
      /(?:experience|employment|work)/i,
      /(?:education|academic|university|college)/i,
      /(?:skills?|technologies|competencies)/i,
    ];

    let found = 0;
    for (const section of requiredSections) {
      if (section.test(text)) found++;
    }

    return Math.round((found / Math.max(1, requiredSections.length)) * 100);
  }

  private static scoreActionVerbs(text: string): number {
    let count = 0;
    const words = text.toLowerCase().split(/\s+/);

    for (const word of words) {
      if (ACTION_VERBS.includes(word)) count++;
    }

    const density = (count / Math.max(1, words.length)) * 100;
    return Math.min(100, Math.round(density * 20));
  }

  private static scoreQuantifiable(text: string): number {
    let matches = 0;

    for (const pattern of MEASURABLE_PATTERNS) {
      const found = text.match(pattern);
      if (found) matches += found.length;
    }

    if (matches === 0) return 20;
    if (matches <= 3) return 50;
    if (matches <= 6) return 75;
    return 95;
  }

  private static scoreGrammar(text: string): number {
    let score = 80;

    if (/[A-Z]{4,}/.test(text) && !/[A-Z]{2,3}\b/.test(text)) score -= 10;
    if (/\.\s+[a-z]/.test(text)) score -= 15;
    if (/\s{2,}/.test(text)) score -= 5;
    if (/,,+/.test(text)) score -= 10;

    return Math.min(100, Math.max(0, score));
  }

  private static scoreContact(text: string): number {
    let score = 0;

    if (/[\w\.-]+@[\w\.-]+\.\w{2,}/.test(text)) score += 40;
    if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)) score += 30;
    if (/linkedin\.com/i.test(text)) score += 15;
    if (/github\.com/i.test(text)) score += 15;

    return Math.min(100, score);
  }

  private static getMissingKeywords(text: string, profile?: IndustryProfile | null): string[] {
    const missing: string[] = [];
    const pool = profile ? profile.criticalKeywords : Object.values(ATS_KEYWORDS).flat();

    for (const keyword of pool) {
      if (!text.includes(keyword.toLowerCase()) && !missing.includes(keyword)) {
        missing.push(keyword);
      }
    }

    return missing.slice(0, 10);
  }

  private static getImprovementTips(text: string, score: number): string[] {
    const tips: string[] = [];

    if (score < 40) {
      tips.push('Add a professional summary section.');
      tips.push('Include work experience with bullet points.');
      tips.push('Add clear education details.');
      tips.push('List technical and core soft skills.');
    }

    if (!/\d+%/.test(text) && !/\$\d+/.test(text)) {
      tips.push('Add quantifiable achievements with percentages or monetary amounts.');
    }

    if (!ACTION_VERBS.some(v => text.toLowerCase().includes(v))) {
      tips.push('Start bullet points with strong action verbs (Led, Developed, Implemented).');
    }

    if (!/certification|certificate/i.test(text)) {
      tips.push('Add a certifications section if applicable.');
    }

    if (!/linkedin\.com/i.test(text)) {
      tips.push('Add your LinkedIn profile URL.');
    }

    if (text.length < 1000) {
      tips.push('Expand resume content—aim for at least 300-500 words.');
    }

    return tips.slice(0, 8);
  }

  private static getCriticalIssues(text: string): string[] {
    const issues: string[] = [];

    if (!/[\w\.-]+@[\w\.-]+\.\w{2,}/.test(text)) {
      issues.push('No email address found—critical for recruiter outreach.');
    }
    if (!/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)) {
      issues.push('No contact phone number detected.');
    }
    if (text.length < 300) {
      issues.push('Resume content length is too short for meaningful analysis.');
    }
    if (!/(?:experience|employment|work)/i.test(text)) {
      issues.push('No work experience section detected.');
    }

    return issues;
  }
}

// ============================================
// AI SERVICE MAIN
// ============================================

class AIService {
  private static instance: AIService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 10 * 60 * 1000;
  private consistencyEngine = new ScoreConsistencyEngine();

  private constructor() {
    console.log('🤖 ATS Engine: Local scoring ready, AI: ' + (GROQ_API_KEY || GEMINI_API_KEY ? '✅' : '⚠️ Fallback only'));
  }

  static getInstance(): AIService {
    if (!AIService.instance) AIService.instance = new AIService();
    return AIService.instance;
  }

  private async callGroq(prompt: string, systemPrompt: string, maxTokens: number, temperature: number, jsonMode: boolean): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
        temperature, max_tokens: maxTokens,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
    if (!response.ok) throw new Error(`Groq ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private async callGemini(prompt: string, systemPrompt: string, maxTokens: number, temperature: number): Promise<string> {
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
    if (!response.ok) throw new Error(`Gemini ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private async callAI(prompt: string, systemPrompt: string, maxTokens: number, temperature: number, jsonMode: boolean): Promise<string> {
    if (GROQ_API_KEY) {
      try { return await this.callGroq(prompt, systemPrompt, maxTokens, temperature, jsonMode); }
      catch (e: any) { console.warn('Groq failed:', e.message); }
    }
    if (GEMINI_API_KEY) {
      try { return await this.callGemini(prompt, systemPrompt, maxTokens, temperature); }
      catch (e: any) { console.warn('Gemini failed:', e.message); }
    }
    throw new Error('No AI available');
  }

  private normalizeScore(score: any): ATSScore {
    if (!score || typeof score !== 'object') return score;

    if (score.overall !== undefined && score.overall <= 1 && score.overall > 0) {
      score.overall = Math.round(score.overall * 100);
    }
    score.overall = Math.min(100, Math.max(0, Math.round(score.overall || 0)));

    if (score.breakdown) {
      for (const key of Object.keys(score.breakdown)) {
        if (score.breakdown[key] <= 1 && score.breakdown[key] > 0) {
          score.breakdown[key] = Math.round(score.breakdown[key] * 100);
        }
        score.breakdown[key] = Math.min(100, Math.max(0, Math.round(score.breakdown[key] || 0)));
      }
    }

    return score;
  }

  async analyzeATS(
    resumeText: string,
    jobDescription?: string,
    targetRole?: string,
    industryKey?: string
  ): Promise<ATSScore> {
    const formatCheck = FormatValidator.validate(resumeText);
    const localScore = ATSScoringEngine.scoreResume(resumeText, industryKey);
    const sectionAnalyses = DeepSectionAnalyzer.analyzeAllSections(resumeText);

    let benchmark: BenchmarkData | null = null;
    if (targetRole) {
      benchmark = CompetitiveBenchmarker.compare(resumeText, targetRole);
    }

    let aiScore: ATSScore | null = null;
    try {
      if (GROQ_API_KEY || GEMINI_API_KEY) {
        const prompt = `ATS Score this resume 0-100. Local score: ${localScore.overall}/100.
Format issues: ${JSON.stringify(formatCheck.issues)}
Section analysis: ${JSON.stringify(sectionAnalyses.map(s => ({ name: s.name, score: s.score })))}
${benchmark ? `Benchmark: ${benchmark.avgScore}/100 average for ${benchmark.role}` : ''}
Job description context: ${jobDescription || 'N/A'}

Resume text:
${resumeText}

Return JSON with overall, breakdown, missingKeywords, improvementTips, criticalIssues.`;

        const result = await this.callAI(prompt, 'You are an institutional ATS engine. Output JSON.', 1500, 0.3, true);
        aiScore = this.normalizeScore(JSON.parse(result));
      }
    } catch (e: any) {
      console.log('AI unavailable, falling back on analytical pipeline:', e.message);
    }

    let rawOverall: number;
    if (aiScore) {
      rawOverall = Math.round((localScore.overall * 0.5) + (aiScore.overall * 0.3) + (formatCheck.score * 0.2));
    } else {
      rawOverall = Math.round((localScore.overall * 0.7) + (formatCheck.score * 0.3));
    }

    const finalOverall = this.consistencyEngine.getConsistentScore(resumeText, rawOverall);

    return {
      overall: finalOverall,
      breakdown: localScore.breakdown,
      missingKeywords: [
        ...new Set([
          ...localScore.missingKeywords,
          ...(aiScore?.missingKeywords || []),
          ...(benchmark?.missingKeywords || []),
        ]),
      ],
      improvementTips: [
        ...formatCheck.recommendations,
        ...sectionAnalyses.flatMap(s => s.suggestions),
        ...localScore.improvementTips,
        ...(aiScore?.improvementTips || []),
        ...(benchmark?.gapAnalysis || []),
      ].slice(0, 12),
      criticalIssues: [
        ...formatCheck.issues,
        ...localScore.criticalIssues,
        ...(aiScore?.criticalIssues || []),
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  async getRecommendations(resumeText: string, score: ATSScore): Promise<AIRecommendation[]> {
    const localRecs: AIRecommendation[] = score.improvementTips.map((tip, i) => ({
      id: `local-${i}`,
      section: 'general',
      field: 'content',
      current: '',
      suggested: tip,
      reason: 'ATS optimization',
      priority: i < 2 ? 'Critical' : i < 4 ? 'High' : 'Medium',
      type: 'improvement' as const,
      applied: false,
      createdAt: new Date().toISOString(),
    }));

    try {
      const prompt = `ATS Score: ${score.overall}/100\nResume: ${resumeText}\n\nProvide 5 specific recommendations as JSON array: [{"id":"1","section":"summary","field":"content","current":"","suggested":"improved text","reason":"why","priority":"High","type":"improvement","applied":false,"createdAt":"now"}]`;
      const result = await this.callAI(prompt, 'Return JSON array.', 2000, 0.7, true);
      const aiRecs = JSON.parse(result);
      return [...aiRecs, ...localRecs.slice(0, 3)];
    } catch {
      return localRecs;
    }
  }

  async chat(messages: AIChatMessage[], resumeContext: string): Promise<string> {
    try {
      const lastMsg = messages[messages.length - 1]?.content || '';
      return await this.callAI(
        `Resume:\n${resumeContext}\n\nQuestion: ${lastMsg}\n\nGive specific, actionable resume advice. Be concise.`,
        'You are an expert career coach and ATS specialist.',
        800, 0.7, false
      );
    } catch {
      return `Based on my analysis:\n\n1. Add quantifiable achievements (%, $, numbers)\n2. Use strong action verbs (Led, Developed, Implemented)\n3. Include a professional summary\n4. Add relevant certifications\n5. Use industry keywords\n\nWhich section would you like me to help improve?`;
    }
  }

  async optimizeBulletPoint(bulletPoint: string): Promise<string> {
    try { return await this.callAI(`Rewrite this bullet point to be more impactful: "${bulletPoint}". Return ONLY the improved version.`, 'You are a resume writer.', 100, 0.7, false); }
    catch { return bulletPoint; }
  }

  async generateSummary(experiences: WorkExperience[], skills: string[]): Promise<string> {
    try { return await this.callAI(`Write a 3-sentence professional summary. Skills: ${skills.join(', ')}.`, 'Be concise.', 300, 0.7, false); }
    catch { return `Experienced professional skilled in ${skills.slice(0, 5).join(', ')} with a proven track record of delivering results.`; }
  }

  clearCache(): void { this.cache.clear(); }
}

export default AIService;
