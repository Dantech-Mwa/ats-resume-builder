// ============================================
// BUILDER PAGE - Perfect Auto-Populate
// ============================================

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  MdSave, MdDownload, MdPictureAsPdf, MdDescription,
  MdTextSnippet, MdAutoAwesome, MdCloudUpload,
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
  const { currentResume, createNewResume, saveResume, isDirty, setCurrentResume } = useResume();
  const { atsScore, setATSScore, setAIRecommendations, setAILoading, aiLoading } = useAI();
  const { setExportLoading } = useExport();

  const [showExport, setShowExport] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const isUpload = searchParams.get('upload') === 'true';

  useEffect(() => { const t = setTimeout(() => setPageLoaded(true), 500); return () => clearTimeout(t); }, []);
  useEffect(() => { if (isUpload) setShowUpload(true); }, [isUpload]);
  useEffect(() => { if (!currentResume && pageLoaded) createNewResume('My Resume'); }, [currentResume, pageLoaded, createNewResume]);

  // ============================================
  // FILE UPLOAD - PERFECT AUTO-POPULATE
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

      console.log('📦 PARSED SECTIONS:');
      console.log('  Contact:', parsed.contact?.fullName, parsed.contact?.email);
      console.log('  Summary:', parsed.summary?.content?.substring(0, 100));
      console.log('  Experience:', parsed.experience?.length, 'entries');
      parsed.experience?.forEach((e: any, i: number) => console.log(`    [${i}] ${e.position} @ ${e.company} | ${e.startDate}-${e.endDate} | achievements: ${e.achievements?.length}`));
      console.log('  Education:', parsed.education?.length, 'entries');
      console.log('  Skills - tech:', parsed.skills?.technical?.length, 'soft:', parsed.skills?.soft?.length, 'tools:', parsed.skills?.tools?.length);
      console.log('  Projects:', parsed.projects?.length);
      console.log('  Certifications:', parsed.certifications?.length);
      console.log('  Languages:', parsed.languages?.length);

      // BUILD COMPLETE RESUME OBJECT
      const fullResume = {
        ...currentResume!,
        sections: {
          // CONTACT
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
          // SUMMARY
          summary: {
            content: parsed.summary?.content || '',
            aiOptimized: false,
            lastModified: new Date().toISOString(),
          },
          // EXPERIENCE - Direct from parser
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
          // EDUCATION - Direct from parser
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
          // SKILLS - Direct from parser
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
          // CERTIFICATIONS
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
          // PROJECTS
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
          // LANGUAGES
          languages: (parsed.languages || []).map((lang: any) => ({
            name: lang.name || '',
            proficiency: lang.proficiency || 'Intermediate',
          })),
          // Keep empty arrays for sections not parsed
          volunteer: currentResume?.sections.volunteer || [],
          publications: currentResume?.sections.publications || [],
          awards: currentResume?.sections.awards || [],
          customSections: currentResume?.sections.customSections || [],
        },
        metadata: {
          ...currentResume!.metadata,
          updatedAt: new Date().toISOString(),
          completeness: 80,
        },
      };

      // SET THE ENTIRE RESUME AT ONCE
      setCurrentResume(fullResume);
      
      const expCount = parsed.experience?.length || 0;
      const eduCount = parsed.education?.length || 0;
      const skillCount = (parsed.skills?.technical?.length || 0) + (parsed.skills?.soft?.length || 0);
      
      toast.success(`Populated: ${expCount} jobs, ${eduCount} degrees, ${skillCount} skills`);

      // Score the raw text
      await analyzeResume(result.rawText);
    } catch (error: any) {
      toast.error('Failed: ' + error.message);
    } finally {
      setParsing(false);
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
      toast.success(`ATS Score: ${score.overall}/100 - ${recs?.length || 0} tips`);
    } catch (error: any) {
      console.error('Analysis error:', error);
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
  // EXPORT
  // ============================================

  const handleExport = async (format: string) => {
    if (!currentResume) { toast.error('No resume'); return; }
    setExportLoading(true);
    try {
      const gen = ResumeGenerator.getInstance();
      await gen.downloadResume(currentResume, {
        format: format as any, templateId: currentResume.metadata.templateId,
        includeAISuggestions: false, includeATSScore: true,
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
    return <Loading type="page" text={parsing ? 'Analyzing resume...' : 'Loading...'} fullScreen />;
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-600 hover:text-gray-900">← Back</button>
          <div className="w-px h-5 bg-gray-200" />
          <h1 className="text-sm font-semibold text-gray-900">{currentResume?.metadata.title || 'Untitled'}</h1>
          {isDirty && <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />}
          {aiLoading && <span className="text-xs text-blue-600 animate-pulse">Analyzing...</span>}
          {atsScore && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${atsScore.overall >= 80 ? 'bg-green-100 text-green-700' : atsScore.overall >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
              ATS: {atsScore.overall}/100
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"><MdCloudUpload className="w-4 h-4"/> Upload</button>
          <button onClick={handleReAnalyze} disabled={aiLoading} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50"><MdAutoAwesome className="w-4 h-4"/> {aiLoading?'Analyzing...':'Re-analyze'}</button>
          <button onClick={saveResume} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg ${isDirty?'text-blue-600 bg-blue-50 hover:bg-blue-100':'text-gray-400 bg-gray-50 cursor-not-allowed'}`}><MdSave className="w-4 h-4"/> Save</button>
          <button onClick={() => setShowExport(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"><MdDownload className="w-4 h-4"/> Download</button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden"><ResumeEditor onExport={handleExport} /></div>

      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Resume" size="md">
        <FileUpload onFileSelect={handleFileUpload} label="Upload Resume" description="Upload PDF, DOCX, or TXT. We'll populate all sections automatically." />
      </Modal>

      <Modal isOpen={showExport} onClose={() => setShowExport(false)} title="Download" size="sm">
        <div className="space-y-3">
          {[{format:'pdf',icon:<MdPictureAsPdf/>,label:'PDF',desc:'Best for applications',color:'text-red-600 bg-red-50'},{format:'docx',icon:<MdDescription/>,label:'Word',desc:'Editable',color:'text-blue-600 bg-blue-50'},{format:'txt',icon:<MdTextSnippet/>,label:'Text',desc:'ATS-optimized',color:'text-green-600 bg-green-50'}].map(o=>(
            <button key={o.format} onClick={()=>handleExport(o.format)} className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50">
              <div className={`w-10 h-10 ${o.color} rounded-lg flex items-center justify-center`}>{React.cloneElement(o.icon,{className:'w-5 h-5'})}</div>
              <div className="text-left"><p className="text-sm font-semibold text-gray-900">{o.label}</p><p className="text-xs text-gray-500">{o.desc}</p></div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Builder;
