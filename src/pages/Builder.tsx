// src/pages/Builder.tsx
// ============================================
// BUILDER PAGE - ML-Enhanced with Intelligent Parser
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  MdSave, MdDownload, MdPictureAsPdf, MdDescription,
  MdTextSnippet, MdAutoAwesome, MdCloudUpload,
  MdLightbulb, MdSettings,
} from 'react-icons/md';
import { useResume, useAI, useExport, useAuth } from '../store';
import ResumeEditor from '../components/ResumeEditor';
import Modal from '../components/Modal';
import FileUpload from '../components/FileUpload';
import Loading from '../components/Loading';
import ResumeParser from '../lib/parser';
import AIService from '../lib/ai';
import ResumeGenerator from '../lib/generator';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================

interface MLParseResult {
  sections: any;
  confidence: number;
  suggestions: any[];
  templateType: string;
  requiresReview: boolean;
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

  const [showExport, setShowExport] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showMLSuggestions, setShowMLSuggestions] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [mlSuggestions, setMLSuggestions] = useState<any[]>([]);
  const [mlConfidence, setMLConfidence] = useState<number>(0);
  const [autoLearn, setAutoLearn] = useState(true);
  const [parserStats, setParserStats] = useState<any>(null);
  const isUpload = searchParams.get('upload') === 'true';

  useEffect(() => { const t = setTimeout(() => setPageLoaded(true), 500); return () => clearTimeout(t); }, []);
  useEffect(() => { if (isUpload) setShowUpload(true); }, [isUpload]);
  useEffect(() => { if (!currentResume && pageLoaded) createNewResume('My Resume'); }, [currentResume, pageLoaded]);
  useEffect(() => { loadParserStats(); }, []);

  const hasActiveSubscription = useCallback(() => {
    if (!user?.subscription) return false;
    if (user.subscription.status !== 'active') return false;
    return new Date(user.subscription.endDate) > new Date();
  }, [user]);

  const loadParserStats = () => {
    try {
      const parser = ResumeParser.getInstance();
      const stats = parser.getParserStats();
      setParserStats(stats);
    } catch (e) { /* ignore */ }
  };

  // ============================================
  // FILE UPLOAD WITH ML PARSER
  // ============================================

  const handleFileUpload = async (file: File) => {
    setParsing(true);
    setShowUpload(false);

    try {
      const parser = ResumeParser.getInstance();
      const result = await parser.parseFile(file);

      if (!result.success) {
        toast.error(result.errors.join('. '));
        setParsing(false);
        return;
      }

      const parsed = result.parsed;
      const confidence = result.confidence || 0;
      const suggestions = result.suggestions || [];
      const templateType = result.templateType || 'standard';
      const requiresReview = result.requiresReview || false;

      // Store ML data
      setMLSuggestions(suggestions);
      setMLConfidence(confidence);
      if (suggestions.length > 0) setShowMLSuggestions(true);

      // Build full resume from parsed data
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
              name: s.name || s, level: s.level || 'Intermediate', category: s.category || 'Technical',
            })),
            soft: (parsed.skills?.soft || []).map((s: any) => ({
              name: s.name || s, level: s.level || 'Intermediate', category: s.category || 'Soft Skills',
            })),
            languages: (parsed.skills?.languages || []).map((s: any) => ({
              name: s.name || s, level: s.level || 'Intermediate', category: 'Language',
            })),
            tools: (parsed.skills?.tools || []).map((s: any) => ({
              name: s.name || s, level: s.level || 'Intermediate', category: s.category || 'Tools',
            })),
            other: [],
          },
          certifications: (parsed.certifications || []).map((cert: any) => ({
            id: cert.id || crypto.randomUUID(),
            name: cert.name || '',
            issuer: cert.issuer || '',
            date: cert.date || '',
            inProgress: cert.inProgress || false,
          })),
          projects: (parsed.projects || []).map((proj: any) => ({
            id: proj.id || crypto.randomUUID(),
            name: proj.name || '',
            description: proj.description || '',
            technologies: proj.technologies || [],
            achievements: proj.achievements || [],
            role: proj.role || '',
            current: false,
            startDate: '',
            endDate: '',
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
          completeness: confidence > 0.8 ? 90 : confidence > 0.6 ? 75 : 60,
          parsedConfidence: confidence,
          templateType: templateType,
          requiresReview: requiresReview,
        },
      };

      setCurrentResume(fullResume);

      const expCount = parsed.experience?.length || 0;
      const eduCount = parsed.education?.length || 0;
      const skillCount = (parsed.skills?.technical?.length || 0) + (parsed.skills?.soft?.length || 0);

      if (confidence > 0.8) {
        toast.success(`✅ High confidence! ${expCount} jobs, ${eduCount} degrees, ${skillCount} skills`);
      } else if (confidence > 0.5) {
        toast.success(`📝 Medium confidence. ${expCount} jobs, ${eduCount} degrees. Review suggested.`);
      } else {
        toast('⚠️ Low confidence. Please review carefully.');
      }

      // AI Analysis
      await analyzeResume(result.rawText);

      // Auto-learn
      if (autoLearn && confidence > 0.6 && result.rawText) {
        try {
          const correctionData = {
            rawText: result.rawText,
            sections: parsed,
            templateType: templateType,
            confidence: confidence,
            timestamp: new Date().toISOString(),
          };
          parser.batchLearnFromCorrections([correctionData]);
        } catch (e) { /* silent */ }
      }

      loadParserStats();
    } catch (error: any) {
      toast.error('Parse failed: ' + error.message);
    } finally {
      setParsing(false);
    }
  };

  // ============================================
  // AI ANALYSIS
  // ============================================

  const analyzeResume = async (text: string) => {
    setAILoading(true);
    try {
      const ai = AIService.getInstance();
      const score = await ai.analyzeATS(text);
      setATSScore(score);
      const recs = await ai.getRecommendations(text, score);
      setAIRecommendations(recs || []);
      toast.success(`ATS: ${score.overall}/100 - ${recs?.length || 0} tips`);
    } catch (e: any) {
      console.error('Analysis error:', e);
    } finally {
      setAILoading(false);
    }
  };

  // ============================================
  // RE-ANALYZE
  // ============================================

  const handleReAnalyze = async () => {
    if (!currentResume) return;
    const s = currentResume.sections;
    let text = '';
    if (s.contact.fullName) text += `${s.contact.fullName}\n${s.contact.email} | ${s.contact.phone}\n\n`;
    if (s.summary?.content) text += `SUMMARY\n${s.summary.content}\n\n`;
    if (s.experience?.length) {
      text += 'EXPERIENCE\n';
      s.experience.forEach((e: any) => {
        text += `${e.position} | ${e.company} | ${e.startDate}-${e.current ? 'Present' : e.endDate}\n`;
        e.achievements?.forEach((a: string) => { if (a.trim()) text += `• ${a}\n`; });
        text += '\n';
      });
    }
    if (s.education?.length) { text += 'EDUCATION\n'; s.education.forEach((e: any) => text += `${e.degree} | ${e.institution}\n`); text += '\n'; }
    if (s.skills) {
      const all = [...(s.skills.technical || []), ...(s.skills.soft || []), ...(s.skills.tools || [])].map((sk: any) => sk.name || sk).filter(Boolean);
      if (all.length) text += `SKILLS\n${all.join(', ')}\n\n`;
    }
    await analyzeResume(text);
  };

  // ============================================
  // EXPORT WITH SUBSCRIPTION CHECK
  // ============================================

  const handleExport = async (format: string) => {
    if (!currentResume) { toast.error('No resume'); return; }
    if (!hasActiveSubscription()) { toast.error('Subscribe to download resumes'); navigate('/pricing'); return; }
    setExportLoading(true);
    try {
      const gen = ResumeGenerator.getInstance();
      await gen.downloadResume(currentResume, {
        format: format as any,
        templateId: currentResume.metadata.templateId,
        includeAISuggestions: false,
        includeATSScore: true,
        pageSize: 'A4', margins: 'normal', fontSize: 'normal',
      });
      toast.success(`Exported as ${format.toUpperCase()}!`);
      setShowExport(false);
    } catch (e: any) { toast.error(e.message); }
    finally { setExportLoading(false); }
  };

  // ============================================
  // RENDER
  // ============================================

  if (!pageLoaded || parsing) {
    return <Loading type="page" text={parsing ? 'ML parsing resume...' : 'Loading...'} fullScreen />;
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-600 hover:text-gray-900">← Back</button>
          <div className="w-px h-5 bg-gray-200" />
          <h1 className="text-sm font-semibold text-gray-900">{currentResume?.metadata.title || 'Untitled'}</h1>
          {isDirty && <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />}
          {aiLoading && <span className="text-xs text-blue-600 animate-pulse">Analyzing...</span>}
          {mlConfidence > 0 && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${mlConfidence >= 0.8 ? 'bg-green-100 text-green-700' : mlConfidence >= 0.6 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
              ML: {Math.round(mlConfidence * 100)}%
            </span>
          )}
          {atsScore && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${atsScore.overall >= 80 ? 'bg-green-100 text-green-700' : atsScore.overall >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
              ATS: {atsScore.overall}/100
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {mlSuggestions.length > 0 && (
            <button onClick={() => setShowMLSuggestions(!showMLSuggestions)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg">
              <MdLightbulb className="w-4 h-4" /> {mlSuggestions.length}
            </button>
          )}
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
            <MdCloudUpload className="w-4 h-4" /> Upload
          </button>
          <button onClick={handleReAnalyze} disabled={aiLoading} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50">
            <MdAutoAwesome className="w-4 h-4" /> {aiLoading ? 'Analyzing...' : 'Re-analyze'}
          </button>
          <button onClick={saveResume} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg ${isDirty ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-gray-400 bg-gray-50'}`}>
            <MdSave className="w-4 h-4" /> Save
          </button>
          <button
            onClick={() => hasActiveSubscription() ? setShowExport(true) : (toast.error('Subscribe to download'), navigate('/pricing'))}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg ${hasActiveSubscription() ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-400 bg-gray-100'}`}
          >
            {hasActiveSubscription() ? <MdDownload className="w-4 h-4" /> : '🔒'} Download
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <ResumeEditor onExport={handleExport} />
      </div>

      {/* ML Suggestions Panel */}
      {showMLSuggestions && mlSuggestions.length > 0 && (
        <div className="fixed bottom-4 right-4 w-80 max-h-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <span className="text-sm font-semibold">ML Suggestions</span>
            <button onClick={() => setShowMLSuggestions(false)} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          <div className="p-3 overflow-y-auto max-h-64 space-y-2">
            {mlSuggestions.map((s: any, i: number) => (
              <div key={i} className="p-2 bg-gray-50 rounded-lg text-xs">
                <span className="font-medium text-gray-700">{s.field}:</span>{' '}
                <span className="text-gray-600">{s.value}</span>
                {s.confidence && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full ${s.confidence > 0.7 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {Math.round(s.confidence * 100)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Resume" size="md">
        <FileUpload onFileSelect={handleFileUpload} label="Upload Resume" description="PDF, DOCX, or TXT. ML will auto-populate all sections." />
        {parserStats?.correctionHistoryCount > 0 && (
          <p className="mt-2 text-xs text-gray-500">🧠 ML trained on {parserStats.correctionHistoryCount} resumes</p>
        )}
      </Modal>

      {/* Export Modal */}
      <Modal isOpen={showExport} onClose={() => setShowExport(false)} title="Download" size="sm">
        <div className="space-y-3">
          {[{ format: 'pdf', icon: <MdPictureAsPdf />, label: 'PDF', desc: 'Best for applications', color: 'text-red-600 bg-red-50' }, { format: 'docx', icon: <MdDescription />, label: 'Word', desc: 'Editable', color: 'text-blue-600 bg-blue-50' }, { format: 'txt', icon: <MdTextSnippet />, label: 'Text', desc: 'ATS-optimized', color: 'text-green-600 bg-green-50' }].map(o => (
            <button key={o.format} onClick={() => handleExport(o.format)} className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50">
              <div className={`w-10 h-10 ${o.color} rounded-lg flex items-center justify-center`}>{React.cloneElement(o.icon, { className: 'w-5 h-5' })}</div>
              <div className="text-left"><p className="text-sm font-semibold text-gray-900">{o.label}</p><p className="text-xs text-gray-500">{o.desc}</p></div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Builder;
