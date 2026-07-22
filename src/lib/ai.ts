// src/lib/ai.ts
// ============================================
// WORLD-CLASS ATS SCORING ENGINE WITH ML INTEGRATION
// Auto-detects profession, industry, seniority
// Scores dynamically based on detected role
// Enhanced with ML parser for intelligent analysis
// ============================================

import {
  ATSScore,
  AIRecommendation,
  WorkExperience,
  AIChatMessage,
} from '../lib/types';
import { ResumeSections } from '../lib/types';
import ResumeParser from './parser';
import { MLResumeParser, TrainingExample, ParsingSuggestion } from './ml/MLResumeParser';

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || '';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

// ============================================
// UTILITY
// ============================================

function safeNumber(val: any, fallback = 50): number {
  const num = Number(val);
  if (!Number.isFinite(num) || Number.isNaN(num)) return fallback;
  return Math.min(100, Math.max(0, Math.round(num)));
}

function safeString(val: any, fallback: string = ''): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return val.toString();
  return fallback;
}

// ============================================
// GLOBAL PROFESSION DETECTOR
// 100+ professions across 20+ industries
// ============================================

interface DetectedProfession {
  title: string;
  industry: string;
  confidence: number;
  criticalKeywords: string[];
  seniority: 'entry' | 'mid' | 'senior' | 'executive';
  requiredSections: string[];
}

class ProfessionDetector {
  
