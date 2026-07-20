// ============================================
// FILE UPLOAD COMPONENT - Drag & Drop
// ============================================

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCloudUpload, MdDescription, MdClose, MdCheckCircle, MdError } from 'react-icons/md';
import { formatFileSize, isAllowedFileType } from '../lib/utils';
import Loading from './Loading';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onError?: (error: string) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  description?: string;
  multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onError,
  accept = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc'],
    'text/plain': ['.txt'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  loading = false,
  label = 'Upload Resume',
  description = 'Drag & drop your resume or click to browse',
  multiple = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        const errorMessage = rejection.errors[0]?.message || 'File rejected';
        setError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      // Handle accepted files
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        
        // Validate file type
        if (!isAllowedFileType(file.name)) {
          const errorMsg = 'Unsupported file format. Please upload PDF, DOCX, or TXT files.';
          setError(errorMsg);
          onError?.(errorMsg);
          return;
        }

        setSelectedFile(file);
        setError(null);
        onFileSelect(file);
      }
    },
    [onFileSelect, onError]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    disabled: disabled || loading,
    maxFiles: multiple ? 5 : 1,
  });

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="w-full">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
            : isDragReject
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${loading ? 'pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loading type="spinner" size="md" text="Processing file..." />
          </div>
        ) : selectedFile ? (
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MdDescription className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MdCheckCircle className="w-5 h-5 text-green-500" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                aria-label="Remove file"
              >
                <MdClose className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <motion.div
              animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
              className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center"
            >
              <MdCloudUpload className="w-8 h-8 text-blue-600" />
            </motion.div>
            <div>
              <p className="text-base font-medium text-gray-900">{label}</p>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
            <p className="text-xs text-gray-400">
              Supported formats: PDF, DOCX, TXT (Max {formatFileSize(maxSize)})
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <MdError className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;