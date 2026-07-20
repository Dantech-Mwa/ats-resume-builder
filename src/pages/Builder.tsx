// ============================================
// BUILDER PAGE - Resume Builder
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
  MdShare,
  MdPrint,
} from 'react-icons/md';
import { useResume, useAI, useExport } from '../store';
import ResumeEditor from '../components/ResumeEditor';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import ResumeGenerator from '../lib/generator';
import toast from 'react-hot-toast';

const Builder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentResume, isDirty, saveResume } = useResume();
  const { setExportLoading } = useExport();
  const [showExport, setShowExport] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'txt'>('pdf');
  const [pageLoaded, setPageLoaded] = useState(false);

  const resumeId = searchParams.get('id');
  const isUpload = searchParams.get('upload');

  useEffect(() => {
    // Load resume if ID provided, or create new one
    if (resumeId) {
      // Load existing resume logic here
    } else if (!currentResume) {
      // Create new resume if none exists
    }
    
    const timer = setTimeout(() => setPageLoaded(true), 500);
    return () => clearTimeout(timer);
  }, [resumeId]);

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

  if (!pageLoaded) {
    return <Loading type="page" text="Loading resume builder..." fullScreen />;
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
        </div>

        <div className="flex items-center gap-2">
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