  private static readonly PATTERNS: {
    regex: RegExp;
    title: string;
    industry: string;
    keywords: string[];
    seniority: DetectedProfession['seniority'];
    sections: string[];
  }[] = [
    // ---- TECHNOLOGY ----
    { regex: /chief\s+technology\s+officer|cto\b/i, title: 'Chief Technology Officer', industry: 'technology', keywords: ['technology strategy', 'digital transformation', 'architecture', 'innovation', 'engineering leadership', 'board'], seniority: 'executive', sections: ['summary','experience','education','skills','achievements','board'] },
    { regex: /vp\s+of\s+engineering|director\s+of\s+engineering|head\s+of\s+engineering/i, title: 'Engineering Director', industry: 'technology', keywords: ['engineering management', 'team leadership', 'architecture', 'agile', 'roadmap', 'hiring'], seniority: 'senior', sections: ['summary','experience','education','skills','leadership'] },
    { regex: /senior\s+software\s+engineer|lead\s+software\s+engineer|principal\s+engineer|staff\s+engineer/i, title: 'Senior Software Engineer', industry: 'technology', keywords: ['system design', 'architecture', 'mentoring', 'code review', 'microservices', 'cloud', 'performance'], seniority: 'senior', sections: ['summary','experience','education','skills','projects'] },
    { regex: /software\s+engineer|software\s+developer|full\s*stack|backend\s+developer|frontend\s+developer/i, title: 'Software Engineer', industry: 'technology', keywords: ['javascript', 'react', 'node', 'python', 'api', 'git', 'agile', 'testing'], seniority: 'mid', sections: ['summary','experience','education','skills','projects'] },
    { regex: /devops\s+engineer|cloud\s+engineer|infrastructure\s+engineer|sre\b|site\s+reliability/i, title: 'DevOps Engineer', industry: 'technology', keywords: ['docker', 'kubernetes', 'terraform', 'aws', 'ci/cd', 'jenkins', 'linux', 'monitoring'], seniority: 'mid', sections: ['summary','experience','education','skills','certifications'] },
    { regex: /data\s+scientist|machine\s+learning\s+engineer|ai\s+engineer|nlp\s+engineer/i, title: 'Data Scientist', industry: 'technology', keywords: ['python', 'machine learning', 'deep learning', 'sql', 'tensorflow', 'pytorch', 'statistics', 'nlp'], seniority: 'mid', sections: ['summary','experience','education','skills','projects','publications'] },
    { regex: /data\s+engineer|etl\s+developer|big\s+data\s+engineer/i, title: 'Data Engineer', industry: 'technology', keywords: ['sql', 'python', 'spark', 'airflow', 'etl', 'data warehouse', 'kafka', 'aws'], seniority: 'mid', sections: ['summary','experience','education','skills','certifications'] },
    { regex: /data\s+analyst|business\s+intelligence|bi\s+developer|analytics\s+engineer/i, title: 'Data Analyst', industry: 'technology', keywords: ['sql', 'excel', 'tableau', 'power bi', 'python', 'analytics', 'reporting', 'dashboard'], seniority: 'entry', sections: ['summary','experience','education','skills'] },
    { regex: /cyber\s*security|security\s+engineer|information\s+security|security\s+analyst|penetration\s+tester/i, title: 'Security Engineer', industry: 'technology', keywords: ['security', 'penetration testing', 'firewall', 'siem', 'compliance', 'vulnerability', 'incident response'], seniority: 'mid', sections: ['summary','experience','education','skills','certifications'] },
    { regex: /qa\s+engineer|quality\s+assurance|test\s+engineer|automation\s+engineer|sdet\b/i, title: 'QA Engineer', industry: 'technology', keywords: ['testing', 'automation', 'selenium', 'cypress', 'jira', 'test cases', 'regression', 'api testing'], seniority: 'mid', sections: ['summary','experience','education','skills','certifications'] },
    { regex: /product\s+manager|technical\s+product\s+manager|senior\s+product\s+manager/i, title: 'Product Manager', industry: 'technology', keywords: ['roadmap', 'stakeholder', 'user stories', 'backlog', 'agile', 'scrum', 'kpi', 'market research'], seniority: 'mid', sections: ['summary','experience','education','skills'] },
    { regex: /ux\s+designer|ui\s+designer|product\s+designer|ux\s+researcher|interaction\s+designer/i, title: 'UX Designer', industry: 'technology', keywords: ['figma', 'sketch', 'user research', 'wireframes', 'prototyping', 'usability', 'design system', 'a/b testing'], seniority: 'mid', sections: ['summary','experience','education','skills','portfolio'] },
    
    // ---- DATA & ANALYTICS (Cross-industry) ----
    { regex: /merl\s+specialist|m&e\s+specialist|monitoring\s+and\s+evaluation|merl\s+officer|m&e\s+officer/i, title: 'MERL Specialist', industry: 'development', keywords: ['usaid', 'kpi', 'logframe', 'data quality', 'impact assessment', 'evaluation', 'monitoring', 'indicators', 'dqa', 'cla', 'outcome harvesting'], seniority: 'mid', sections: ['summary','experience','education','skills','projects'] },
    { regex: /business\s+analyst|management\s+consultant|strategy\s+consultant|business\s+process\s+analyst/i, title: 'Business Analyst', industry: 'consulting', keywords: ['requirements', 'stakeholder', 'process improvement', 'data analysis', 'documentation', 'gap analysis', 'swot', 'business case'], seniority: 'mid', sections: ['summary','experience','education','skills','certifications'] },
    
    // ---- FINANCE & ACCOUNTING ----
    { regex: /chief\s+financial\s+officer|cfo\b|finance\s+director|vp\s+of\s+finance/i, title: 'CFO', industry: 'finance', keywords: ['financial strategy', 'forecasting', 'budgeting', 'compliance', 'board', 'm&a', 'risk management', 'investor relations'], seniority: 'executive', sections: ['summary','experience','education','certifications','board'] },
    { regex: /financial\s+analyst|investment\s+analyst|equity\s+analyst|credit\s+analyst/i, title: 'Financial Analyst', industry: 'finance', keywords: ['financial modeling', 'valuation', 'excel', 'bloomberg', 'dcf', 'ratio analysis', 'forecasting', 'reporting'], seniority: 'mid', sections: ['summary','experience','education','skills','certifications'] },
    { regex: /accountant|auditor|cpa\b|chartered\s+accountant|tax\s+accountant|forensic\s+accountant/i, title: 'Accountant', industry: 'finance', keywords: ['gaap', 'ifrs', 'audit', 'tax', 'reconciliation', 'general ledger', 'quickbooks', 'compliance'], seniority: 'mid', sections: ['summary','experience','education','certifications','licenses'] },
    { regex: /banker|relationship\s+manager|investment\s+banker|wealth\s+manager|portfolio\s+manager/i, title: 'Banking Professional', industry: 'finance', keywords: ['portfolio management', 'client relations', 'risk assessment', 'financial products', 'compliance', 'kpi'], seniority: 'mid', sections: ['summary','experience','education','certifications','licenses'] },
    
    // ---- HEALTHCARE ----
    { regex: /chief\s+medical\s+officer|medical\s+director|clinical\s+director/i, title: 'Medical Director', industry: 'healthcare', keywords: ['clinical leadership', 'patient safety', 'quality improvement', 'regulatory', 'accreditation', 'medical staff'], seniority: 'executive', sections: ['summary','experience','education','licenses','certifications','board'] },
    { regex: /physician|doctor|surgeon|general\s+practitioner|specialist|consultant\s+physician/i, title: 'Physician', industry: 'healthcare', keywords: ['patient care', 'diagnosis', 'treatment', 'clinical', 'medical records', 'board certified'], seniority: 'senior', sections: ['summary','experience','education','licenses','certifications','clinical'] },
    { regex: /nurse|registered\s+nurse|nurse\s+practitioner|clinical\s+nurse|midwife/i, title: 'Nurse', industry: 'healthcare', keywords: ['patient care', 'vital signs', 'medication', 'care plan', 'patient education', 'charting', 'emr'], seniority: 'mid', sections: ['summary','experience','education','licenses','certifications','clinical'] },
    { regex: /pharmacist|pharmacy\s+manager|clinical\s+pharmacist/i, title: 'Pharmacist', industry: 'healthcare', keywords: ['pharmaceutical', 'dispensing', 'drug interaction', 'inventory', 'compliance', 'patient counseling'], seniority: 'mid', sections: ['summary','experience','education','licenses','certifications'] },
    { regex: /healthcare\s+administrator|hospital\s+administrator|practice\s+manager|health\s+services\s+manager/i, title: 'Healthcare Administrator', industry: 'healthcare', keywords: ['healthcare management', 'budgeting', 'staffing', 'compliance', 'hipaa', 'operations', 'quality'], seniority: 'mid', sections: ['summary','experience','education','certifications'] },
    
    // ---- MARKETING & SALES ----
    { regex: /chief\s+marketing\s+officer|cmo\b|vp\s+of\s+marketing|marketing\s+director/i, title: 'Marketing Director', industry: 'marketing', keywords: ['marketing strategy', 'brand management', 'demand generation', 'analytics', 'budget', 'team leadership'], seniority: 'executive', sections: ['summary','experience','education','skills','achievements'] },
    { regex: /marketing\s+manager|digital\s+marketing\s+manager|growth\s+marketing\s+manager/i, title: 'Marketing Manager', industry: 'marketing', keywords: ['seo', 'sem', 'content strategy', 'social media', 'email marketing', 'analytics', 'campaign', 'lead generation'], seniority: 'mid', sections: ['summary','experience','education','skills','certifications'] },
    { regex: /seo\s+specialist|content\s+marketing|social\s+media\s+manager|copywriter|content\s+strategist/i, title: 'Content Marketer', industry: 'marketing', keywords: ['seo', 'content creation', 'social media', 'blogging', 'copywriting', 'analytics', 'wordpress'], seniority: 'entry', sections: ['summary','experience','education','skills','portfolio'] },
    { regex: /sales\s+manager|sales\s+director|vp\s+of\s+sales|head\s+of\s+sales/i, title: 'Sales Manager', industry: 'sales', keywords: ['pipeline', 'crm', 'negotiation', 'lead generation', 'quota', 'forecasting', 'sales strategy', 'team management'], seniority: 'senior', sections: ['summary','experience','education','skills'] },
    { regex: /account\s+executive|business\s+development|sales\s+representative|bdr\b|sdr\b/i, title: 'Sales Representative', industry: 'sales', keywords: ['prospecting', 'cold calling', 'crm', 'pipeline', 'negotiation', 'closing', 'quota'], seniority: 'entry', sections: ['summary','experience','education','skills'] },
    
    // ---- EDUCATION ----
    { regex: /professor|associate\s+professor|assistant\s+professor|lecturer|adjunct\s+faculty/i, title: 'Professor', industry: 'education', keywords: ['research', 'teaching', 'curriculum', 'publications', 'grant writing', 'mentoring', 'academic'], seniority: 'senior', sections: ['summary','experience','education','publications','research','awards'] },
    { regex: /teacher|educator|instructor|teaching\s+assistant|elementary\s+teacher|high\s+school\s+teacher/i, title: 'Teacher', industry: 'education', keywords: ['classroom management', 'lesson planning', 'curriculum', 'assessment', 'student engagement', 'differentiation'], seniority: 'mid', sections: ['summary','experience','education','certifications'] },
    
    // ---- ENGINEERING (Non-Software) ----
    { regex: /civil\s+engineer|structural\s+engineer|construction\s+engineer|geotechnical\s+engineer/i, title: 'Civil Engineer', industry: 'engineering', keywords: ['structural analysis', 'autocad', 'construction', 'concrete', 'steel', 'permitting', 'site inspection'], seniority: 'mid', sections: ['summary','experience','education','licenses','certifications'] },
    { regex: /mechanical\s+engineer|manufacturing\s+engineer|design\s+engineer|product\s+design\s+engineer/i, title: 'Mechanical Engineer', industry: 'engineering', keywords: ['cad', 'solidworks', 'fea', 'manufacturing', 'prototyping', 'tolerance', 'gd&t'], seniority: 'mid', sections: ['summary','experience','education','skills','certifications'] },
    { regex: /electrical\s+engineer|electronics\s+engineer|hardware\s+engineer|embedded\s+systems\s+engineer/i, title: 'Electrical Engineer', industry: 'engineering', keywords: ['circuit design', 'pcb', 'embedded', 'testing', 'compliance', 'schematic', 'fpga'], seniority: 'mid', sections: ['summary','experience','education','skills'] },
    
    // ---- HR & ADMIN ----
    { regex: /chief\s+human\s+resources|chro\b|vp\s+of\s+hr|hr\s+director|head\s+of\s+hr/i, title: 'HR Director', industry: 'general', keywords: ['hr strategy', 'talent management', 'organizational development', 'compliance', 'benefits', 'employee relations'], seniority: 'executive', sections: ['summary','experience','education','certifications'] },
    { regex: /human\s+resources\s+manager|hr\s+manager|people\s+operations\s+manager|talent\s+manager/i, title: 'HR Manager', industry: 'general', keywords: ['recruitment', 'onboarding', 'employee relations', 'payroll', 'benefits', 'performance management', 'compliance'], seniority: 'mid', sections: ['summary','experience','education','certifications'] },
    { regex: /recruiter|talent\s+acquisition|hr\s+generalist|hr\s+coordinator|people\s+operations\s+specialist/i, title: 'HR Professional', industry: 'general', keywords: ['sourcing', 'screening', 'interviewing', 'onboarding', 'ats', 'linkedin', 'employer branding'], seniority: 'entry', sections: ['summary','experience','education'] },
    
    // ---- LEGAL ----
    { regex: /lawyer|attorney|counsel|legal\s+advisor|solicitor|barrister|general\s+counsel/i, title: 'Lawyer', industry: 'legal', keywords: ['litigation', 'contract', 'compliance', 'legal research', 'negotiation', 'due diligence', 'regulatory'], seniority: 'mid', sections: ['summary','experience','education','licenses','bar'] },
    { regex: /paralegal|legal\s+assistant|law\s+clerk/i, title: 'Paralegal', industry: 'legal', keywords: ['legal research', 'document preparation', 'case management', 'filing', 'discovery', 'client communication'], seniority: 'entry', sections: ['summary','experience','education'] },
    
    // ---- OPERATIONS & SUPPLY CHAIN ----
    { regex: /chief\s+operating\s+officer|coo\b|vp\s+of\s+operations|operations\s+director/i, title: 'COO', industry: 'general', keywords: ['operations', 'strategy', 'efficiency', 'supply chain', 'logistics', 'p&l', 'process optimization'], seniority: 'executive', sections: ['summary','experience','education','achievements'] },
    { regex: /operations\s+manager|plant\s+manager|facility\s+manager|production\s+manager/i, title: 'Operations Manager', industry: 'general', keywords: ['operations', 'logistics', 'inventory', 'process improvement', 'team management', 'kpi', 'safety'], seniority: 'mid', sections: ['summary','experience','education','skills'] },
    { regex: /supply\s+chain\s+manager|logistics\s+manager|procurement\s+manager|warehouse\s+manager/i, title: 'Supply Chain Manager', industry: 'general', keywords: ['supply chain', 'logistics', 'procurement', 'inventory', 'vendor management', 'erp', 'forecasting'], seniority: 'mid', sections: ['summary','experience','education','certifications'] },
    
    // ---- CREATIVE & DESIGN ----
    { regex: /graphic\s+designer|visual\s+designer|brand\s+designer|art\s+director|creative\s+director/i, title: 'Graphic Designer', industry: 'creative', keywords: ['adobe', 'photoshop', 'illustrator', 'branding', 'typography', 'layout', 'color theory'], seniority: 'mid', sections: ['summary','experience','education','portfolio','skills'] },
    { regex: /video\s+editor|motion\s+designer|animator|film\s+editor|post\s+production/i, title: 'Video Editor', industry: 'creative', keywords: ['premiere', 'after effects', 'davinci', 'color grading', 'motion graphics', 'storytelling'], seniority: 'mid', sections: ['summary','experience','education','portfolio','skills'] },
    
    // ---- CUSTOMER SERVICE ----
    { regex: /customer\s+success\s+manager|customer\s+service\s+manager|support\s+manager|call\s+center\s+manager/i, title: 'Customer Success Manager', industry: 'general', keywords: ['customer retention', 'onboarding', 'crm', 'account management', 'renewals', 'satisfaction', 'escalation'], seniority: 'mid', sections: ['summary','experience','education','skills'] },
    { regex: /customer\s+service\s+representative|support\s+agent|call\s+center\s+agent|help\s+desk/i, title: 'Customer Service Rep', industry: 'general', keywords: ['customer service', 'communication', 'problem solving', 'crm', 'ticketing', 'phone support'], seniority: 'entry', sections: ['summary','experience','education'] },
    
    // ---- CATCH-ALL ----
    { regex: /specialist|coordinator|officer|associate|assistant|consultant|manager|director/i, title: 'Professional', industry: 'general', keywords: ['communication', 'teamwork', 'project management', 'organization', 'problem solving', 'leadership', 'analytical'], seniority: 'mid', sections: ['summary','experience','education','skills'] },
  ];

