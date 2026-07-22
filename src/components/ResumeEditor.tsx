// src/components/ResumeEditor.tsx
// ============================================
// RESUME EDITOR - Main Editor Component
// Fully integrated with ML Parser, AI Service, and Builder
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdSave,
  MdUndo,
  MdRedo,
  MdAutoAwesome,
  MdCloudUpload,
  MdDownload,
  MdVisibility,
  MdEdit,
  MdChecklist,
  MdWarning,
  MdAnalytics,
  MdLightbulb,
  MdHistory,
} from 'react-icons/md';
import { useResume, useAI, useUndoRedo, useUI } from '../store';
import DynamicSection from './DynamicSection';
import ATSScore from './ATSScore';
import AIAssistant from './AIAssistant';
import AIService from '../lib/ai';
import ResumeParser from '../lib/parser';
import TemplateSelector from './TemplateSelector';
import ResumePreview from './ResumePreview';
import FileUpload from './FileUpload';
import Modal from './Modal';
import { RESUME_SECTIONS } from '../config/constants';
import { calculateResumeCompleteness } from '../lib/utils';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================

interface ResumeEditorProps {
  onExport?: (format: string) => Promise<void>;
  onCorrection?: (correctedSections: any) => Promise<void>;
  onFileUpload?: (file: File) => Promise<void>;
}

// ============================================
// MAIN COMPONENT
// ============================================

