// ============================================
// BUILDER PAGE - Fixed Upload & Analysis Flow
// ============================================

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdSave,
  MdDownload,
  MdPictureAsPdf,
  MdDescription,
  MdTextSnippet,
  MdAutoAwesome,
  MdCloudUpload,
} from 'react-icons/md';
import { useResume, useAI, useExport } from '../store';
import ResumeEditor from '../components/ResumeEditor';
import Modal from '../components/Modal';
import FileUpload from '../components/FileUpload';
import Loading from '../components/Loading';
import ATSScore from '../components/ATSScore';
import ResumeParser from '../lib/parser';
import AIService from '../lib/ai';
import ResumeGenerator from '../lib/generator';
import toast from 'react-hot-toast';

const Builder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentResume, setCurrentResume, isDirty, saveResume } = useResume();
  const { atsScore, setATSScore, setAIRecommendations, setAILoading, aiLoading } = useAI();
  const { setExportLoading } = useExport();

  const [showExport, setShowExport] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const isUpload = searchParams.get('upload') === 'true';

  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-open upload if coming from upload flow
  useEffect(() => {
    if (isUpload) {
      setShowUpload(true);
    }
  }, [isUpload]);

  // Handle file upload and parsing
  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
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

      toast.success('Resume parsed successfully! Analyzing...');

      // Update current resume with parsed data
      if (currentResume) {
        const updatedResume = {
          ...currentResume,
          sections: {
            ...currentResume.sections,
            ...result.parsed,
          },
          metadata: {
            ...currentResume.metadata,
            updatedAt: new Date().toISOString(),
          },
        };
        setCurrentResume(updatedResume);

        // Run AI analysis
        await analyzeResume(result.rawText);
      }
    } catch (error: any) {
      toast.error('Failed to parse resume: ' + error.message);
    } finally {
      setParsing(false);
    }
  };

  // AI Analysis
  const analyzeResume = async (resumeText: string) => {
    setAILoading(true);
    try {
      const aiService = AIService.getInstance();
      
      // Get ATS Score
      const score = await aiService.analyzeATS(resumeText);
      setATSScore(score);

      // Get Recommendations
      const recommendations = await aiService.getRecommendations(resumeText, score);
      setAIRecommendations(recommendations);

      toast.success(`ATS Score: ${score.overall}/100`);
    } catch (error: any) {
      console.error('AI Analysis error:', error);
      toast.error('AI analysis failed. Please try again.');
    } finally {
      setAILoading(false);
    }
  };

  // Manual re-analyze
  const handleReAnalyze = async () => {
    if (!currentResume) return;
    
    // Build text from current resume sections
    let resumeText = '';
    const sections = currentResume.sections;
    
    if (sections.contact.fullName) {
      resumeText += `${sections.contact.fullName}\n`;
      resumeText += `${sections.contact.email} | ${sections.contact.phone}\n\n`;
    }
    if (sections.summary?.content) {
      resumeText += `${sections.summary.content}\n\n`;
    }
    if (sections.experience?.length) {
      resumeText += 'EXPERIENCE\n';
      sections.experience.forEach(exp => {
        resumeText += `${exp.position} at ${exp.company}\n${exp.description}\n`;
        exp.achievements?.forEach(a => resumeText += `- ${a}\n`);
        resumeText += '\n';
      });
    }
    if (sections.education?.length) {
      resumeText += 'EDUCATION\n';
      sections.education.forEach(edu => {
        resumeText += `${edu.degree} - ${edu.institution}\n\n`;
      });
    }
    if (sections.skills) {
      const skills = [
        ...(sections.skills.technical || []).map(s => s.name),
        ...(sections.skills.soft || []).map(s => s.name),
        ...(sections.skills.tools || []).map(s => s.name),
      ];
      if (skills.length) resumeText += `SKILLS: ${skills.join(', ')}\n`;
    }

    await analyzeResume(resumeText);
  };

  // Export
  const handleExport = async (format: string) => {
    if (!currentResume) {
      toast.error('No resume to export');
      return;
    }

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
      toast.success(`Resume exported as ${format.toUpperCase()}!`);
      setShowExport(false);
    } catch (error: any) {
      toast.error(error.message || 'Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  if (!pageLoaded || parsing) {
    return (
      <Loading 
        type="page" 
        text={parsing ? 'Analyzing your resume...' : 'Loading resume builder...'} 
        fullScreen 
      />
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <h1 className="text-sm font-semibold text-gray-900">
            {currentResume?.metadata.title || 'Untitled Resume'}
          </h1>
          {isDirty && (
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" title="Unsaved changes" />
          )}
          {aiLoading && (
            <span className="text-xs text-blue-600 animate-pulse">Analyzing...</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MdCloudUpload className="w-4 h-4" />
            Upload
          </button>
          <button
            onClick={handleReAnalyze}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <MdAutoAwesome className="w-4 h-4" />
            {aiLoading ? 'Analyzing...' : 'Re-analyze'}
          </button>
          <button
            onClick={saveResume}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              isDirty
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-400 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <MdSave className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MdDownload className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 overflow-hidden">
        <ResumeEditor onExport={handleExport} />
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        title="Upload Your Resume"
        size="md"
      >
        <FileUpload
          onFileSelect={handleFileUpload}
          label="Upload Resume"
          description="Upload your existing resume (PDF, DOCX, or TXT) for AI analysis and optimization"
        />
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title="Download Resume"
        size="sm"
      >
        <div className="space-y-3">
          {[
            { format: 'pdf', icon: <MdPictureAsPdf />, label: 'PDF Document', desc: 'Best for applications', color: 'text-red-600 bg-red-50' },
            { format: 'docx', icon: <MdDescription />, label: 'Word Document', desc: 'Editable format', color: 'text-blue-600 bg-blue-50' },
            { format: 'txt', icon: <MdTextSnippet />, label: 'Plain Text', desc: 'ATS-optimized', color: 'text-green-600 bg-green-50' },
          ].map((option) => (
            <button
              key={option.format}
              onClick={() => handleExport(option.format)}
              className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
            >
              <div className={`w-10 h-10 ${option.color} rounded-lg flex items-center justify-center`}>
                {React.cloneElement(option.icon, { className: 'w-5 h-5' })}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                <p className="text-xs text-gray-500">{option.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Builder;