  static detect(text: string): DetectedProfession {
    let bestMatch: DetectedProfession = {
      title: 'Professional',
      industry: 'general',
      confidence: 0.3,
      criticalKeywords: ['communication', 'teamwork', 'problem solving', 'project management', 'organization'],
      seniority: 'mid',
      requiredSections: ['summary', 'experience', 'education', 'skills'],
    };

    let highestConfidence = 0;
    const lowerText = text.toLowerCase();

    for (const pattern of this.PATTERNS) {
      if (pattern.regex.test(lowerText)) {
        const keywordMatches = pattern.keywords.filter(kw => lowerText.includes(kw.toLowerCase())).length;
        const keywordRatio = keywordMatches / Math.max(1, pattern.keywords.length);
        const seniorityBoost = pattern.seniority === 'executive' ? 0.25 : pattern.seniority === 'senior' ? 0.15 : 0;
        const confidence = Math.min(1, 0.5 + (keywordRatio * 0.3) + seniorityBoost);

        if (confidence > highestConfidence) {
          highestConfidence = confidence;
          bestMatch = {
            title: pattern.title,
            industry: pattern.industry,
            confidence,
            criticalKeywords: pattern.keywords,
            seniority: pattern.seniority,
            requiredSections: pattern.sections,
          };
        }
      }
    }

    return bestMatch;
  }
}

