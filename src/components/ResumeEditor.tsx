// ============================================
// RESUME EDITOR - Main Editor Component
// ============================================

import React, { useState, useEffect } from 'react';
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
} from 'react-icons/md';
import { useResume, useAI, useUndoRedo, useUI } from '../store';
import DynamicSection from './DynamicSection';
import ATSScore from './ATSScore';
import AIAssistant from './AIAssistant';
import AIService from '../lib/ai';
import TemplateSelector from './TemplateSelector';
import ResumePreview from './ResumePreview';
import FileUpload from './FileUpload';
import Modal from './Modal';
import { RESUME_SECTIONS } from '../config/constants';
import { calculateResumeCompleteness } from '../lib/utils';
import toast from 'react-hot-toast';

interface ResumeEditorProps {
  onExport?: (format: string) => void;
}

const ResumeEditor: React.FC<ResumeEditorProps> = ({ onExport }) => {
  const { currentResume, saveResume, createNewResume, isDirty } = useResume();
  const { atsScore, setATSScore, setAIRecommendations, setAILoading } = useAI();
  const { canUndo, canRedo, undo, redo } = useUndoRedo();
  const { openModal, closeModal } = useUI();

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const completeness = currentResume
    ? calculateResumeCompleteness(currentResume.sections)
    : 0;

  // Auto-save
  useEffect(() => {
    if (!autoSaveEnabled || !isDirty) return;

    const interval = setInterval(() => {
      if (isDirty) {
        handleSave();
      }
    }, 30000); // Auto-save every 30 seconds

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
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [undo, redo]);

  const handleSave = () => {
    saveResume();
    toast.success('Resume saved successfully!');
  };

  const handleAnalyze = async () => {
  if (!currentResume) return;
  
  setAILoading(true);
  try {
    // Import and call REAL AI service
    const AIService = (await import('../lib/ai')).default;
    const aiService = AIService.getInstance();
    
    // Build resume text from sections
    const sections = currentResume.sections;
    let resumeText = '';
    
    if (sections.contact.fullName) {
      resumeText += `${sections.contact.fullName}\n`;
      resumeText += `${sections.contact.email} | ${sections.contact.phone}\n\n`;
    }
    if (sections.summary?.content) {
      resumeText += `SUMMARY: ${sections.summary.content}\n\n`;
    }
    if (sections.experience?.length) {
      resumeText += 'EXPERIENCE:\n';
      sections.experience.forEach(exp => {
        resumeText += `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})\n`;
        resumeText += `${exp.description}\n`;
        exp.achievements?.forEach(a => resumeText += `- ${a}\n`);
        resumeText += '\n';
      });
    }
    if (sections.education?.length) {
      resumeText += 'EDUCATION:\n';
      sections.education.forEach(edu => {
        resumeText += `${edu.degree} - ${edu.institution}\n`;
      });
      resumeText += '\n';
    }
    if (sections.skills) {
      const skills = [
        ...(sections.skills.technical || []).map(s => s.name),
        ...(sections.skills.soft || []).map(s => s.name),
        ...(sections.skills.tools || []).map(s => s.name),
      ];
      resumeText += `SKILLS: ${skills.join(', ')}\n`;
    }

    // Call real AI
    const score = await aiService.analyzeATS(resumeText);
    setATSScore(score);
    
    // Get recommendations
    const recommendations = await aiService.getRecommendations(resumeText, score);
    setAIRecommendations(recommendations);
    
    toast.success(`ATS Score: ${score.overall}/100 with ${recommendations.length} recommendations!`);
  } catch (error: any) {
    console.error('Analysis error:', error);
    toast.error('Analysis failed. Using local analysis instead.');
    
    // Fallback to local analysis
    const AIService = (await import('../lib/ai')).default;
    const aiService = AIService.getInstance();
    const score = await aiService.analyzeATS(''); // Will use fallback
    setATSScore(score);
  } finally {
    setAILoading(false);
  }
};

  return (
    <div className="flex h-full">
      {/* Left Panel - Editor */}
      <div className={`${activeTab === 'editor' ? 'w-full lg:w-1/2' : 'hidden lg:block lg:w-1/2'} flex flex-col border-r border-gray-200`}>
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
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

          <div className="flex items-center gap-2">
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
              <span className="text-sm font-semibold text-gray-900">{completeness}%</span>
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
              <button
                onClick={handleAnalyze}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <MdAutoAwesome className="w-4 h-4" />
                Analyze Resume
              </button>
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
          onFileSelect={(file) => {
            // Handle file upload
            toast.success('Resume uploaded! Analyzing...');
            setShowUpload(false);
          }}
          label="Upload Resume"
          description="Upload your existing resume to get started"
        />
      </Modal>
    </div>
  );
};

export default ResumeEditor;
