// ============================================
// ATS SCORE COMPONENT - Score Display & Gauge
// ============================================

import React from 'react';
import { motion } from 'framer-motion';
const CircularScore = ({ value, color }: { value: number; color: string }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle
        cx="50" cy="50" r={radius}
        fill="none" stroke="#F3F4F6" strokeWidth="8"
      />
      <circle
        cx="50" cy="50" r={radius}
        fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text
        x="50" y="50"
        textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize="24" fontWeight="bold"
      >
        {value}
      </text>
    </svg>
  );
};
import { MdInfo, MdWarning, MdCheckCircle, MdTrendingUp } from 'react-icons/md';
import { ATSScore as ATSScoreType } from '../lib/types';
import { getScoreColor, getScoreLabel, getScoreIcon } from '../lib/utils';

interface ATSScoreProps {
  score: ATSScoreType | null;
  loading?: boolean;
  onAnalyze?: () => void;
  compact?: boolean;
}

const ATSScore: React.FC<ATSScoreProps> = ({
  score,
  loading = false,
  onAnalyze,
  compact = false,
}) => {
  if (!score && !loading) {
    return (
      <div className="text-center p-6">
        <div className="text-4xl mb-3">📊</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No ATS Score Yet
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Analyze your resume to see how well it performs with Applicant Tracking Systems
        </p>
        {onAnalyze && (
          <button
            onClick={onAnalyze}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Analyze Resume
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center p-6">
        <div className="animate-pulse">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
        <p className="text-sm text-gray-500 mt-4">Analyzing your resume...</p>
      </div>
    );
  }

  if (!score) return null;

  const overallScore = score.overall;
  const scoreColor = overallScore >= 80 ? '#10B981' : overallScore >= 60 ? '#F59E0B' : '#EF4444';

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
        <div className="w-16 h-16">
          <CircularScore value={overallScore} color={scoreColor} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {getScoreLabel(overallScore)}
          </p>
          <p className="text-xs text-gray-500">
            ATS Compatibility Score
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            ATS Compatibility Score
          </h3>
          <span className="text-2xl">{getScoreIcon(overallScore)}</span>
        </div>

        {/* Score Circle */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24">
          <CircularScore value={overallScore} color={scoreColor} />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">
              {getScoreLabel(overallScore)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {overallScore >= 80
                ? 'Your resume is well-optimized for ATS!'
                : overallScore >= 60
                ? 'Good start, but there\'s room for improvement.'
                : 'Your resume needs optimization for ATS.'}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Analyzed: {new Date(score.analyzedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          Score Breakdown
        </h4>
        <div className="space-y-3">
          {Object.entries(score.breakdown).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className={`text-sm font-medium ${getScoreColor(value)}`}>
                  {value}/100
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`h-full rounded-full ${
                    value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Missing Keywords */}
      {score.missingKeywords && score.missingKeywords.length > 0 && (
        <div className="p-6 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MdWarning className="text-yellow-500" />
            Missing Keywords
          </h4>
          <div className="flex flex-wrap gap-2">
            {score.missingKeywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full border border-yellow-200"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Tips */}
      {score.improvementTips && score.improvementTips.length > 0 && (
        <div className="p-6 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MdTrendingUp className="text-blue-500" />
            Improvement Tips
          </h4>
          <ul className="space-y-2">
            {score.improvementTips.slice(0, 5).map((tip, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <span className="text-blue-500 mt-1">•</span>
                {tip}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Critical Issues */}
      {score.criticalIssues && score.criticalIssues.length > 0 && (
        <div className="p-6 border-t border-gray-100 bg-red-50/50">
          <h4 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
            <MdWarning className="text-red-500" />
            Critical Issues
          </h4>
          <ul className="space-y-2">
            {score.criticalIssues.map((issue, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-red-700"
              >
                <span className="text-red-500 mt-1">⚠</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Re-analyze Button */}
      {onAnalyze && (
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={onAnalyze}
            disabled={loading}
            className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Re-analyze Resume'}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ATSScore;