// ============================================
// INDUSTRY PROFILES
// ============================================

export interface IndustryProfile {
  requiredSections: string[];
  criticalKeywords: string[];
  weightOverrides: Record<string, number>;
  minWordCount: number;
}

export const INDUSTRY_PROFILES: Record<string, IndustryProfile> = {
  technology: { requiredSections: ['summary','experience','education','skills','projects'], criticalKeywords: ['agile','scrum','api','cloud','ci/cd','git','docker','kubernetes','microservices'], weightOverrides: { skillsRelevance: 0.30, keywordOptimization: 0.25 }, minWordCount: 400 },
  development: { requiredSections: ['summary','experience','education','skills','projects'], criticalKeywords: ['usaid','kpi','logframe','data quality','impact assessment','evaluation','monitoring','indicators'], weightOverrides: { sectionCompleteness: 0.25, keywordOptimization: 0.20 }, minWordCount: 450 },
  finance: { requiredSections: ['summary','experience','education','certifications','licenses'], criticalKeywords: ['financial analysis','risk management','compliance','audit','forecasting','valuation','budgeting'], weightOverrides: { quantifiableResults: 0.25, keywordOptimization: 0.20 }, minWordCount: 500 },
  healthcare: { requiredSections: ['summary','experience','education','licenses','certifications','clinical'], criticalKeywords: ['patient care','clinical','hipaa','emr','diagnostics','treatment','medication'], weightOverrides: { sectionCompleteness: 0.30, keywordOptimization: 0.20 }, minWordCount: 450 },
  consulting: { requiredSections: ['summary','experience','education','skills','certifications'], criticalKeywords: ['stakeholder management','process improvement','data analysis','gap analysis','business case','presentation'], weightOverrides: { contentQuality: 0.25, keywordOptimization: 0.20 }, minWordCount: 500 },
  marketing: { requiredSections: ['summary','experience','education','skills','portfolio'], criticalKeywords: ['seo','sem','content strategy','branding','campaign','analytics','social media','lead generation'], weightOverrides: { contentQuality: 0.25, keywordOptimization: 0.20 }, minWordCount: 400 },
  sales: { requiredSections: ['summary','experience','education','skills'], criticalKeywords: ['pipeline','crm','negotiation','lead generation','quota','revenue','closing'], weightOverrides: { quantifiableResults: 0.30, actionVerbs: 0.20 }, minWordCount: 400 },
  education: { requiredSections: ['summary','experience','education','publications','certifications'], criticalKeywords: ['curriculum','assessment','pedagogy','e-learning','classroom','instructional design','accreditation'], weightOverrides: { sectionCompleteness: 0.25, contentQuality: 0.20 }, minWordCount: 400 },
  engineering: { requiredSections: ['summary','experience','education','licenses','certifications'], criticalKeywords: ['cad','design','testing','compliance','specifications','manufacturing','quality'], weightOverrides: { sectionCompleteness: 0.25, keywordOptimization: 0.15 }, minWordCount: 450 },
  legal: { requiredSections: ['summary','experience','education','licenses','bar'], criticalKeywords: ['litigation','contract','compliance','legal research','negotiation','due diligence','regulatory'], weightOverrides: { sectionCompleteness: 0.30, contentQuality: 0.25 }, minWordCount: 500 },
  creative: { requiredSections: ['summary','experience','education','portfolio','skills'], criticalKeywords: ['portfolio','design','creative','branding','adobe','typography','layout'], weightOverrides: { contentQuality: 0.30, formattingScore: 0.20 }, minWordCount: 300 },
  executive: { requiredSections: ['summary','experience','education','achievements','board'], criticalKeywords: ['strategy','leadership','executive','board','transformation','revenue growth','organizational','p&l'], weightOverrides: { quantifiableResults: 0.30, actionVerbs: 0.20 }, minWordCount: 600 },
  general: { requiredSections: ['summary','experience','education','skills'], criticalKeywords: ['communication','teamwork','project management','problem solving','leadership','organization'], weightOverrides: {}, minWordCount: 350 },
};

// ============================================
// ATS KEYWORD DATABASE
// ============================================

const ATS_KEYWORDS: Record<string, string[]> = {
  technology: ['agile','scrum','sdlc','api','cloud','devops','ci/cd','microservices','full stack','machine learning','data science','git','docker','kubernetes','aws','azure','gcp','linux','python','javascript','react','node','sql'],
  data_science: ['python','sql','machine learning','deep learning','statistics','tensorflow','pytorch','pandas','numpy','scikit-learn','nlp','computer vision','data mining','predictive modeling','tableau','power bi','analytics'],
  merl: ['usaid','kpi','logframe','data quality','impact assessment','evaluation','monitoring','indicators','dqa','cla','outcome harvesting','most significant change','logical framework','theory of change','results framework','baseline','endline'],
  finance: ['financial analysis','risk management','portfolio','audit','compliance','forecasting','budgeting','reconciliation','valuation','gaap','ifrs','excel','quickbooks','sap'],
  healthcare: ['patient care','clinical','hipaa','emr','ehr','diagnostics','treatment','pharmaceutical','medication','vital signs','care plan','patient education'],
  marketing: ['seo','sem','content strategy','branding','campaign','analytics','social media','lead generation','email marketing','crm','hubspot','google analytics'],
  sales: ['business development','lead generation','crm','pipeline','negotiation','account management','revenue growth','closing','prospecting','cold calling','salesforce'],
  education: ['curriculum','instructional design','assessment','accreditation','pedagogy','e-learning','classroom management','lesson planning','student engagement','differentiation'],
  engineering: ['cad','prototyping','testing','qa','manufacturing','design','specifications','compliance','solidworks','autocad','fea','gd&t'],
  general: ['leadership','project management','communication','teamwork','problem solving','analytical','strategic','innovation','time management','organization'],
};

