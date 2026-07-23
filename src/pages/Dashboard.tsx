// ============================================
// DASHBOARD PAGE - Firebase Realtime Database Connected
// ============================================

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdAdd,
  MdDescription,
  MdEdit,
  MdDelete,
  MdCopyAll,
  MdCloudUpload,
  MdStar,
  MdTrendingUp,
  MdCalendarToday,
  MdCheckCircle,
  MdWarning,
} from 'react-icons/md';
import { useAuth, useResume } from '../store';
import { databaseService } from '../lib/firebase';
import { ResumeMetadata, ResumeData } from '../lib/types';
import { formatDate } from '../lib/utils';
import Loading from '../components/Loading';
import Modal, { ConfirmModal } from '../components/Modal';
import FileUpload from '../components/FileUpload';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createNewResume } = useResume();
  
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [resumes, setResumes] = useState<ResumeMetadata[]>([]);
  const [avgScore, setAvgScore] = useState<number | string>('--');
  const [improvement, setImprovement] = useState<number | string>('--');
  const [fullResumes, setFullResumes] = useState<ResumeData[]>([]);

  // Load resumes from Firebase Realtime Database
  useEffect(() => {
    if (user) {
      loadResumes();
    }
  }, [user]);

  const loadResumes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      console.log('🔍 Loading resumes for user:', user.id);
      
      // Fetch from Firebase Realtime Database
      const userResumes = await databaseService.getUserResumes(user.id);
      console.log('📦 Found resumes:', userResumes.length);
      
      setFullResumes(userResumes);
      
      // Extract metadata for display
      const metadata = userResumes.map(r => r.metadata);
      setResumes(metadata);

      // Calculate Average ATS Score
      const scores = userResumes
        .filter(r => r.atsScore?.overall && r.atsScore.overall > 0)
        .map(r => r.atsScore!.overall);
      
      if (scores.length > 0) {
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        setAvgScore(`${avg}/100`);
      } else {
        setAvgScore('--');
      }

      // Calculate Improvement (latest vs earliest)
      if (scores.length >= 2) {
        const sortedScores = [...scores].sort((a, b) => {
          const dateA = userResumes.find(r => r.atsScore?.overall === a)?.metadata.updatedAt || '';
          const dateB = userResumes.find(r => r.atsScore?.overall === b)?.metadata.updatedAt || '';
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        });
        const first = sortedScores[0];
        const last = sortedScores[sortedScores.length - 1];
        const diff = last - first;
        setImprovement(diff > 0 ? `+${diff}` : `${diff}`);
      } else {
        setImprovement('--');
      }
    } catch (error: any) {
      console.error('❌ Failed to load resumes:', error);
      toast.error('Failed to load your resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    const title = `Resume ${resumes.length + 1}`;
    createNewResume(title);
    navigate('/builder');
  };

  const handleEdit = (resumeId: string) => {
    navigate(`/builder?id=${resumeId}`);
  };

  const handleDelete = async (resumeId: string) => {
    try {
      await databaseService.deleteResume(user!.id, resumeId);
      setResumes(resumes.filter((r) => r.id !== resumeId));
      setFullResumes(fullResumes.filter(r => r.metadata.id !== resumeId));
      toast.success('Resume deleted');
      // Refresh stats
      loadResumes();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete resume');
    }
    setDeleteConfirm(null);
  };

  const handleDuplicate = async (resume: ResumeMetadata) => {
    try {
      await databaseService.duplicateResume(user!.id, resume.id);
      toast.success('Resume duplicated');
      await loadResumes();
    } catch (error) {
      console.error('Duplicate error:', error);
      toast.error('Failed to duplicate resume');
    }
  };

  const getATSColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const daysActive = user?.createdAt 
    ? Math.ceil((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;

  if (loading) {
    return <Loading type="page" text="Loading your dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-gray-500 mt-1">Manage your resumes and create new ones</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <MdCloudUpload className="w-4 h-4" />
            Upload Resume
          </button>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <MdAdd className="w-4 h-4" />
            Create New
          </button>
        </div>
      </div>

      {/* Subscription Status */}
      {user?.subscription && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 p-4 rounded-xl border ${
            user.subscription.status === 'active'
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.subscription.status === 'active' ? (
                <MdCheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <MdWarning className="w-5 h-5 text-yellow-600" />
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {user.subscription.plan} Plan
                </p>
                <p className="text-xs text-gray-600">
                  {user.subscription.status === 'active'
                    ? `Active until ${formatDate(user.subscription.endDate, 'long')}`
                    : 'Your subscription needs attention'}
                </p>
              </div>
            </div>
            {user.subscription.plan === 'trial' && (
              <Link to="/pricing" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Upgrade Now
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <MdDescription />, label: 'Total Resumes', value: resumes.length, color: 'bg-blue-100 text-blue-600' },
          { icon: <MdStar />, label: 'Avg ATS Score', value: avgScore, color: 'bg-yellow-100 text-yellow-600' },
          { icon: <MdTrendingUp />, label: 'Improvement', value: improvement, color: 'bg-green-100 text-green-600' },
          { icon: <MdCalendarToday />, label: 'Days Active', value: daysActive, color: 'bg-purple-100 text-purple-600' },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                {React.cloneElement(stat.icon, { className: 'w-5 h-5' })}
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumes Grid */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Resumes</h2>
        
        {resumes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <MdDescription className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No resumes yet</h3>
            <p className="text-gray-500 mb-6">Create your first resume or upload an existing one</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowUpload(true)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Upload Resume
              </button>
              <button onClick={handleCreateNew} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Create New Resume
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Create New Card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={handleCreateNew}
              className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors min-h-[200px]"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <MdAdd className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Create New Resume</p>
            </motion.button>

            {/* Resume Cards */}
            {resumes.map((resume) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-medium transition-all group relative"
              >
                {/* Mini Preview */}
                <div className="aspect-[3/4] bg-gray-50 rounded-t-xl overflow-hidden border-b border-gray-100">
                  <div className="p-4">
                    <div className="w-full h-2 bg-gray-200 rounded mb-2" />
                    <div className="w-3/4 h-2 bg-gray-200 rounded mb-1" />
                    <div className="w-1/2 h-2 bg-gray-200 rounded mb-4" />
                    <div className="space-y-1">
                      {[1, 2, 3].map((i) => (<div key={i} className="w-full h-1.5 bg-gray-100 rounded" />))}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">{resume.title}</h3>
                  <p className="text-xs text-gray-500">Updated {formatDate(resume.updatedAt)}</p>
                  
                  {/* ATS Score Badge */}
                  {fullResumes.find(r => r.metadata.id === resume.id)?.atsScore?.overall ? (
                    <div className="flex items-center gap-1 mt-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        (fullResumes.find(r => r.metadata.id === resume.id)?.atsScore?.overall || 0) >= 80 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        ATS: {fullResumes.find(r => r.metadata.id === resume.id)?.atsScore?.overall}/100
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">Not analyzed yet</p>
                  )}
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => handleEdit(resume.id)} className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors" title="Edit">
                    <MdEdit className="w-4 h-4 text-gray-700" />
                  </button>
                  <button onClick={() => handleDuplicate(resume)} className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors" title="Duplicate">
                    <MdCopyAll className="w-4 h-4 text-gray-700" />
                  </button>
                  <button onClick={() => setDeleteConfirm(resume.id)} className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                    <MdDelete className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Existing Resume" size="md">
        <FileUpload
          onFileSelect={() => {
            setShowUpload(false);
            navigate('/builder?upload=true');
          }}
          label="Upload Resume"
          description="Supported formats: PDF, DOCX, TXT"
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Resume"
        message="Are you sure you want to delete this resume? This action cannot be undone."
        variant="danger"
        confirmText="Delete"
      />
    </div>
  );
};

export default Dashboard;
