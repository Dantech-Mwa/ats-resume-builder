// ============================================
// RESUME PREVIEW COMPONENT - Template-Aware Live Preview
// ============================================

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MdZoomIn, MdZoomOut, MdRefresh, MdPrint,
  MdFullscreen, MdFullscreenExit,
} from 'react-icons/md';
import { useResume, useTemplates } from '../store';
import { getTemplateStyle, prepareResumeForExport } from '../lib/utils';
import Loading from './Loading';

interface ResumePreviewProps {
  className?: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ className = '' }) => {
  const { currentResume } = useResume();
  const { selectedTemplate } = useTemplates();
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ Use the ACTUAL template from the resume metadata, fallback to selected
  const activeTemplate = currentResume?.metadata.templateId || selectedTemplate || 'modern';

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [currentResume, activeTemplate]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoom(100);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && currentResume) {
      const html = prepareResumeForExport(currentResume.sections, activeTemplate);
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${currentResume.metadata.title || 'Resume'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>${html}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!currentResume) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-50 ${className}`}>
        <div className="text-center">
          <p className="text-gray-500">No resume to preview</p>
        </div>
      </div>
    );
  }

  // ✅ Use the ACTIVE template (from resume metadata, not hardcoded)
  const style = getTemplateStyle(activeTemplate);
  const sections = currentResume.sections;

  // ✅ Template-specific layout adjustments
  const isCentered = activeTemplate === 'executive' || activeTemplate === 'minimal';
  const isSplit = activeTemplate === 'creative';
  const headerBg = isSplit ? style.primaryColor : 'transparent';
  const headerTextColor = isSplit ? '#FFFFFF' : style.primaryColor;
  const contactColor = isSplit ? '#E0E7FF' : '#666666';

  return (
    <div ref={containerRef} className={`flex flex-col bg-gray-100 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-1">
          <button onClick={handleZoomOut} disabled={zoom <= 50} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-30" aria-label="Zoom out">
            <MdZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 w-12 text-center">{zoom}%</span>
          <button onClick={handleZoomIn} disabled={zoom >= 200} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-30" aria-label="Zoom in">
            <MdZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleResetZoom} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors" aria-label="Reset zoom">
            <MdRefresh className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
            {activeTemplate.charAt(0).toUpperCase() + activeTemplate.slice(1)}
          </span>
          <button onClick={handlePrint} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors" aria-label="Print">
            <MdPrint className="w-4 h-4" />
          </button>
          <button onClick={toggleFullscreen} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors" aria-label="Toggle fullscreen">
            {isFullscreen ? <MdFullscreenExit className="w-4 h-4" /> : <MdFullscreen className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-4 flex justify-center">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loading type="spinner" size="md" text="Updating preview..." />
          </div>
        ) : (
          <motion.div
            key={activeTemplate}
            ref={previewRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className="bg-white shadow-strong w-[210mm] min-h-[297mm] p-8"
          >
            {/* ============================================ */}
            {/* HEADER - Template-Aware */}
            {/* ============================================ */}
            <div style={{
              backgroundColor: headerBg,
              padding: isSplit ? '16px' : '0',
              marginBottom: isSplit ? '16px' : '20px',
              borderRadius: isSplit ? '8px' : '0',
              textAlign: isCentered ? 'center' : 'left',
            }}>
              <h1 style={{
                fontFamily: style.fontFamily,
                fontSize: activeTemplate === 'creative' ? '26px' : activeTemplate === 'executive' ? '22px' : '24px',
                color: headerTextColor,
                margin: '0 0 5px 0',
                fontWeight: 'bold',
              }}>
                {sections.contact.fullName || 'Your Name'}
              </h1>
              <p style={{
                fontFamily: style.fontFamily,
                fontSize: '11px',
                color: contactColor,
                margin: 0,
                lineHeight: 1.5,
              }}>
                {[
                  sections.contact.email,
                  sections.contact.phone,
                  sections.contact.location,
                ].filter(Boolean).join(' | ')}
              </p>
              {(sections.contact.linkedIn || sections.contact.github) && (
                <p style={{
                  fontFamily: style.fontFamily,
                  fontSize: '11px',
                  color: contactColor,
                  margin: '2px 0 0 0',
                }}>
                  {[sections.contact.linkedIn, sections.contact.github].filter(Boolean).join(' | ')}
                </p>
              )}
            </div>

            <hr style={{ border: `1px solid ${style.secondaryColor}`, marginBottom: '15px' }} />

            {/* ============================================ */}
            {/* SUMMARY */}
            {/* ============================================ */}
            {sections.summary?.content && (
              <div style={{ marginBottom: '15px' }}>
                <h2 style={{
                  fontFamily: style.fontFamily,
                  fontSize: style.headingSize,
                  color: style.primaryColor,
                  borderBottom: `1px solid #e5e7eb`,
                  paddingBottom: '4px',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Professional Summary
                </h2>
                <p style={{
                  fontFamily: style.fontFamily,
                  fontSize: style.bodySize,
                  color: '#374151',
                  lineHeight: '1.6',
                  margin: 0,
                }}>
                  {sections.summary.content}
                </p>
              </div>
            )}

            {/* ============================================ */}
            {/* EXPERIENCE */}
            {/* ============================================ */}
            {sections.experience && sections.experience.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <h2 style={{
                  fontFamily: style.fontFamily,
                  fontSize: style.headingSize,
                  color: style.primaryColor,
                  borderBottom: `1px solid #e5e7eb`,
                  paddingBottom: '4px',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Professional Experience
                </h2>
                {sections.experience.map((exp) => (
                  <div key={exp.id} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{
                        fontFamily: style.fontFamily,
                        fontSize: style.bodySize,
                        color: '#111827',
                      }}>
                        {exp.position || 'Position'}
                      </strong>
                      <span style={{
                        fontFamily: style.fontFamily,
                        fontSize: style.small,
                        color: '#6B7280',
                        fontStyle: 'italic',
                      }}>
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div style={{
                      fontFamily: style.fontFamily,
                      fontSize: style.bodySize,
                      color: '#374151',
                      fontStyle: 'italic',
                      marginBottom: '4px',
                    }}>
                      {exp.company || 'Company'}
                      {exp.location ? ` | ${exp.location}` : ''}
                    </div>
                    {exp.description && (
                      <p style={{
                        fontFamily: style.fontFamily,
                        fontSize: style.bodySize,
                        color: '#4B5563',
                        margin: '4px 0',
                        lineHeight: '1.4',
                      }}>
                        {exp.description}
                      </p>
                    )}
                    {exp.achievements && exp.achievements.filter(a => a.trim()).length > 0 && (
                      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                        {exp.achievements.filter(a => a.trim()).map((achievement, i) => (
                          <li key={i} style={{
                            fontFamily: style.fontFamily,
                            fontSize: style.bodySize,
                            color: '#4B5563',
                            marginBottom: '2px',
                          }}>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ============================================ */}
            {/* EDUCATION */}
            {/* ============================================ */}
            {sections.education && sections.education.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <h2 style={{
                  fontFamily: style.fontFamily,
                  fontSize: style.headingSize,
                  color: style.primaryColor,
                  borderBottom: `1px solid #e5e7eb`,
                  paddingBottom: '4px',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Education
                </h2>
                {sections.education.map((edu) => (
                  <div key={edu.id} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{
                        fontFamily: style.fontFamily,
                        fontSize: style.bodySize,
                        color: '#111827',
                      }}>
                        {edu.degree || 'Degree'}
                        {edu.field ? ` in ${edu.field}` : ''}
                      </strong>
                      <span style={{
                        fontFamily: style.fontFamily,
                        fontSize: style.small,
                        color: '#6B7280',
                        fontStyle: 'italic',
                      }}>
                        {edu.startDate} - {edu.endDate}
                      </span>
                    </div>
                    <div style={{
                      fontFamily: style.fontFamily,
                      fontSize: style.bodySize,
                      color: '#374151',
                    }}>
                      {edu.institution || 'Institution'}
                      {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ============================================ */}
            {/* SKILLS */}
            {/* ============================================ */}
            {sections.skills && (
              (sections.skills.technical?.length || sections.skills.soft?.length || sections.skills.tools?.length) > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h2 style={{
                    fontFamily: style.fontFamily,
                    fontSize: style.headingSize,
                    color: style.primaryColor,
                    borderBottom: `1px solid #e5e7eb`,
                    paddingBottom: '4px',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Skills
                  </h2>
                  {sections.skills.technical?.length > 0 && (
                    <p style={{ fontFamily: style.fontFamily, fontSize: style.bodySize, color: '#4B5563', margin: '4px 0' }}>
                      <strong>Technical:</strong> {sections.skills.technical.map(s => s.name).join(' • ')}
                    </p>
                  )}
                  {sections.skills.soft?.length > 0 && (
                    <p style={{ fontFamily: style.fontFamily, fontSize: style.bodySize, color: '#4B5563', margin: '4px 0' }}>
                      <strong>Soft Skills:</strong> {sections.skills.soft.map(s => s.name).join(' • ')}
                    </p>
                  )}
                  {sections.skills.tools?.length > 0 && (
                    <p style={{ fontFamily: style.fontFamily, fontSize: style.bodySize, color: '#4B5563', margin: '4px 0' }}>
                      <strong>Tools:</strong> {sections.skills.tools.map(s => s.name).join(' • ')}
                    </p>
                  )}
                </div>
              )
            )}

            {/* ============================================ */}
            {/* REFEREES */}
            {/* ============================================ */}
            {sections.referees && sections.referees.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <h2 style={{
                  fontFamily: style.fontFamily,
                  fontSize: style.headingSize,
                  color: style.primaryColor,
                  borderBottom: `1px solid #e5e7eb`,
                  paddingBottom: '4px',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Referees
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {sections.referees.map((ref: any) => (
                    <div key={ref.id} style={{
                      padding: '10px',
                      border: `1px solid ${style.secondaryColor}20`,
                      borderRadius: '8px',
                      fontSize: style.bodySize,
                    }}>
                      <p style={{ fontWeight: 'bold', color: '#111827', marginBottom: '2px' }}>
                        {ref.fullName}
                        {ref.isVerified && ' ✓'}
                      </p>
                      <p style={{ color: '#374151', fontSize: style.small }}>
                        {[ref.title, ref.organization].filter(Boolean).join(', ')}
                      </p>
                      {ref.relationship && (
                        <p style={{ color: '#6B7280', fontSize: style.small, fontStyle: 'italic' }}>
                          {ref.relationship}
                        </p>
                      )}
                      <p style={{ color: '#4B5563', fontSize: style.small, marginTop: '4px' }}>
                        {ref.email}
                      </p>
                      {ref.phone && (
                        <p style={{ color: '#4B5563', fontSize: style.small }}>
                          {ref.phone}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
