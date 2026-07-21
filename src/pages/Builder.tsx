// ============================================
// BUILDER PAGE - Complete with Debug Logs & Fixed
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
    updateSection,
    addItem,
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

  useEffect(() => {
    if (!currentResume && pageLoaded) {
      createNewResume('My Resume');
    }
  }, [currentResume, pageLoaded, createNewResume]);

  // ============================================
  // FILE UPLOAD HANDLER
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

      console.log('📦 ===== PARSER RESULT =====');
      console.log('  Contact:', result.parsed.contact?.fullName, '|', result.parsed.contact?.email);
      console.log('  Summary length:', result.parsed.summary?.content?.length || 0);
      console.log('  Experience entries:', result.parsed.experience?.length || 0);
      if (result.parsed.experience?.length) {
        result.parsed.experience.forEach((exp: any, i: number) => {
          console.log(`    [${i}] ${exp.position} | ${exp.company} | ${exp.startDate}-${exp.endDate} | Achievements: ${exp.achievements?.length || 0}`);
        });
      }
      console.log('  Education entries:', result.parsed.education?.length || 0);
      console.log('  Skills (tech):', result.parsed.skills?.technical?.length || 0);
      console.log('  Skills (soft):', result.parsed.skills?.soft?.length || 0);
      console.log('  Projects:', result.parsed.projects?.length || 0);
      console.log('  Certifications:', result.parsed.certifications?.length || 0);
      console.log('  Raw text length:', result.rawText?.length || 0);
      console.log('  Raw text preview:', result.rawText?.substring(0, 300));
      console.log('📦 ===== END PARSER RESULT =====');

      toast.success('Resume parsed! Populating editor...');

      // Build complete resume with parsed data
      const parsedResume = {
        ...currentResume!,
        sections: {
          ...currentResume!.sections,
          contact: {
            ...currentResume!.sections.contact,
            ...(result.parsed.contact || {}),
          },
          summary: result.parsed.summary || currentResume!.sections.summary,
          experience: result.parsed.experience?.length 
            ? result.parsed.experience 
            : currentResume!.sections.experience,
          education: result.parsed.education?.length 
            ? result.parsed.education 
            : currentResume!.sections.education,
          skills: result.parsed.skills 
            ? { ...currentResume!.sections.skills, ...result.parsed.skills }
            : currentResume!.sections.skills,
          certifications: result.parsed.certifications?.length
            ? result.parsed.certifications
            : currentResume!.sections.certifications,
          projects: result.parsed.projects?.length
            ? result.parsed.projects
            : currentResume!.sections.projects,
          languages: result.parsed.languages?.length
            ? result.parsed.languages
            : currentResume!.sections.languages,
        },
        metadata: {
          ...currentResume!.metadata,
          updatedAt: new Date().toISOString(),
        },
      };

      // Update the entire resume at once
      setCurrentResume(parsedResume);

      toast.success('Editor populated! Running AI analysis...');

      // Score using RAW text (most accurate)
      await analyzeResume(result.rawText);
    } catch (error: any) {
      toast.error('Failed to parse resume: ' + error.message);
    } finally {
      setParsing(false);
    }
  };

  // ============================================
  // AI ANALYSIS
  // ============================================

  const analyzeResume = async (resumeText: string) => {
    console.log('🔬 ===== TEXT SENT TO SCORER =====');
    console.log('  Length:', resumeText?.length || 0);
    console.log('  Has EXPERIENCE:', /experience/i.test(resumeText));
    console.log('  Has EDUCATION:', /education/i.test(resumeText));
    console.log('  Has SKILLS:', /skills/i.test(resumeText));
    console.log('  Has bullets (•):', /•/.test(resumeText));
    console.log('  Has dates (20XX):', /\b20\d{2}\b/.test(resumeText));
    console.log('  Has metrics (%):', /\d+%/.test(resumeText));
    console.log('  Has email (@):', /@/.test(resumeText));
    console.log('  First 500 chars:', resumeText?.substring(0, 500));
    console.log('🔬 ===== END TEXT SAMPLE =====');

    setAILoading(true);
    try {
      const aiService = AIService.getInstance();
      
      const score = await aiService.analyzeATS(resumeText);
      console.log('✅ SCORE RESULT:', score.overall, '/100');
      console.log('   Breakdown:', JSON.stringify(score.breakdown));
      
      setATSScore(score);

      const recommendations = await aiService.getRecommendations(resumeText, score);
      console.log('✅ RECOMMENDATIONS:', recommendations?.length || 0);
      
      setAIRecommendations(recommendations || []);

      toast.success(`ATS Score: ${score.overall}/100 - ${recommendations?.length || 0} recommendations`);
    } catch (error: any) {
      console.error('❌ AI Analysis error:', error);
    } finally {
      setAILoading(false);
    }
  };

  // ============================================
  // RE-ANALYZE (from editor content)
  // ============================================

  const handleReAnalyze = async () => {
    if (!currentResume) return;
    
    const sections = currentResume.sections;
    let resumeText = '';

    // CONTACT
    if (sections.contact.fullName) {
      resumeText += `${sections.contact.fullName}\n`;
      resumeText += `${sections.contact.email || ''} | ${sections.contact.phone || ''}\n`;
      if (sections.contact.location) resumeText += `${sections.contact.location}\n`;
      if (sections.contact.linkedIn) resumeText += `${sections.contact.linkedIn}\n`;
      resumeText += '\n';
    }

    // SUMMARY
    if (sections.summary?.content) {
      resumeText += `PROFESSIONAL SUMMARY\n${sections.summary.content}\n\n`;
    }

    // EXPERIENCE
    if (sections.experience?.length) {
      resumeText += 'PROFESSIONAL EXPERIENCE\n\n';
      sections.experience.forEach((exp: any) => {
        resumeText += `${exp.position || ''} | ${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}\n`;
        resumeText += `${exp.company || ''}\n`;
        if (exp.location) resumeText += `${exp.location}\n`;
        if (exp.description) resumeText += `${exp.description}\n`;
        if (exp.achievements?.length) {
          exp.achievements.forEach((a: string) => {
            if (a.trim()) resumeText += `• ${a.trim()}\n`;
          });
        }
        resumeText += '\n';
      });
    }

    // EDUCATION
    if (sections.education?.length) {
      resumeText += 'EDUCATION\n\n';
      sections.education.forEach((edu: any) => {
        resumeText += `${edu.degree || ''}`;
        if (edu.field) resumeText += ` in ${edu.field}`;
        resumeText += ` | ${edu.institution || ''}\n`;
        if (edu.startDate) resumeText += `${edu.startDate} - ${edu.endDate || 'Present'}\n`;
        if (edu.gpa) resumeText += `GPA: ${edu.gpa}\n`;
        resumeText += '\n';
      });
    }

    // SKILLS
    if (sections.skills) {
      const techSkills = (sections.skills.technical || []).map((s: any) => s.name).filter(Boolean);
      const softSkills = (sections.skills.soft || []).map((s: any) => s.name).filter(Boolean);
      const toolSkills = (sections.skills.tools || []).map((s: any) => s.name).filter(Boolean);
      
      if (techSkills.length || softSkills.length || toolSkills.length) {
        resumeText += 'SKILLS\n';
        if (techSkills.length) resumeText += `Technical: ${techSkills.join(', ')}\n`;
        if (softSkills.length) resumeText += `Soft Skills: ${softSkills.join(', ')}\n`;
        if (toolSkills.length) resumeText += `Tools: ${toolSkills.join(', ')}\n`;
        resumeText += '\n';
      }
    }

    // PROJECTS
    if (sections.projects?.length) {
      resumeText += 'PROJECTS\n\n';
      sections.projects.forEach((proj: any) => {
        resumeText += `${proj.name || ''}\n`;
        if (proj.description) resumeText += `${proj.description}\n`;
        if (proj.technologies?.length) resumeText += `Technologies: ${proj.technologies.join(', ')}\n`;
        resumeText += '\n';
      });
    }

    // CERTIFICATIONS
    if (sections.certifications?.length) {
      resumeText += 'CERTIFICATIONS\n';
      sections.certifications.forEach((cert: any) => {
        resumeText += `• ${cert.name || ''}`;
        if (cert.issuer) resumeText += ` - ${cert.issuer}`;
        resumeText += '\n';
      });
      resumeText += '\n';
    }

    console.log('🔄 RE-ANALYZE from editor - text length:', resumeText.length);
    await analyzeResume(resumeText);
  };

  // ============================================
  // EXPORT
  // ============================================

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

  // ============================================
  // RENDER
  // ============================================

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
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-600 hover:text-gray-900">
            ← Back
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

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <ResumeEditor onExport={handleExport} />
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Your Resume" size="md">
        <FileUpload 
          onFileSelect={handleFileUpload} 
          label="Upload Resume" 
          description="Upload PDF, DOCX, or TXT. We'll extract all information and populate the editor." 
        />
      </Modal>

      {/* Export Modal */}
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