const ACTION_VERBS = [
  'achieved','led','developed','implemented','managed','created','designed','increased','reduced','improved','optimized','streamlined','launched','directed','coordinated','spearheaded','orchestrated','delivered','executed','transformed','accelerated','maximized','generated','established','pioneered','engineered','architected','automated','deployed',
];

const MEASURABLE_PATTERNS = [
  /\d+%/g, /\$\d+[kKmM]?/g, /\d+\s*(?:people|staff|team|clients|customers|users)/gi, /\d+x/gi, /\d+\s*(?:hours|days|weeks|months|years)/gi, /increased|reduced|improved|saved|generated|grew/gi,
];

// ============================================
// FORMAT VALIDATOR
// ============================================

export class FormatValidator {
  static validate(text: string): { issues: string[]; score: number; recommendations: string[] } {
    const issues: string[] = [];
    if (/[📊📈🎯💼🔥⭐✅❌]/u.test(text)) issues.push('Emojis detected - ATS cannot parse emojis cleanly.');
    if (/[│┌┐└┘├┤┬┴┼]/u.test(text)) issues.push('Table characters detected - ATS parsers often scramble table structures.');
    if (/<[^>]+>/.test(text)) issues.push('HTML tags detected - strip raw code before parsing.');
    if (/\t/.test(text)) issues.push('Tab characters detected - prefer standard spacing.');
    return { issues, score: safeNumber(100 - issues.length * 15, 100), recommendations: issues.map(i => `Fix: ${i}`) };
  }
}

// ============================================
// DEEP SECTION ANALYZER
// ============================================

export interface SectionAnalysis { name: string; present: boolean; score: number; wordCount: number; bulletPoints: number; metrics: number; issues: string[]; suggestions: string[]; }

export class DeepSectionAnalyzer {
  static analyzeAllSections(text: string): SectionAnalysis[] {
    const patterns: Record<string, RegExp> = {
      summary: /(?:SUMMARY|PROFESSIONAL\s+SUMMARY|OBJECTIVE)(.+?)(?=\n(?:EXPERIENCE|EMPLOYMENT|WORK|EDUCATION|SKILLS))/is,
      experience: /(?:EXPERIENCE|EMPLOYMENT|WORK\s+HISTORY)(.+?)(?=\n(?:EDUCATION|SKILLS|CERTIFICATION|PROJECT))/is,
      education: /(?:EDUCATION|ACADEMIC)(.+?)(?=\n(?:SKILLS|CERTIFICATION|PROJECT|LANGUAGE))/is,
      skills: /(?:SKILLS|TECHNOLOGIES|COMPETENCIES)(.+?)(?=\n(?:CERTIFICATION|PROJECT|LANGUAGE|AWARD))/is,
    };
    return Object.entries(patterns).map(([name, pattern]) => {
      const match = text.match(pattern);
      const content = match ? (match[1] || match[0]).trim() : '';
      return this.analyzeSection(name, content);
    });
  }

  private static analyzeSection(name: string, content: string): SectionAnalysis {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const bullets = (content.match(/[•\-*●○▪▫]/g) || []).length;
    const metrics = (content.match(/\d+%|\$\d+|\d+x|\d+\s*(?:people|users|clients)/gi) || []).length;
    const issues: string[] = [];
    const suggestions: string[] = [];
    if (name === 'summary' && words.length < 20) issues.push('Summary too short (aim for 30-80 words).');
    if (name === 'experience' && bullets < 3) issues.push('Add more bullet points per role (3-7 ideal).');
    if (name === 'experience' && metrics < 2) suggestions.push('Add quantifiable metrics (%, $, numbers).');
    if (name === 'skills' && words.length < 5) issues.push('List more skills (aim for 10-20 keywords).');
    let score = 100 - issues.length * 15 - (3 - Math.min(3, metrics)) * 10;
    if (words.length < 10) score -= 20;
    return { name, present: content.length > 0, score: safeNumber(score, 50), wordCount: words.length, bulletPoints: bullets, metrics, issues, suggestions };
  }
}

// ============================================
// COMPETITIVE BENCHMARKING
// ============================================

export interface BenchmarkData { industry: string; role: string; avgScore: number; topQuartileScore: number; commonKeywords: string[]; missingKeywords: string[]; gapAnalysis: string[]; }

export class CompetitiveBenchmarker {
  private static benchmarks: Record<string, BenchmarkData> = {
    'software-engineer': { industry: 'technology', role: 'Software Engineer', avgScore: 72, topQuartileScore: 88, commonKeywords: ['react','node.js','python','aws','docker','kubernetes','microservices'], missingKeywords: [], gapAnalysis: [] },
    'data-scientist': { industry: 'technology', role: 'Data Scientist', avgScore: 75, topQuartileScore: 90, commonKeywords: ['python','machine learning','sql','tensorflow','pytorch','statistics'], missingKeywords: [], gapAnalysis: [] },
  };

  static compare(resumeText: string, targetRole: string): BenchmarkData {
    const key = targetRole.toLowerCase().replace(/\s+/g, '-');
    const template = this.benchmarks[key] || { industry: 'general', role: targetRole, avgScore: 68, topQuartileScore: 85, commonKeywords: ['leadership','collaboration','strategy','execution'], missingKeywords: [], gapAnalysis: [] };
    template.missingKeywords = template.commonKeywords.filter(kw => !resumeText.toLowerCase().includes(kw));
    template.gapAnalysis = template.missingKeywords.map(kw => `Missing: "${kw}" (found in top ${template.role} resumes).`);
    return template;
  }
}

// ============================================
// SCORE CONSISTENCY ENGINE
// ============================================

export class ScoreConsistencyEngine {
  private history: Map<string, number[]> = new Map();
  private hash(t: string): string { let h = 0; for (let i = 0; i < Math.min(t.length, 1000); i++) { h = ((h << 5) - h) + t.charCodeAt(i); h &= h; } return h.toString(36); }
  getConsistentScore(text: string, score: number): number {
    const h = this.hash(text); if (!this.history.has(h)) this.history.set(h, []);
    const arr = this.history.get(h)!; arr.push(safeNumber(score, 50)); if (arr.length > 5) arr.shift();
    if (arr.length === 1) return arr[0];
    let sum = 0, w = 0;
    arr.forEach((s, i) => { const weight = (i + 1) / arr.length; sum += s * weight; w += weight; });
    return safeNumber(w > 0 ? sum / w : score, score);
  }
}

