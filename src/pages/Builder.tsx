// src/pages/Builder.tsx
// ============================================
// BUILDER PAGE - Perfect Auto-Populate with ML
// Enhanced with ML parser for intelligent resume parsing
// PAY-TO-DOWNLOAD FLOW: Register → Edit → Pay to Download
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  MdSave, MdDownload, MdPictureAsPdf, MdDescription,
  MdTextSnippet, MdAutoAwesome, MdCloudUpload,
  MdAnalytics, MdLightbulb, MdHistory, MdTrendingUp,
  MdWarning, MdCheckCircle, MdSettings, MdLock, MdLockOpen,
} from 'react-icons/md';
import { useResume, useAI, useExport, useAuth } from '../store';
import ResumeEditor from '../components/ResumeEditor';
import Modal from '../components/Modal';
import FileUpload from '../components/FileUpload';
import Loading from '../components/Loading';
import ResumeParser from '../lib/parser';
import AIService from '../lib/ai';
import ResumeGenerator from '../lib/generator';
import { MLResumeParser, TrainingExample, ParsingSuggestion } from '../lib/ml/MLResumeParser';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================

interface MLParseResult {
  sections: any;
  confidence: number;
  suggestions: ParsingSuggestion[];
  templateType: string;
  requiresReview: boolean;
  detectedProfession?: {
    title: string;
    industry: string;
    confidence: number;
    seniority: string;
  };
}

interface ParserStats {
  totalParses: number;
  correctionHistoryCount: number;
  averageConfidence: number;
  commonErrors: string[];
  templateTypes: Record<string, number>;
  cacheSize: number;
}

// ============================================
// BUILDER COMPONENT
// ============================================

const Builder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentResume, createNewResume, saveResume, isDirty, setCurrentResume } = useResume();
  const { atsScore, setATSScore, setAIRecommendations, setAILoading, aiLoading } = useAI();
  const { setExportLoading } = useExport();
  const { user } = useAuth();

  // State
  const [showExport, setShowExport] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showMLSuggestions, setShowMLSuggestions] = useState(false);
  const [showTrainingPanel, setShowTrainingPanel] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [mlSuggestions, setMLSuggestions] = useState<ParsingSuggestion[]>([]);
  const [mlConfidence, setMLConfidence] = useState<number>(0);
  const [parseHistory, setParseHistory] = useState<any[]>([]);
  const [parserStats, setParserStats] = useState<ParserStats | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [autoLearn, setAutoLearn] = useState(true);
  
  const isUpload = searchParams.get('upload') === 'true';

  // ✅ Updated: Check both status AND isPaid
const hasActiveSubscription = useCallback(() => {
  if (!user?.subscription) return false;
  if (user.subscription.status !== 'active') return false;
  if (!user.subscription.isPaid) return false; // ✅ Must have paid
  const endDate = new Date(user.subscription.endDate);
  return endDate > new Date();
}, [user]);

