// ============================================
// RESUME PREVIEW COMPONENT - Live Preview
// ============================================

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MdZoomIn,
  MdZoomOut,
  MdRefresh,
  MdPrint,
  MdFullscreen,
  MdFullscreenExit,
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

  useEffect(() => {
    // Simulate loading when resume changes
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [currentResume]);

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
      const html = prepareResumeForExport(currentResume.sections, selectedTemplate);
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

  const style = getTemplateStyle(selectedTemplate);
  const sections = currentResume.sections;

  return (
    <div ref={containerRef} className={`flex flex-col bg-gray-100 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-30"
            aria-label="Zoom out"
          >
            <MdZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 w-12 text-center">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-30"
            aria-label="Zoom in"
          >
            <MdZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            aria-label="Reset zoom"
          >
            <MdRefresh className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrint}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            aria-label="Print"
          >
            <MdPrint className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? (
              <MdFullscreenExit className="w-4 h-4" />
            ) : (
              <MdFullscreen className="w-4 h-4" />
            )}
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
            ref={previewRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className="bg-white shadow-strong w-[210mm] min-h-[297mm] p-8"
          >
            {/* Header */}
            <div style={{ textAlign: style.fontFamily.includes('Georgia') ? 'center' : 'left', marginBottom: '20px' }}>
              <h1 style={{
                fontFamily: style.fontFamily,
                fontSize: '24px',
                color: style.primaryColor,
                margin: '0 0 5px 0',
              }}>
                {sections.contact.fullName || 'Your Name'}
              </h1>
              <p style={{
                fontFamily: style.fontFamily,
                fontSize: '11px',
                color: '#666',
                margin: 0,
              }}>
                {[
                  sections.contact.email,
                  sections.contact.phone,
                  sections.contact.location,
                ].filter(Boolean).join(' | ')}
              </p>
              {sections.contact.linkedIn && (
                <p style={{
                  fontFamily: style.fontFamily,
                  fontSize: '11px',
                  color: '#666',
                  margin: '2px 0 0 0',
                }}>
                  {sections.contact.linkedIn}
                  {sections.contact.github ? ` | ${sections.contact.github}` : ''}
                </p>
              )}
            </div>

            <hr style={{ border: `1px solid ${style.secondaryColor}`, marginBottom: '15px' }} />

            {/* Summary */}
            {sections.summary?.content && (
              <div style={{ marginBottom: '15px' }}>
                <h2 style={{
                  fontFamily: style.fontFamily,
                  fontSize: style.headingSize,
                  color: style.primaryColor,
                  borderBottom: `1px solid #e5e7eb`,
                  paddingBottom: '4px',
                  marginBottom: '8px',
                }}>
                  PROFESSIONAL SUMMARY
                </h2>
                <p style={{
                  fontFamily: style.fontFamily,
                  fontSize: style.bodySize,
                  color: '#374151',
                  lineHeight: '1.5',
                  margin: 0,
                }}>
                  {sections.summary.content}
                </p>
              </div>
            )}

            {/* Experience */}
            {sections.experience && sections.experience.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <h2 style={{
                  fontFamily: style.fontFamily,
                  fontSize: style.headingSize,
                  color: style.primaryColor,
                  borderBottom: `1px solid #e5e7eb`,
                  paddingBottom: '4px',
                  marginBottom: '8px',
                }}>
                  PROFESSIONAL EXPERIENCE
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

            {/* Education */}
            {sections.education && sections.education.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <h2 style={{
                  fontFamily: style.fontFamily,
                  fontSize: style.headingSize,
                  color: style.primaryColor,
                  borderBottom: `1px solid #e5e7eb`,
                  paddingBottom: '4px',
                  marginBottom: '8px',
                }}>
                  EDUCATION
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

            {/* Skills */}
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
                  }}>
                    SKILLS
                  </h2>
                  {sections.skills.technical?.length > 0 && (
                    <p style={{
                      fontFamily: style.fontFamily,
                      fontSize: style.bodySize,
                      color: '#4B5563',
                      margin: '4px 0',
                    }}>
                      <strong>Technical:</strong> {sections.skills.technical.map(s => s.name).join(' • ')}
                    </p>
                  )}
                  {sections.skills.soft?.length > 0 && (
                    <p style={{
                      fontFamily: style.fontFamily,
                      fontSize: style.bodySize,
                      color: '#4B5563',
                      margin: '4px 0',
                    }}>
                      <strong>Soft Skills:</strong> {sections.skills.soft.map(s => s.name).join(' • ')}
                    </p>
                  )}
                  {sections.skills.tools?.length > 0 && (
                    <p style={{
                      fontFamily: style.fontFamily,
                      fontSize: style.bodySize,
                      color: '#4B5563',
                      margin: '4px 0',
                    }}>
                      <strong>Tools:</strong> {sections.skills.tools.map(s => s.name).join(' • ')}
                    </p>
                  )}
                </div>
              )
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;