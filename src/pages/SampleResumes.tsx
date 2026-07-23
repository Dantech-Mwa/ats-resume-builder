import React from 'react';
import { motion } from 'framer-motion';
import { MdDownload, MdStar } from 'react-icons/md';

const SampleResumes: React.FC = () => {
  const samples = [
    { title: 'Software Engineer Resume', industry: 'Technology', score: 92, features: ['ATS-optimized', 'Skills-focused', 'Project-heavy'] },
    { title: 'Data Scientist Resume', industry: 'Technology', score: 90, features: ['Technical skills', 'Research experience', 'Publications'] },
    { title: 'Marketing Manager Resume', industry: 'Marketing', score: 88, features: ['Campaign metrics', 'ROI focus', 'Brand strategy'] },
    { title: 'Financial Analyst Resume', industry: 'Finance', score: 91, features: ['Quantitative focus', 'Certifications', 'Deal experience'] },
    { title: 'Registered Nurse Resume', industry: 'Healthcare', score: 89, features: ['Clinical experience', 'Licenses', 'Patient care'] },
    { title: 'Project Manager Resume', industry: 'General', score: 87, features: ['PM methodologies', 'Team leadership', 'Budget management'] },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sample Resumes</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Get inspired by these ATS-optimized resume examples across different industries</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {samples.map((sample, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-soft transition-shadow">
              <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Resume Preview</p>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{sample.industry}</span>
                  <span className="flex items-center gap-1 text-sm font-bold text-green-600"><MdStar className="w-4 h-4" /> {sample.score}/100</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{sample.title}</h3>
                <div className="flex flex-wrap gap-1 mb-3">
                  {sample.features.map((f, j) => (
                    <span key={j} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                </div>
                <button className="w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1">
                  <MdDownload className="w-4 h-4" /> Use This Template
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SampleResumes;