// ============================================
// ATS SCORING ENGINE
// ============================================

class ATSScoringEngine {
  static scoreResume(text: string, detected: DetectedProfession): ATSScore {
    const t = (text || '').toLowerCase();
    const profile = INDUSTRY_PROFILES[detected.industry] || INDUSTRY_PROFILES['general'];
    
    // Combine detected keywords + profile keywords + general keywords
    const allKeywords = [...new Set([...detected.criticalKeywords, ...profile.criticalKeywords, ...Object.values(ATS_KEYWORDS).flat()])];
    
    const kwScore = this.scoreKeywords(t, allKeywords);
    const fmtScore = this.scoreFormatting(text);
    const cntScore = this.scoreContent(text);
    const secScore = this.scoreSections(text, detected.requiredSections);
    const verbScore = this.scoreActionVerbs(t);
    const quantScore = this.scoreQuantifiable(t);
    const gramScore = this.scoreGrammar(text);
    const contScore = this.scoreContact(text);

    const scores: Record<string, number> = {
      keywordOptimization: kwScore, formattingScore: fmtScore, contentQuality: cntScore,
      sectionCompleteness: secScore, actionVerbs: verbScore, quantifiableResults: quantScore,
      grammarAndSpelling: gramScore, contactInfoQuality: contScore,
      skillsRelevance: kwScore, overallReadability: cntScore,
    };

    let weights: Record<string, number> = {
      keywordOptimization: 0.20, formattingScore: 0.10, contentQuality: 0.10,
      sectionCompleteness: 0.15, actionVerbs: 0.10, quantifiableResults: 0.10,
      grammarAndSpelling: 0.05, contactInfoQuality: 0.05, skillsRelevance: 0.10, overallReadability: 0.05,
    };
    if (profile.weightOverrides) weights = { ...weights, ...profile.weightOverrides };

    let totalW = 0; for (const v of Object.values(weights)) totalW += v;
    let raw = 0;
    for (const [k, w] of Object.entries(weights)) raw += (scores[k] || 50) * (totalW > 0 ? w / totalW : 0);

    return {
      overall: safeNumber(raw, 50),
      breakdown: scores as any,
      missingKeywords: allKeywords.filter(k => !t.includes(k.toLowerCase())).slice(0, 12),
      improvementTips: this.getTips(text, safeNumber(raw, 50)),
      criticalIssues: this.getCritical(text),
      analyzedAt: new Date().toISOString(),
    };
  }

  private static scoreKeywords(text: string, keywords: string[]): number {
    let f = 0; for (const k of keywords) if (text.includes(k.toLowerCase())) f++;
    return safeNumber((f / Math.max(1, keywords.length)) * 100);
  }
  private static scoreFormatting(text: string): number {
    let s = 100; if (/[•●]/.test(text)) s += 5; if (text.length < 500) s -= 20; if (text.length > 5000) s -= 10;
    if (/\n{3,}/.test(text)) s -= 10; if (/[^\x00-\x7F]/.test(text)) s -= 15; return safeNumber(s);
  }
  private static scoreContent(text: string): number {
    let s = 50; const lines = text.split('\n').filter(l => l.trim()); if (lines.length > 20) s += 15;
    if (text.split(' ').length > 200) s += 10; if (new Set(text.toLowerCase().split(/\s+/)).size > 100) s += 15;
    return safeNumber(s);
  }
  private static scoreSections(text: string, required: string[]): number {
    let f = 0; for (const s of required) if (new RegExp(s, 'i').test(text)) f++;
    return safeNumber((f / Math.max(1, required.length)) * 100);
  }
  private static scoreActionVerbs(text: string): number {
    let c = 0; const words = text.split(/\s+/); for (const w of words) if (ACTION_VERBS.includes(w)) c++;
    return safeNumber((c / Math.max(1, words.length)) * 100 * 20);
  }
  private static scoreQuantifiable(text: string): number {
    let m = 0; for (const p of MEASURABLE_PATTERNS) { const f = text.match(p); if (f) m += f.length; }
    if (m === 0) return 20; if (m <= 3) return 50; if (m <= 6) return 75; return 95;
  }
  private static scoreGrammar(text: string): number { let s = 80; if (/[A-Z]{4,}/.test(text)) s -= 10; if (/\.\s+[a-z]/.test(text)) s -= 15; if (/\s{2,}/.test(text)) s -= 5; return safeNumber(s); }
  private static scoreContact(text: string): number { let s = 0; if (/@/.test(text)) s += 40; if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)) s += 30; if (/linkedin/i.test(text)) s += 15; if (/github/i.test(text)) s += 15; return safeNumber(s); }
  private static getTips(text: string, score: number): string[] {
    const tips: string[] = [];
    if (score < 40) { tips.push('Add professional summary.', 'Include work experience with bullets.', 'Add education.', 'List skills.'); }
    if (!/\d+%/.test(text) && !/\$\d+/.test(text)) tips.push('Add quantifiable achievements (%, $).');
    if (!ACTION_VERBS.some(v => text.toLowerCase().includes(v))) tips.push('Use strong action verbs.');
    if (!/certification|certificate/i.test(text)) tips.push('Add certifications section.');
    if (!/linkedin/i.test(text)) tips.push('Add LinkedIn URL.');
    return tips.slice(0, 8);
  }
  private static getCritical(text: string): string[] {
    const i: string[] = [];
    if (!/@/.test(text)) i.push('No email found.');
    if (!/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)) i.push('No phone detected.');
    if (text.length < 300) i.push('Resume too short.');
    if (!/(?:experience|employment|work)/i.test(text)) i.push('No work experience detected.');
    return i;
  }
}

// ============================================
// ML-ENHANCED ATS ANALYSIS
// ============================================

export interface MLEnhancedAnalysis {
  parsedSections: Partial<ResumeSections>;
  detectedProfession: DetectedProfession;
  atsScore: ATSScore;
  confidence: number;
  suggestions: ParsingSuggestion[];
  templateType: string;
  requiresReview: boolean;
}

// ============================================
// AI SERVICE MAIN WITH ML INTEGRATION
// ============================================

class AIService {
  private static instance: AIService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private consistency = new ScoreConsistencyEngine();
  private parser: ResumeParser;
  private mlParser: MLResumeParser;

  private constructor() {
    console.log('🤖 ATS Engine ready. AI:', GROQ_API_KEY || GEMINI_API_KEY ? '✅' : '⚠️ Fallback');
    this.parser = ResumeParser.getInstance();
    this.mlParser = new MLResumeParser();
    this.initializeML();
  }