const ResumeEditor: React.FC<ResumeEditorProps> = ({ 
  onExport, 
  onCorrection,
  onFileUpload 
}) => {
  // ============================================
  // HOOKS & STATE
  // ============================================

  const { 
    currentResume, 
    saveResume, 
    createNewResume, 
    isDirty,
    setCurrentResume 
  } = useResume();
  
  const { 
    atsScore, 
    setATSScore, 
    setAIRecommendations, 
    setAILoading,
    aiLoading 
  } = useAI();
  
  const { canUndo, canRedo, undo, redo } = useUndoRedo();
  const { openModal, closeModal } = useUI();

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showMLSuggestions, setShowMLSuggestions] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [mlSuggestions, setMLSuggestions] = useState<any[]>([]);
  const [mlConfidence, setMLConfidence] = useState<number>(0);

  const completeness = currentResume
    ? calculateResumeCompleteness(currentResume.sections)
    : 0;

  // ============================================
  // EFFECTS
  // ============================================

  // Auto-save
  useEffect(() => {
    if (!autoSaveEnabled || !isDirty) return;

    const interval = setInterval(() => {
      if (isDirty) {
        handleSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isDirty, autoSaveEnabled]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleAnalyze();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [undo, redo]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSave = useCallback(() => {
    saveResume();
    toast.success('✅ Resume saved successfully!');
  }, [saveResume]);

  const handleAnalyze = useCallback(async () => {
    if (!currentResume) {
      toast.error('No resume to analyze');
      return;
    }
    
    setAILoading(true);
    
    try {
      const AIService = (await import('../lib/ai')).default;
      const aiService = AIService.getInstance();
      
      // Build resume text from sections
      const sections = currentResume.sections;
      let resumeText = '';
      
      // Contact
      if (sections.contact.fullName) {
        resumeText += `${sections.contact.fullName}\n`;
        if (sections.contact.email) resumeText += `${sections.contact.email}`;
        if (sections.contact.phone) resumeText += ` | ${sections.contact.phone}`;
        if (sections.contact.location) resumeText += ` | ${sections.contact.location}`;
        resumeText += '\n\n';
      }
      
      // Summary
      if (sections.summary?.content) {
        resumeText += `PROFESSIONAL SUMMARY\n${sections.summary.content}\n\n`;
      }
      
      // Experience
      if (sections.experience?.length) {
        resumeText += 'PROFESSIONAL EXPERIENCE\n\n';
        sections.experience.forEach((exp: any) => {
          resumeText += `${exp.position} at ${exp.company}`;
          if (exp.startDate) {
            resumeText += ` (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || ''})`;
          }
          resumeText += '\n';
          if (exp.location) resumeText += `${exp.location}\n`;
          if (exp.description) resumeText += `${exp.description}\n`;
          exp.achievements?.forEach((a: string) => {
            if (a.trim()) resumeText += `• ${a}\n`;
          });
          resumeText += '\n';
        });
      }
      
      // Education
      if (sections.education?.length) {
        resumeText += 'EDUCATION\n\n';
        sections.education.forEach((edu: any) => {
          resumeText += `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`;
          if (edu.institution) resumeText += ` - ${edu.institution}`;
          resumeText += '\n';
          if (edu.startDate) {
            resumeText += `${edu.startDate} - ${edu.endDate || 'Present'}\n`;
          }
          if (edu.gpa) resumeText += `GPA: ${edu.gpa}\n`;
          resumeText += '\n';
        });
      }
      
      // Skills
      if (sections.skills) {
        const allSkills = [
          ...(sections.skills.technical || []).map((s: any) => s.name),
          ...(sections.skills.soft || []).map((s: any) => s.name),
          ...(sections.skills.tools || []).map((s: any) => s.name),
          ...(sections.skills.frameworks || []).map((s: any) => s.name),
          ...(sections.skills.databases || []).map((s: any) => s.name),
          ...(sections.skills.cloudPlatforms || []).map((s: any) => s.name),
        ];
        if (allSkills.length) {
          resumeText += `SKILLS\n${allSkills.join(', ')}\n\n`;
        }
      }
      
      // Projects
      if (sections.projects?.length) {
        resumeText += 'PROJECTS\n\n';
        sections.projects.forEach((proj: any) => {
          resumeText += `${proj.name}\n`;
          if (proj.description) resumeText += `${proj.description}\n`;
          if (proj.technologies?.length) {
            resumeText += `Technologies: ${proj.technologies.join(', ')}\n`;
          }
          resumeText += '\n';
        });
      }
      
      // Call real AI
      const score = await aiService.analyzeATS(resumeText);
      setATSScore(score);
      
      // Get recommendations
      const recommendations = await aiService.getRecommendations(resumeText, score);
      setAIRecommendations(recommendations);
      
      toast.success(`📊 ATS Score: ${score.overall}/100 - ${recommendations.length} recommendations!`);
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Using fallback.');
      
      // Fallback
      try {
        const AIService = (await import('../lib/ai')).default;
        const aiService = AIService.getInstance();
        const score = await aiService.analyzeATS('');
        setATSScore(score);
      } catch (fallbackError) {
        toast.error('Failed to analyze resume');
      }
    } finally {
      setAILoading(false);
    }
  }, [currentResume, setATSScore, setAIRecommendations, setAILoading]);

  // ============================================
  // FILE UPLOAD WITH ML PARSER
  // ============================================

  const handleFileUpload = useCallback(async (file: File) => {
    if (onFileUpload) {
      await onFileUpload(file);
      return;
    }

    setIsParsing(true);
    setShowUpload(false);

    try {
      const parser = ResumeParser.getInstance();
      const result = await parser.parseFile(file);

      if (!result.success) {
        toast.error(result.errors.join('. '));
        setIsParsing(false);
        return;
      }

      const parsed = result.parsed;
      const confidence = result.confidence || 0;
      const suggestions = result.suggestions || [];
      const templateType = result.templateType || 'unknown';
      const requiresReview = result.requiresReview || false;

      // Store ML suggestions
      setMLSuggestions(suggestions);
      setMLConfidence(confidence);

      // Build complete resume with parsed data
      const fullResume = {
        ...currentResume!,
        sections: {
          ...currentResume!.sections,
          contact: {
            fullName: parsed.contact?.fullName || '',
            email: parsed.contact?.email || '',
            phone: parsed.contact?.phone || '',
            location: parsed.contact?.location || '',
            country: parsed.contact?.country || '',
            linkedIn: parsed.contact?.linkedIn || '',
            portfolio: parsed.contact?.portfolio || '',
            github: parsed.contact?.github || '',
            twitter: parsed.contact?.twitter || '',
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
            aiSuggestions: exp.aiSuggestions || [],
            industry: exp.industry || '',
            employmentType: exp.employmentType || 'Full-time',
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
            location: edu.location || '',
            degreeType: edu.degreeType || 'Bachelor',
            achievements: edu.achievements || [],
          })),
          skills: {
            technical: (parsed.skills?.technical || []).map((s: any) => ({
              name: s.name || s,
              level: s.level || 'Intermediate',
              category: s.category || 'Technical',
              selfRated: s.selfRated || 3,
            })),
            soft: (parsed.skills?.soft || []).map((s: any) => ({
              name: s.name || s,
              level: s.level || 'Intermediate',
              category: s.category || 'Soft Skills',
              selfRated: s.selfRated || 3,
            })),
            // TO THIS (correct - using Skill interface)
languages: (parsed.skills?.languages || []).map((s: any) => ({
  name: s.name || s,
  level: s.proficiency || s.level || 'Intermediate',
  category: 'Languages',
  selfRated: s.selfRated || 3,
})),
            tools: (parsed.skills?.tools || []).map((s: any) => ({
              name: s.name || s,
              level: s.level || 'Intermediate',
              category: s.category || 'Tools',
              selfRated: s.selfRated || 3,
            })),
            other: (parsed.skills?.other || []).map((s: any) => ({
              name: s.name || s,
              level: s.level || 'Intermediate',
              category: s.category || 'Other',
              selfRated: s.selfRated || 3,
            })),
            frameworks: (parsed.skills?.frameworks || []).map((s: any) => ({
              name: s.name || s,
              level: s.level || 'Intermediate',
              category: 'Frameworks',
              selfRated: s.selfRated || 3,
            })),
            databases: (parsed.skills?.databases || []).map((s: any) => ({
              name: s.name || s,
              level: s.level || 'Intermediate',
              category: 'Databases',
              selfRated: s.selfRated || 3,
            })),
            cloudPlatforms: (parsed.skills?.cloudPlatforms || []).map((s: any) => ({
              name: s.name || s,
              level: s.level || 'Intermediate',
              category: 'Cloud Platforms',
              selfRated: s.selfRated || 3,
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
            skillsValidated: cert.skillsValidated || [],
            annualRenewal: cert.annualRenewal || false,
            isActive: cert.isActive !== undefined ? cert.isActive : true,
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
            teamSize: proj.teamSize || 0,
            problemSolved: proj.problemSolved || '',
            impactMetrics: proj.impactMetrics || [],
            featured: proj.featured || false,
          })),
          languages: (parsed.languages || []).map((lang: any) => ({
            name: lang.name || '',
            proficiency: lang.proficiency || 'Intermediate',
            readingLevel: lang.readingLevel || 'Intermediate',
            writingLevel: lang.writingLevel || 'Intermediate',
            speakingLevel: lang.speakingLevel || 'Intermediate',
            listeningLevel: lang.listeningLevel || 'Intermediate',
          })),
          volunteer: parsed.volunteer || [],
          publications: parsed.publications || [],
          awards: parsed.awards || [],
          customSections: parsed.customSections || [],
          professionalAffiliations: parsed.professionalAffiliations || [],
          conferences: parsed.conferences || [],
          patents: parsed.patents || [],
          references: parsed.references || [],
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

      // Show appropriate toast
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

      // Auto-analyze after upload
      setTimeout(() => {
        handleAnalyze();
      }, 1000);

    } catch (error: any) {
      toast.error('Failed to parse resume: ' + error.message);
      console.error('Parse error:', error);
    } finally {
      setIsParsing(false);
    }
  }, [currentResume, setCurrentResume, onFileUpload, handleAnalyze]);

  // ============================================
  // CORRECTION HANDLER
  // ============================================

  const handleCorrection = useCallback(async (correctedSections: any) => {
    if (onCorrection) {
      await onCorrection(correctedSections);
      return;
    }

    try {
      const parser = ResumeParser.getInstance();
      const aiService = AIService.getInstance();

      if (!currentResume) {
        toast.error('No resume to correct');
        return;
      }

      // Learn from correction
      await parser.learnFromCorrection(
        currentResume.rawText || '',
        currentResume.sections,
        correctedSections,
        currentResume.metadata.templateType || 'unknown'
      );

      // Also update AI service
      await aiService.learnFromCorrection(
        currentResume.rawText || '',
        currentResume.sections,
        correctedSections,
        currentResume.metadata.templateType || 'unknown'
      );

      // Update resume with corrections
      setCurrentResume({
        ...currentResume,
        sections: correctedSections,
        metadata: {
          ...currentResume.metadata,
          updatedAt: new Date().toISOString(),
          requiresReview: false,
        }
      });

      toast.success('✅ Correction learned! The parser will improve over time.');
      
      // Re-analyze after correction
      setTimeout(() => {
        handleAnalyze();
      }, 500);

      // Clear ML suggestions
      setMLSuggestions([]);
      setShowMLSuggestions(false);

    } catch (error: any) {
      toast.error('Failed to learn correction: ' + error.message);
    }
  }, [currentResume, setCurrentResume, onCorrection, handleAnalyze]);

  // ============================================
  // EXPORT HANDLER
  // ============================================

  const handleExport = useCallback(async (format: string) => {
    if (onExport) {
      await onExport(format);
      return;
    }
    
    try {
      const ResumeGenerator = (await import('../lib/generator')).default;
      const generator = ResumeGenerator.getInstance();
      
      if (!currentResume) {
        toast.error('No resume to export');
        return;
      }
      
      await generator.downloadResume(currentResume, {
        format: format as any,
        templateId: currentResume.metadata.templateId,
        includeAISuggestions: false,
        includeATSScore: true,
        pageSize: 'A4',
        margins: 'normal',
        fontSize: 'normal',
      });
      
      toast.success(`✅ Exported as ${format.toUpperCase()}!`);
    } catch (error: any) {
      toast.error('Export failed: ' + error.message);
    }
  }, [currentResume, onExport]);

  // ============================================
  // RENDER ML SUGGESTIONS
  // ============================================

  const renderMLSuggestions = () => {
    if (!showMLSuggestions || mlSuggestions.length === 0) return null;

    return (
      <div className="fixed bottom-20 right-4 w-96 max-h-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MdLightbulb className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">ML Suggestions</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {Math.round(mlConfidence * 100)}% confidence
            </span>
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
          <button
            onClick={() => handleCorrection(currentResume?.sections || {})}
            className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Corrections
          </button>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="flex h-full relative">
      {/* Left Panel - Editor */}
      <div className={`${activeTab === 'editor' ? 'w-full lg:w-1/2' : 'hidden lg:block lg:w-1/2'} flex flex-col border-r border-gray-200`}>
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
            >
              <MdUndo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
              aria-label="Redo"
              title="Redo (Ctrl+Shift+Z)"
            >
              <MdRedo className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                isDirty
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  : 'text-gray-400 bg-gray-50 cursor-not-allowed'
              }`}
            >
              <MdSave className="w-4 h-4" />
              Save
              {isDirty && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAI(!showAI)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                showAI ? 'text-purple-600 bg-purple-50' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MdAutoAwesome className="w-4 h-4" />
              AI Assistant
            </button>
            <button
              onClick={handleAnalyze}
              disabled={aiLoading || !currentResume}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <MdAnalytics className="w-4 h-4" />
              {aiLoading ? 'Analyzing...' : 'Analyze'}
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MdCloudUpload className="w-4 h-4" />
              Upload
            </button>
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Templates
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Completeness Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
              <div className="flex items-center gap-2">
                {mlConfidence > 0 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    ML: {Math.round(mlConfidence * 100)}%
                  </span>
                )}
                <span className="text-sm font-semibold text-gray-900">{completeness}%</span>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completeness}%` }}
                className={`h-full rounded-full ${
                  completeness >= 80 ? 'bg-green-500' : completeness >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              />
            </div>
          </div>

          {/* Resume Sections */}
          {RESUME_SECTIONS.map((section) => (
            <DynamicSection
              key={section.id}
              sectionType={section.id}
              title={section.title}
              icon={section.icon}
              required={section.required}
            />
          ))}

          {/* ATS Score Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">ATS Analysis</h3>
            </div>
            <ATSScore
              score={atsScore}
              compact
              onAnalyze={handleAnalyze}
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className={`${activeTab === 'preview' ? 'w-full' : 'hidden'} lg:block lg:w-1/2`}>
        <ResumePreview />
      </div>

      {/* Mobile Tab Switcher */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 lg:hidden z-30">
        <div className="flex bg-white rounded-full shadow-strong border border-gray-200 p-1">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'editor' ? 'bg-blue-600 text-white' : 'text-gray-600'
            }`}
          >
            <MdEdit className="w-4 h-4 inline mr-1" />
            Edit
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-600'
            }`}
          >
            <MdVisibility className="w-4 h-4 inline mr-1" />
            Preview
          </button>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <Modal
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        title="AI Resume Assistant"
        size="lg"
      >
        <AIAssistant />
      </Modal>

      {/* Template Selector Modal */}
      <Modal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        title="Choose a Template"
        size="xl"
      >
        <TemplateSelector onSelect={() => setShowTemplates(false)} />
      </Modal>

      {/* Upload Modal */}
      <Modal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        title="Upload Existing Resume"
        size="md"
      >
        <FileUpload
          onFileSelect={handleFileUpload}
          label="Upload Resume"
          description="Upload PDF, DOCX, or TXT. ML will automatically populate all sections with intelligent parsing."
        />
      </Modal>

      {/* ML Suggestions Panel */}
      {renderMLSuggestions()}
    </div>
  );
};

export default ResumeEditor;