// ✅ Updated: Get subscription status with payment check
const getSubscriptionStatus = useCallback(() => {
  if (!user?.subscription) return 'none';
  if (user.subscription.status !== 'active') return 'none';
  if (!user.subscription.isPaid) return 'unpaid'; // ✅ New status
  const endDate = new Date(user.subscription.endDate);
  if (endDate < new Date()) return 'expired';
  return 'active';
}, [user]);

  // Get subscription days remaining
  const getDaysRemaining = useCallback(() => {
    if (!user?.subscription) return 0;
    const endDate = new Date(user.subscription.endDate);
    const now = new Date();
    return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }, [user]);

  // ============================================
  // LIFECYCLE EFFECTS
  // ============================================

  useEffect(() => {
    const t = setTimeout(() => setPageLoaded(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isUpload) setShowUpload(true);
  }, [isUpload]);

  useEffect(() => {
    if (!currentResume && pageLoaded) {
      createNewResume('My Resume');
    }
  }, [currentResume, pageLoaded, createNewResume]);

  useEffect(() => {
    loadParserStats();
  }, []);

  // ============================================
  // PARSER STATS
  // ============================================

  const loadParserStats = async () => {
    try {
      const parser = ResumeParser.getInstance();
      const stats = parser.getParserStats();
      setParserStats(stats);
    } catch (error) {
      console.warn('Failed to load parser stats:', error);
    }
  };

  // ============================================
  // FILE UPLOAD - ML-ENHANCED AUTO-POPULATE
  // ============================================

  const handleFileUpload = async (file: File) => {
    setParsing(true);
    setShowUpload(false);

    try {
      const parser = ResumeParser.getInstance();
      const aiService = AIService.getInstance();

      const result = await parser.parseFile(file);

      if (!result.success) {
        toast.error(result.errors.join('. '));
        setParsing(false);
        return;
      }

      const parsed = result.parsed;
      const confidence = result.confidence || 0;
      const suggestions = result.suggestions || [];
      const templateType = result.templateType || 'unknown';
      const requiresReview = result.requiresReview || false;

      console.log('📦 ML PARSED SECTIONS:');
      console.log('  Confidence:', Math.round(confidence * 100) + '%');
      console.log('  Template:', templateType);
      console.log('  Requires Review:', requiresReview);
      console.log('  Contact:', parsed.contact?.fullName, parsed.contact?.email);
      console.log('  Summary:', parsed.summary?.content?.substring(0, 100));
      console.log('  Experience:', parsed.experience?.length, 'entries');
      console.log('  Education:', parsed.education?.length, 'entries');
      console.log('  Skills:', parsed.skills?.technical?.length, 'tech skills');
      console.log('  Suggestions:', suggestions.length);

      setMLSuggestions(suggestions);
      setMLConfidence(confidence);

      const fullResume = {
        ...currentResume!,
        sections: {
          contact: {
            fullName: parsed.contact?.fullName || '',
            email: parsed.contact?.email || '',
            phone: parsed.contact?.phone || '',
            location: parsed.contact?.location || '',
            country: parsed.contact?.country || '',
            linkedIn: parsed.contact?.linkedIn || '',
            portfolio: parsed.contact?.portfolio || '',
            github: parsed.contact?.github || '',
          },
          summary: {
            content: parsed.summary?.content || '',
            aiOptimized: false,
            lastModified: new Date().toISOString(),
          },
          experience: (parsed.experience || []).map((exp: any) => ({
            id: exp.id || crypto.randomUUID(),
            company: exp.company || '',
            position: exp.position || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            current: exp.current || false,
            location: exp.location || '',
            description: exp.description || '',
            achievements: exp.achievements || [],
            technologies: exp.technologies || [],
            aiSuggestions: [],
          })),
          education: (parsed.education || []).map((edu: any) => ({
            id: edu.id || crypto.randomUUID(),
            institution: edu.institution || '',
            degree: edu.degree || '',
            field: edu.field || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || '',
            gpa: edu.gpa || '',
            honors: edu.honors || [],
            activities: edu.activities || [],
            relevantCourses: edu.relevantCourses || [],
          })),
          skills: {
            technical: (parsed.skills?.technical || []).map((s: any) => ({
              name: s.name || s,
              level: s.level || 'Intermediate',
              category: s.category || 'Technical',
            })),
            soft: (parsed.skills?.soft || []).map((s: any) => ({
              name: s.name || s,
              level: s.level || 'Intermediate',
              category: s.category || 'Soft Skills',
            })),
            languages: (parsed.skills?.languages || []).map((s: any) => ({
              name: s.name || s,
              level: s.level || 'Intermediate',
              category: s.category || 'Language',
            })),
            tools: (parsed.skills?.tools || []).map((s: any) => ({
              name: s.name || s,
              level: s.level || 'Intermediate',
              category: s.category || 'Tools',
            })),
            other: (parsed.skills?.other || []).map((s: any) => ({
              name: s.name || s,
              level: s.level || 'Intermediate',
              category: s.category || 'Other',
            })),
          },
          certifications: (parsed.certifications || []).map((cert: any) => ({
            id: cert.id || crypto.randomUUID(),
            name: cert.name || '',
            issuer: cert.issuer || '',
            date: cert.date || '',
            expiryDate: cert.expiryDate || '',
            credentialId: cert.credentialId || '',
            credentialUrl: cert.credentialUrl || '',
            inProgress: cert.inProgress || false,
          })),
          projects: (parsed.projects || []).map((proj: any) => ({
            id: proj.id || crypto.randomUUID(),
            name: proj.name || '',
            description: proj.description || '',
            technologies: proj.technologies || [],
            url: proj.url || '',
            githubUrl: proj.githubUrl || '',
            startDate: proj.startDate || '',
            endDate: proj.endDate || '',
            current: proj.current || false,
            achievements: proj.achievements || [],
            role: proj.role || '',
          })),
          languages: (parsed.languages || []).map((lang: any) => ({
            name: lang.name || '',
            proficiency: lang.proficiency || 'Intermediate',
          })),
          volunteer: currentResume?.sections.volunteer || [],
          publications: currentResume?.sections.publications || [],
          awards: currentResume?.sections.awards || [],
          customSections: currentResume?.sections.customSections || [],
        },
        metadata: {
          ...currentResume!.metadata,
          updatedAt: new Date().toISOString(),
          completeness: confidence > 0.8 ? 90 : confidence > 0.6 ? 80 : 70,
          parsedWith: 'ml',
          parsedConfidence: confidence,
          templateType: templateType,
          requiresReview: requiresReview,
        },
        rawText: result.rawText,
      };

      setCurrentResume(fullResume);
      
      const expCount = parsed.experience?.length || 0;
      const eduCount = parsed.education?.length || 0;
      const skillCount = (parsed.skills?.technical?.length || 0) + (parsed.skills?.soft?.length || 0);
      
      if (confidence > 0.8) {
        toast.success(`✅ Auto-populated with high confidence! ${expCount} jobs, ${eduCount} degrees, ${skillCount} skills`);
      } else if (confidence > 0.6) {
        toast.success(`📝 Auto-populated with medium confidence. ${expCount} jobs, ${eduCount} degrees, ${skillCount} skills`);
        toast('💡 Review suggested corrections below', { duration: 5000 });
        setShowMLSuggestions(true);
      } else {
        toast.error(`⚠️ Low confidence parse. Please review and correct.`);
        toast('💡 Use AI suggestions to improve parsing', { duration: 5000 });
        setShowMLSuggestions(true);
      }

      if (suggestions.length > 0) {
        setShowMLSuggestions(true);
      }

      await analyzeResume(result.rawText);

      if (autoLearn && confidence > 0.7) {
        await autoLearnFromParse(result, fullResume);
      }

      setParseHistory(prev => [...prev, {
        timestamp: new Date().toISOString(),
        confidence,
        templateType,
        sections: Object.keys(parsed).join(', '),
        suggestions: suggestions.length,
      }]);

      loadParserStats();

    } catch (error: any) {
      toast.error('Failed: ' + error.message);
      console.error('Parse error:', error);
    } finally {
      setParsing(false);
    }
  };

  // ============================================
  // AUTO-LEARN FROM SUCCESSFUL PARSE
  // ============================================

  const autoLearnFromParse = async (result: any, fullResume: any) => {
    try {
      const parser = ResumeParser.getInstance();
      const trainingExample: TrainingExample = {
        id: crypto.randomUUID(),
        rawText: result.rawText,
        sections: result.parsed,
        templateType: result.templateType || 'unknown',
        confidence: result.confidence || 0.5,
        corrections: result.parsed,
        timestamp: new Date().toISOString()
      };
      
      await parser.batchLearnFromCorrections([trainingExample]);
      console.log('📚 Auto-learned from parse');
    } catch (error) {
      console.warn('Auto-learning failed:', error);
    }
  };

  // ============================================
  // HANDLE USER CORRECTION - LEARN FROM USER
  // ============================================

  const handleUserCorrection = async (correctedSections: any) => {
    if (!currentResume) return;

    try {
      const parser = ResumeParser.getInstance();
      const aiService = AIService.getInstance();

      await parser.learnFromCorrection(
        currentResume.rawText || '',
        currentResume.sections,
        correctedSections,
        currentResume.metadata.templateType || 'unknown'
      );

      setCurrentResume({
        ...currentResume,
        sections: correctedSections,
        metadata: {
          ...currentResume.metadata,
          updatedAt: new Date().toISOString(),
          requiresReview: false,
        }
      });

      await aiService.learnFromCorrection(
        currentResume.rawText || '',
        currentResume.sections,
        correctedSections,
        currentResume.metadata.templateType || 'unknown'
      );

      toast.success('✅ Correction learned! The parser will improve over time.');
      await handleReAnalyze();
      loadParserStats();
      setMLSuggestions([]);
      setShowMLSuggestions(false);

    } catch (error: any) {
      toast.error('Failed to learn correction: ' + error.message);
    }
  };

  // ============================================
  // AI ANALYSIS
  // ============================================

  const analyzeResume = async (resumeText: string) => {
    setAILoading(true);
    try {
      const aiService = AIService.getInstance();
      const score = await aiService.analyzeATS(resumeText);
      setATSScore(score);
      const recs = await aiService.getRecommendations(resumeText, score);
      setAIRecommendations(recs || []);
      
      const parser = ResumeParser.getInstance();
      const parserStats = parser.getParserStats();
      
      const mlConfidence = parserStats?.averageConfidence || 0;
      const confidenceMsg = mlConfidence > 0.7 
        ? '🎯 ML model confidence: ' + Math.round(mlConfidence * 100) + '%'
        : '📚 Parser learning: ' + Math.round(mlConfidence * 100) + '% (improving with use)';
      
      toast.success(`ATS Score: ${score.overall}/100 - ${recs?.length || 0} tips. ${confidenceMsg}`);
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed: ' + error.message);
    } finally {
      setAILoading(false);
    }
  };

  // ============================================
  // RE-ANALYZE FROM EDITOR
  // ============================================

  const handleReAnalyze = async () => {
    if (!currentResume) return;
    const s = currentResume.sections;
    let text = '';
    
    if (s.contact.fullName) {
      text += `${s.contact.fullName}\n${s.contact.email} | ${s.contact.phone}\n`;
      if (s.contact.location) text += `${s.contact.location}\n`;
      if (s.contact.linkedIn) text += `${s.contact.linkedIn}\n`;
      text += '\n';
    }
    
    if (s.summary?.content) text += `PROFESSIONAL SUMMARY\n${s.summary.content}\n\n`;
    
    if (s.experience?.length) {
      text += 'PROFESSIONAL EXPERIENCE\n\n';
      s.experience.forEach((e: any) => {
        text += `${e.position} | ${e.startDate} - ${e.current ? 'Present' : e.endDate}\n${e.company}\n`;
        if (e.description) text += `${e.description}\n`;
        e.achievements?.forEach((a: string) => { if (a.trim()) text += `• ${a}\n`; });
        text += '\n';
      });
    }
    
    if (s.education?.length) {
      text += 'EDUCATION\n\n';
      s.education.forEach((e: any) => {
        text += `${e.degree}${e.field ? ' in ' + e.field : ''} | ${e.institution}\n`;
        if (e.startDate) text += `${e.startDate} - ${e.endDate || 'Present'}\n`;
        text += '\n';
      });
    }
    
    if (s.skills) {
      const all = [...(s.skills.technical||[]), ...(s.skills.soft||[]), ...(s.skills.tools||[])].map((sk: any) => sk.name || sk).filter(Boolean);
      if (all.length) text += `SKILLS\n${all.join(', ')}\n\n`;
    }
    
    if (s.projects?.length) {
      text += 'PROJECTS\n\n';
      s.projects.forEach((p: any) => { text += `${p.name}\n${p.description}\n\n`; });
    }
    
    if (s.certifications?.length) {
      text += 'CERTIFICATIONS\n';
      s.certifications.forEach((c: any) => { text += `• ${c.name}${c.issuer ? ' - ' + c.issuer : ''}\n`; });
    }
    
    await analyzeResume(text);
  };

  // ============================================
  // BATCH TRAINING
  // ============================================

  const handleBatchTraining = async () => {
    setIsTraining(true);
    try {
      const parser = ResumeParser.getInstance();
      const aiService = AIService.getInstance();
      
      const history = JSON.parse(localStorage.getItem('resumeParserCorrectionHistory') || '[]');
      
      if (history.length === 0) {
        toast('No corrections to train on. Parse some resumes first!');
        return;
      }

      await parser.batchLearnFromCorrections(history);
      await aiService.batchLearnFromCorrections(history);
      
      toast.success(`✅ Trained on ${history.length} corrections!`);
      loadParserStats();
    } catch (error: any) {
      toast.error('Training failed: ' + error.message);
    } finally {
      setIsTraining(false);
    }
  };

  // ============================================
  // EXPORT TRAINING DATA
  // ============================================

  const handleExportTraining = () => {
    try {
      const parser = ResumeParser.getInstance();
      const data = parser.exportTrainingData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `training-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Training data exported!');
    } catch (error: any) {
      toast.error('Export failed: ' + error.message);
    }
  };

  // ============================================
  // IMPORT TRAINING DATA
  // ============================================

  const handleImportTraining = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = e.target?.result as string;
        const parser = ResumeParser.getInstance();
        const success = parser.importTrainingData(jsonData);
        if (success) {
          toast.success('Training data imported!');
          loadParserStats();
        } else {
          toast.error('Invalid training data');
        }
      } catch (error: any) {
        toast.error('Import failed: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  // ============================================
  // EXPORT - PAY-TO-DOWNLOAD FLOW
  // ============================================

  const handleExport = async (format: string) => {
    if (!currentResume) {
      toast.error('No resume to export');
      return;
    }

    // 🔒 CHECK SUBSCRIPTION - PAY TO DOWNLOAD
    if (!hasActiveSubscription()) {
      // Close export modal and redirect to pricing with source parameter
      setShowExport(false);
      navigate('/pricing?source=download');
      toast('💳 Please subscribe to download your resume', { duration: 5000 });
      return;
    }

    // ✅ Active subscription - allow download
    setExportLoading(true);
    try {
      const generator = ResumeGenerator.getInstance();
      await generator.downloadResume(currentResume, {
        format: format as any,
        templateId: currentResume.metadata.templateId,
        includeAISuggestions: false,
        includeATSScore: true,
        pageSize: 'A4',
        margins: 'normal',
        fontSize: 'normal',
      });
      toast.success(`✅ Resume exported as ${format.toUpperCase()}!`);
      setShowExport(false);
    } catch (error: any) {
      toast.error(error.message || 'Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  // ============================================
  // RENDER ML SUGGESTIONS PANEL
  // ============================================

  const renderMLSuggestions = () => {
    if (!showMLSuggestions || mlSuggestions.length === 0) return null;

    return (
      <div className="fixed bottom-20 right-4 w-96 max-h-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MdLightbulb className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">ML Suggestions</span>
          </div>
          <button
            onClick={() => setShowMLSuggestions(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-80">
          {mlSuggestions.map((suggestion, index) => (
            <div key={index} className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-gray-500">{suggestion.field}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  suggestion.confidence > 0.7 ? 'bg-green-100 text-green-700' :
                  suggestion.confidence > 0.4 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {Math.round(suggestion.confidence * 100)}%
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{suggestion.value}</p>
              {suggestion.alternativeValues && (
                <div className="mt-1 text-xs text-gray-500">
                  Alternatives: {suggestion.alternativeValues.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER TRAINING PANEL
  // ============================================

  const renderTrainingPanel = () => {
    if (!showTrainingPanel) return null;

    return (
      <div className="fixed bottom-4 left-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MdHistory className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">Training Center</span>
          </div>
          <button
            onClick={() => setShowTrainingPanel(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <div className="p-4 space-y-3">
          {parserStats && (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Corrections</span>
                <span className="font-medium">{parserStats.correctionHistoryCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Avg Confidence</span>
                <span className="font-medium">{Math.round(parserStats.averageConfidence * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cache Size</span>
                <span className="font-medium">{parserStats.cacheSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Templates</span>
                <span className="font-medium">{Object.keys(parserStats.templateTypes).length}</span>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleBatchTraining}
              disabled={isTraining}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isTraining ? 'Training...' : 'Train on Corrections'}
            </button>
            <button
              onClick={handleExportTraining}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Export
            </button>
            <label className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer">
              Import
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportTraining(file);
                }}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={autoLearn}
                onChange={(e) => setAutoLearn(e.target.checked)}
                className="rounded"
              />
              Auto-learn from parses
            </label>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  if (!pageLoaded || parsing) {
    return <Loading type="page" text={parsing ? 'Analyzing resume with ML...' : 'Loading...'} fullScreen />;
  }

  const isDownloadLocked = !hasActiveSubscription();

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <h1 className="text-sm font-semibold text-gray-900">
            {currentResume?.metadata.title || 'Untitled'}
          </h1>
          {isDirty && <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />}
          {aiLoading && <span className="text-xs text-blue-600 animate-pulse">Analyzing...</span>}
          
          {/* ML Confidence Badge */}
          {mlConfidence > 0 && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              mlConfidence >= 0.8 ? 'bg-green-100 text-green-700' :
              mlConfidence >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              ML: {Math.round(mlConfidence * 100)}%
            </span>
          )}
          
          {/* ATS Score Badge */}
          {atsScore && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              atsScore.overall >= 80 ? 'bg-green-100 text-green-700' : 
              atsScore.overall >= 60 ? 'bg-yellow-100 text-yellow-700' : 
              'bg-red-100 text-red-700'
            }`}>
              ATS: {atsScore.overall}/100
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Subscription Status Badge */}
          {user?.subscription && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              hasActiveSubscription() 
                ? 'bg-green-100 text-green-700' 
                : 'bg-orange-100 text-orange-700'
            }`}>
              {hasActiveSubscription() 
                ? `✅ ${getDaysRemaining()} days left` 
                : 'UPGRADE'}
            </span>
          )}

          <button
            onClick={() => setShowTrainingPanel(!showTrainingPanel)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Training Center"
          >
            <MdSettings className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <MdCloudUpload className="w-4 h-4"/> Upload
          </button>
          <button
            onClick={handleReAnalyze}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50"
          >
            <MdAutoAwesome className="w-4 h-4"/> {aiLoading?'Analyzing...':'Re-analyze'}
          </button>
          <button
            onClick={saveResume}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg ${
              isDirty ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-gray-400 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <MdSave className="w-4 h-4"/> Save
          </button>
          
          {/* 🔒 DOWNLOAD BUTTON - Pay-to-Download Flow */}
          <button
  onClick={() => {
    if (isDownloadLocked) {
      // Show message explaining they need to pay $1
      toast.error('💳 Pay $1 for 14-day trial to download your resume'');
      navigate('/pricing?source=download');
      return;
    }
    setShowExport(true);
  }}
  className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
    !isDownloadLocked
      ? 'text-white bg-blue-600 hover:bg-blue-700'
      : 'text-white bg-orange-500 hover:bg-orange-600 animate-pulse'
  }`}
  title={isDownloadLocked ? 'Pay $1 to unlock downloads' : 'Download your resume'}