  private async initializeML(): Promise<void> {
    try {
      await this.mlParser.initialize();
      console.log('🤖 ML Resume Parser initialized');
    } catch (error) {
      console.warn('⚠️ ML initialization failed:', error);
    }
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // ============================================
  // ML-ENHANCED PARSE & ANALYZE
  // ============================================

  async parseAndAnalyzeResume(
    file: File,
    jobDescription?: string,
    targetRole?: string
  ): Promise<{
    parseResult: any;
    atsScore: ATSScore;
    detectedProfession: DetectedProfession;
    mlSuggestions: ParsingSuggestion[];
    confidence: number;
  }> {
    // 1. Parse the resume with ML
    const parseResult = await this.parser.parseFile(file);
    
    if (!parseResult.success) {
      throw new Error(`Parsing failed: ${parseResult.errors.join(', ')}`);
    }

    // 2. Detect profession
    const detected = ProfessionDetector.detect(parseResult.rawText);
    console.log('🎯 Detected:', detected.title, '| Industry:', detected.industry, '| Confidence:', Math.round(detected.confidence*100)+'%');

    // 3. Score with ATS engine
    const atsScore = await this.analyzeATS(
      parseResult.rawText,
      jobDescription,
      targetRole || detected.title
    );

    // 4. Enhance with ML suggestions
    const mlSuggestions = parseResult.suggestions || [];

    // 5. Calculate overall confidence
    const confidence = this.calculateOverallConfidence(
      parseResult.confidence || 0.5,
      detected.confidence,
      atsScore.overall / 100
    );

    return {
      parseResult,
      atsScore,
      detectedProfession: detected,
      mlSuggestions,
      confidence
    };
  }

  private calculateOverallConfidence(
    parseConfidence: number,
    detectionConfidence: number,
    scoreConfidence: number
  ): number {
    return (parseConfidence * 0.4 + detectionConfidence * 0.3 + scoreConfidence * 0.3);
  }

  // ============================================
  // AI-POWERED ATS ANALYSIS
  // ============================================

  private async callGroq(p: string, s: string, mt: number, t: number, j: boolean): Promise<string> {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', { 
      method:'POST', 
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${GROQ_API_KEY}`}, 
      body:JSON.stringify({ 
        model:'llama-3.3-70b-versatile', 
        messages:[{role:'system',content:s},{role:'user',content:p}], 
        temperature:t, 
        max_tokens:mt, 
        ...(j?{response_format:{type:'json_object'}}:{}) 
      }) 
    });
    if (!r.ok) throw new Error(`Groq ${r.status}`);
    const d = await r.json(); 
    return d.choices?.[0]?.message?.content || '';
  }

  private async callGemini(p: string, s: string, mt: number, t: number): Promise<string> {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, { 
      method:'POST', 
      headers:{'Content-Type':'application/json'}, 
      body:JSON.stringify({ 
        contents:[{parts:[{text:`${s}\n\n${p}`}]}], 
        generationConfig:{ temperature:t, maxOutputTokens:mt } 
      }) 
    });
    if (!r.ok) throw new Error(`Gemini ${r.status}`);
    const d = await r.json(); 
    return d.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private async callAI(p: string, s: string, mt: number, t: number, j: boolean): Promise<string> {
    if (GROQ_API_KEY) try { return await this.callGroq(p,s,mt,t,j); } catch(e:any){ console.warn('Groq:',e.message); }
    if (GEMINI_API_KEY) try { return await this.callGemini(p,s,mt,t); } catch(e:any){ console.warn('Gemini:',e.message); }
    throw new Error('No AI available');
  }

  async analyzeATS(resumeText: string, jobDescription?: string, targetRole?: string): Promise<ATSScore> {
    const text = resumeText || '';
    
    // 🔍 AUTO-DETECT PROFESSION
    const detected = ProfessionDetector.detect(text);
    console.log('🎯 Detected:', detected.title, '| Industry:', detected.industry, '| Confidence:', Math.round(detected.confidence*100)+'%', '| Seniority:', detected.seniority);
    console.log('🎯 Keywords:', detected.criticalKeywords.slice(0, 10).join(', '));
    
    const fmt = FormatValidator.validate(text);
    const localScore = ATSScoringEngine.scoreResume(text, detected);
    const sections = DeepSectionAnalyzer.analyzeAllSections(text);
    const benchmark = targetRole ? CompetitiveBenchmarker.compare(text, targetRole) : null;

    let aiScore: ATSScore | null = null;
    try {
      if (GROQ_API_KEY || GEMINI_API_KEY) {
        const prompt = `ATS Score this resume 0-100.
Detected role: ${detected.title} (${detected.industry}, ${detected.seniority})
Expected keywords: ${detected.criticalKeywords.slice(0,15).join(', ')}
Local score: ${localScore.overall}/100
Format issues: ${JSON.stringify(fmt.issues)}
${benchmark ? `Benchmark: ${benchmark.avgScore}/100 for ${benchmark.role}` : ''}

Resume:
${text}

Return JSON: {"overall":number,"breakdown":{...},"missingKeywords":[],"improvementTips":[],"criticalIssues":[]}`;
        const result = await this.callAI(prompt, 'You are an ATS engine. Return valid JSON.', 1500, 0.3, true);
        const parsed = JSON.parse(result);
        aiScore = { 
          overall: safeNumber(parsed.overall, localScore.overall), 
          breakdown: parsed.breakdown || localScore.breakdown, 
          missingKeywords: parsed.missingKeywords || [], 
          improvementTips: parsed.improvementTips || [], 
          criticalIssues: parsed.criticalIssues || [], 
          analyzedAt: new Date().toISOString() 
        };
      }
    } catch(e:any){ console.log('AI fallback:', e.message); }

    const rawOverall = aiScore ? Math.round(localScore.overall*0.5 + aiScore.overall*0.3 + fmt.score*0.2) : Math.round(localScore.overall*0.7 + fmt.score*0.3);
    const finalOverall = this.consistency.getConsistentScore(text, rawOverall);

    return {
      overall: finalOverall,
      breakdown: localScore.breakdown,
      missingKeywords: [...new Set([...localScore.missingKeywords, ...(aiScore?.missingKeywords||[]), ...(benchmark?.missingKeywords||[])])],
      improvementTips: [...fmt.recommendations, ...sections.flatMap(s=>s.suggestions), ...localScore.improvementTips, ...(aiScore?.improvementTips||[]), ...(benchmark?.gapAnalysis||[])].slice(0,12),
      criticalIssues: [...fmt.issues, ...localScore.criticalIssues, ...(aiScore?.criticalIssues||[])],
      analyzedAt: new Date().toISOString(),
    };
  }

  // ============================================
  // ML-ENHANCED RECOMMENDATIONS
  // ============================================

  async getRecommendations(text: string, score: ATSScore): Promise<AIRecommendation[]> {
    const local: AIRecommendation[] = score.improvementTips.map((t,i)=>({ 
      id:`local-${i}`, 
      section:'general', 
      field:'content', 
      current:'', 
      suggested:t, 
      reason:'ATS optimization', 
      priority:i<2?'Critical':i<4?'High':'Medium' as any, 
      type:'improvement' as const, 
      applied:false, 
      createdAt:new Date().toISOString() 
    }));

    // Get ML-based suggestions
    let mlSuggestions: ParsingSuggestion[] = [];
    try {
      const mlResult = await this.parser.parseFile(new File([text], 'resume.txt', { type: 'text/plain' }));
      if (mlResult.suggestions) {
        mlSuggestions = mlResult.suggestions;
      }
    } catch (e) { /* fallback */ }

    // Merge ML suggestions with AI recommendations
    const mlRecs: AIRecommendation[] = mlSuggestions.map((s, i) => ({
      id: `ml-${i}`,
      section: s.field.split('.')[0] || 'general',
      field: s.field,
      current: '',
      suggested: typeof s.value === 'string' ? s.value : JSON.stringify(s.value),
      reason: `ML confidence: ${(s.confidence * 100).toFixed(0)}%`,
      priority: s.confidence > 0.7 ? 'High' : s.confidence > 0.4 ? 'Medium' : 'Low' as any,
      type: 'improvement' as const,
      applied: false,
      createdAt: new Date().toISOString()
    }));

    try {
      const r = await this.callAI(
        `ATS Score:${score.overall}/100\nResume:${text}\n\nReturn JSON array of 5 recommendations.`, 
        'You are an ATS expert. Return JSON array.', 
        2000, 0.7, true
      );
      const aiRecs = JSON.parse(r);
      // Combine all recommendations, prioritizing ML suggestions for low-confidence fields
      const allRecs = [...mlRecs, ...aiRecs, ...local.slice(0, 3)];
      // Deduplicate
      const seen = new Set();
      return allRecs.filter(r => {
        const key = r.suggested.slice(0, 50);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 10);
    } catch { 
      return [...mlRecs, ...local.slice(0, 3)].slice(0, 10);
    }
  }

  // ============================================
  // ML-ENHANCED CHAT
  // ============================================

  async chat(messages: AIChatMessage[], ctx: string): Promise<string> {
    // Check if context has parse data
    let contextWithML = ctx;
    try {
      const parseResult = await this.parser.parseFile(new File([ctx], 'context.txt', { type: 'text/plain' }));
      if (parseResult.success && parseResult.confidence) {
        contextWithML = `${ctx}\n\nParsed with ${Math.round((parseResult.confidence || 0) * 100)}% confidence. Missing: ${parseResult.warnings.join(', ')}`;
      }
    } catch (e) { /* fallback to original context */ }

    try { 
      return await this.callAI(
        `Resume:\n${contextWithML}\n\nQ:${messages[messages.length-1]?.content}\n\nGive specific, actionable advice with metrics.`, 
        'You are a career coach and ATS expert.', 
        800, 0.7, false
      ); 
    } catch { 
      return 'Add metrics to achievements. Use action verbs. Include a professional summary. Add certifications. Use industry keywords. Quantify your impact.';
    }
  }

  // ============================================
  // ML-ENHANCED BULLET POINT OPTIMIZATION
  // ============================================

  async optimizeBulletPoint(bp: string): Promise<string> { 
    try { 
      return await this.callAI(`Rewrite this bullet point to be more impactful and quantifiable: "${bp}"`, 'Return only the improved version, no explanation.', 100, 0.7, false); 
    } catch { 
      return bp; 
    } 
  }

  // ============================================
  // ML-ENHANCED SUMMARY GENERATION
  // ============================================

  async generateSummary(exps: WorkExperience[], skills: string[]): Promise<string> { 
    try { 
      const expSummary = exps.slice(0, 3).map(e => `${e.position} at ${e.company}`).join(', ');
      return await this.callAI(
        `Generate a professional summary for someone with experience: ${expSummary}. Skills: ${skills.slice(0, 10).join(', ')}.`, 
        'Return a concise, impactful 2-3 sentence summary.', 
        300, 0.7, false
      ); 
    } catch { 
      return `Experienced professional skilled in ${skills.slice(0, 5).join(', ')}. Proven track record of delivering results.`; 
    } 
  }

  // ============================================
  // LEARNING FROM CORRECTIONS
  // ============================================

  async learnFromCorrection(
    originalText: string,
    originalParsed: Partial<ResumeSections>,
    corrected: Partial<ResumeSections>,
    templateType: string = 'unknown'
  ): Promise<void> {
    try {
      await this.parser.learnFromCorrection(
        originalText,
        originalParsed,
        corrected,
        templateType
      );
      console.log('📚 Learned from correction');
    } catch (error) {
      console.warn('Failed to learn from correction:', error);
    }
  }

  // ============================================
  // BATCH LEARNING
  // ============================================

  async batchLearnFromCorrections(corrections: TrainingExample[]): Promise<void> {
    try {
      await this.parser.batchLearnFromCorrections(corrections);
      console.log(`📚 Batch learned from ${corrections.length} corrections`);
    } catch (error) {
      console.warn('Batch learning failed:', error);
    }
  }

  // ============================================
  // PARSER STATISTICS
  // ============================================

  getParserStats(): any {
    return this.parser.getParserStats();
  }

  // ============================================
  // EXPORT/IMPORT TRAINING DATA
  // ============================================

  exportTrainingData(): string {
    return this.parser.exportTrainingData();
  }

  importTrainingData(jsonData: string): boolean {
    return this.parser.importTrainingData(jsonData);
  }

  // ============================================
  // CACHE MANAGEMENT
  // ============================================

  clearCache(): void { 
    this.cache.clear(); 
    this.parser.clearCache();
  }

  getCacheStats(): { aiCacheSize: number; parserCacheSize: number } {
    const parserStats = this.parser.getCacheStats();
    return {
      aiCacheSize: this.cache.size,
      parserCacheSize: parserStats.parseCacheSize
    };
  }
}

// Export singleton instance
export default AIService;
