// ============================================
// BUILDER PAGE - Fixed Upload & Auto-Populate
// ============================================

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import ResumeParser from '../lib/parser';
import AIService from '../lib/ai';
import ResumeGenerator from '../lib/generator';
import toast from 'react-hot-toast';

const Builder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    currentResume, 
    createNewResume, 
    saveResume, 
    isDirty,
    setCurrentResume 
  } = useResume();
  const { atsScore, setATSScore, setAIRecommendations, setAILoading, aiLoading } = useAI();
  const { setExportLoading } = useExport();

  const [showExport, setShowExport] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  const isUpload = searchParams.get('upload') === 'true';

  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isUpload) {
      setShowUpload(true);
    }
  }, [isUpload]);

  // Create a new resume if none exists
  useEffect(() => {
    if (!currentResume && pageLoaded) {
      createNewResume('My Resume');
    }
  }, [currentResume, pageLoaded, createNewResume]);

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

      toast.success('Resume parsed successfully! Populating editor...');

      // Build complete resume data with parsed sections
      const parsedResume = {
        ...currentResume!,
        sections: {
          ...currentResume!.sections,
          // Contact info
          contact: {
            ...currentResume!.sections.contact,
            ...(result.parsed.contact || {}),
          },
          // Summary
          summary: result.parsed.summary || currentResume!.sections.summary,
          // Experience - replace with parsed
          experience: result.parsed.experience && result.parsed.experience.length > 0 
            ? result.parsed.experience 
            : currentResume!.sections.experience,
          // Education - replace with parsed
          education: result.parsed.education && result.parsed.education.length > 0 
            ? result.parsed.education 
            : currentResume!.sections.education,
          // Skills
          skills: result.parsed.skills 
            ? { ...currentResume!.sections.skills, ...result.parsed.skills }
            : currentResume!.sections.skills,
          // Certifications
          certifications: result.parsed.certifications && result.parsed.certifications.length > 0
            ? result.parsed.certifications
            : currentResume!.sections.certifications,
          // Projects
          projects: result.parsed.projects && result.parsed.projects.length > 0
            ? result.parsed.projects
            : currentResume!.sections.projects,
          // Languages
          languages: result.parsed.languages && result.parsed.languages.length > 0
            ? result.parsed.languages
            : currentResume!.sections.languages,
        },
        metadata: {
          ...currentResume!.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

      // Update the resume in the store - this triggers the preview to update
      setCurrentResume(parsedResume);

      toast.success('Resume populated! Running AI analysis...');

      // Run AI analysis on the raw text
      await analyzeResume(result.rawText);

      toast.success('Analysis complete! Edit your resume to improve your score.');
    } catch (error: any) {
      toast.error('Failed to parse resume: ' + error.message);
    } finally {
      setParsing(false);
    }
  };

  const analyzeResume = async (resumeText: string) => {
    setAILoading(true);
    try {
      const aiService = AIService.getInstance();
      
      const score = await aiService.analyzeATS(resumeText);
      setATSScore(score);

      const recommendations = await aiService.getRecommendations(resumeText, score);
      setAIRecommendations(recommendations);

      toast.success(`ATS Score: ${score.overall}/100 - ${recommendations.length} recommendations`);
    } catch (error: any) {
      console.error('AI Analysis error:', error);
      // Don't show error toast - the resume is still populated
    } finally {
      setAILoading(false);
    }
  };

  const handleReAnalyze = async () => {
    if (!currentResume) return;
    
    let resumeText = '';
    const sections = currentResume.sections;
    
    if (sections.contact.fullName) {
      resumeText += `${sections.contact.fullName}\n`;
      resumeText += `${sections.contact.email} | ${sections.contact.phone}\n\n`;
    }
    if (sections.summary?.content) {
      resumeText += `PROFESSIONAL SUMMARY\n${sections.summary.content}\n\n`;
    }
    if (sections.experience?.length) {
      resumeText += 'EXPERIENCE\n';
      sections.experience.forEach((exp: any) => {
        resumeText += `${exp.position} at ${exp.company}\n`;
        resumeText += `${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}\n`;
        resumeText += `${exp.description || ''}\n`;
        if (exp.achievements) {
          exp.achievements.forEach((a: string) => {
            if (a.trim()) resumeText += `• ${a}\n`;
          });
        }
        resumeText += '\n';
      });
    }
    if (sections.education?.length) {
      resumeText += 'EDUCATION\n';
      sections.education.forEach((edu: any) => {
        resumeText += `${edu.degree || ''} in ${edu.field || ''}\n`;
        resumeText += `${edu.institution || ''}\n`;
        resumeText += `${edu.startDate || ''} - ${edu.endDate || ''}\n\n`;
      });
    }
    if (sections.skills) {
      const allSkills = [
        ...(sections.skills.technical || []).map((s: any) => s.name),
        ...(sections.skills.soft || []).map((s: any) => s.name),
        ...(sections.skills.tools || []).map((s: any) => s.name),
      ].filter(Boolean);
      if (allSkills.length) {
        resumeText += `SKILLS\n${allSkills.join(', ')}\n\n`;
      }
    }
    if (sections.certifications?.length) {
      resumeText += 'CERTIFICATIONS\n';
      sections.certifications.forEach((cert: any) => {
        resumeText += `• ${cert.name} - ${cert.issuer}\n`;
      });
      resumeText += '\n';
    }

    await analyzeResume(resumeText);
  };

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
        text={parsing ? 'Analyzing your resume and populating the editor...' : 'Loading resume builder...'} 
        fullScreen 
      />
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Dashboard
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <h1 className="text-sm font-semibold text-gray-900">
            {currentResume?.metadata.title || 'Untitled Resume'}
          </h1>
          {isDirty && <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" title="Unsaved changes" />}
          {aiLoading && <span className="text-xs text-blue-600 animate-pulse">Analyzing...</span>}
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
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MdCloudUpload className="w-4 h-4" /> Upload
          </button>
          <button onClick={handleReAnalyze} disabled={aiLoading} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50">
            <MdAutoAwesome className="w-4 h-4" /> {aiLoading ? 'Analyzing...' : 'Re-analyze'}
          </button>
          <button onClick={saveResume} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${isDirty ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-gray-400 bg-gray-50 cursor-not-allowed'}`}>
            <MdSave className="w-4 h-4" /> Save
          </button>
          <button onClick={() => setShowExport(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <MdDownload className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ResumeEditor onExport={handleExport} />
      </div>

      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Your Resume" size="md">
        <FileUpload 
          onFileSelect={handleFileUpload} 
          label="Upload Resume" 
          description="Upload your existing resume (PDF, DOCX, or TXT). We'll extract the information and populate the editor automatically." 
        />
      </Modal>

      <Modal isOpen={showExport} onClose={() => setShowExport(false)} title="Download Resume" size="sm">
        <div className="space-y-3">
          {[
            { format: 'pdf', icon: <MdPictureAsPdf />, label: 'PDF Document', desc: 'Best for applications', color: 'text-red-600 bg-red-50' },
            { format: 'docx', icon: <MdDescription />, label: 'Word Document', desc: 'Editable format', color: 'text-blue-600 bg-blue-50' },
            { format: 'txt', icon: <MdTextSnippet />, label: 'Plain Text', desc: 'ATS-optimized', color: 'text-green-600 bg-green-50' },
          ].map((option) => (
            <button key={option.format} onClick={() => handleExport(option.format)} className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
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