>
  {isDownloadLocked ? (
    <><MdLock className="w-4 h-4" /> Download</>
  ) : (
    <><MdDownload className="w-4 h-4" /> Download</>
  )}
</button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 overflow-hidden">
        <ResumeEditor 
          onExport={handleExport} 
          onCorrection={handleUserCorrection}
        />
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Resume" size="md">
        <FileUpload 
          onFileSelect={handleFileUpload} 
          label="Upload Resume" 
          description="Upload PDF, DOCX, or TXT. ML will automatically populate all sections with intelligent parsing."
        />
        {parserStats && parserStats.correctionHistoryCount > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <span className="font-medium">🧠 ML Model:</span> Trained on {parserStats.correctionHistoryCount} corrections. 
            Confidence: {Math.round(parserStats.averageConfidence * 100)}%
          </div>
        )}
      </Modal>

      {/* Export Modal */}
      <Modal isOpen={showExport} onClose={() => setShowExport(false)} title="Download Resume" size="sm">
        <div className="space-y-3">
          {[
            {format:'pdf', icon:<MdPictureAsPdf/>, label:'PDF', desc:'Best for job applications', color:'text-red-600 bg-red-50'},
            {format:'docx', icon:<MdDescription/>, label:'Word', desc:'Editable format', color:'text-blue-600 bg-blue-50'},
            {format:'txt', icon:<MdTextSnippet/>, label:'Text', desc:'ATS-optimized plain text', color:'text-green-600 bg-green-50'}
          ].map(o => (
            <button
              key={o.format}
              onClick={() => handleExport(o.format)}
              className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
            >
              <div className={`w-10 h-10 ${o.color} rounded-lg flex items-center justify-center`}>
                {React.cloneElement(o.icon, {className:'w-5 h-5'})}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">{o.label}</p>
                <p className="text-xs text-gray-500">{o.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* ML Suggestions Panel */}
      {renderMLSuggestions()}

      {/* Training Panel */}
      {renderTrainingPanel()}
    </div>
  );
};

export default Builder;
