// src/pages/ATSTips.tsx
// ============================================
// ATS OPTIMIZATION TIPS - Beat Applicant Tracking Systems
// ============================================

import React from 'react';
import { motion } from 'framer-motion';
import {
  MdCheckCircle, MdWarning, MdVerified, MdTrendingUp,
  MdLightbulb, MdFileDownload, MdCloudUpload, MdAutoAwesome,
  MdCheck, MdClose, MdStar, MdInfo, MdArrowForward,
} from 'react-icons/md';
import { Link } from 'react-router-dom';

const ATSTips: React.FC = () => {
  const tips = [
    {
      category: "Content Optimization",
      icon: <MdTrendingUp className="w-6 h-6" />,
      items: [
        {
          title: "Match Keywords Exactly",
          description: "Use the exact keywords and phrases from the job description. If the employer asks for 'Project Management,' use that phrase rather than 'Managed Projects.'",
          do: "Use: 'Project Management experience...'",
          dont: "Avoid: 'Experience with managing projects...'",
          priority: "Critical"
        },
        {
          title: "Use Standard Section Headings",
          description: "ATS systems look for specific section headers. Use standard headings like 'PROFESSIONAL EXPERIENCE,' 'EDUCATION,' and 'SKILLS'.",
          do: "Use: 'PROFESSIONAL EXPERIENCE'",
          dont: "Avoid: 'What I've Done' or 'My Background'",
          priority: "Critical"
        },
        {
          title: "Include a Professional Summary",
          description: "A well-written summary at the top of your resume helps ATS systems understand your profile and can improve your ranking.",
          do: "Use: 'Results-driven Data Scientist with 5+ years experience...'",
          dont: "Avoid: 'Hardworking individual seeking opportunities...'",
          priority: "High"
        }
      ]
    },
    {
      category: "Formatting & Layout",
      icon: <MdFileDownload className="w-6 h-6" />,
      items: [
        {
          title: "Use Simple, Clean Formatting",
          description: "ATS systems struggle with complex layouts. Avoid tables, columns, headers/footers, and graphics.",
          do: "Use: Simple, single-column layout with clear headings",
          dont: "Avoid: Multi-column layouts, tables, and graphics",
          priority: "Critical"
        },
        {
          title: "Use Standard Fonts",
          description: "Some fonts may not render properly in ATS. Stick to universally recognized fonts.",
          do: "Use: Arial, Calibri, Times New Roman, or Verdana",
          dont: "Avoid: Decorative or script fonts",
          priority: "Medium"
        },
        {
          title: "Save as DOCX or Standard PDF",
          description: "Some ATS systems have trouble parsing certain PDF formats. DOCX is the most widely accepted format.",
          do: "Use: .docx or 'standard' PDF (not image-based)",
          dont: "Avoid: .pages, .rtf, or image-based PDFs",
          priority: "High"
        }
      ]
    },
    {
      category: "Achievement Writing",
      icon: <MdStar className="w-6 h-6" />,
      items: [
        {
          title: "Quantify Your Achievements",
          description: "Include specific numbers, percentages, and metrics that demonstrate your impact.",
          do: "Use: 'Increased sales by 35% in Q1 2024'",
          dont: "Avoid: 'Responsible for increasing sales'",
          priority: "Critical"
        },
        {
          title: "Use the STAR Method",
          description: "Structure your bullet points using Situation, Task, Action, Result to create compelling stories.",
          do: "Use: 'Led a team of 5 to develop a new CRM, resulting in 20% faster response times'",
          dont: "Avoid: 'Developed a new CRM'",
          priority: "High"
        },
        {
          title: "Focus on Outcomes",
          description: "Highlight what you achieved, not just what you did. Employers care about results.",
          do: "Use: 'Reduced operational costs by 15% through process optimization'",
          dont: "Avoid: 'Managed operations budget'",
          priority: "High"
        }
      ]
    },
    {
      category: "Common Mistakes",
      icon: <MdWarning className="w-6 h-6" />,
      items: [
        {
          title: "Spelling and Grammar Errors",
          description: "ATS systems can detect spelling and grammar errors. Proofread carefully.",
          do: "Use: Spell-check and proofread thoroughly",
          dont: "Avoid: Relying solely on spell-check",
          priority: "Critical"
        },
        {
          title: "Generic Resumes",
          description: "Sending the same resume to every job drastically reduces your chances. Tailor each application.",
          do: "Use: Customize keywords and experience for each job",
          dont: "Avoid: Sending the same resume everywhere",
          priority: "High"
        },
        {
          title: "Inconsistent Dates",
          description: "Ensure all dates are consistent in format (e.g., Jan 2024 or 01/2024) and accurate.",
          do: "Use: Consistent date format throughout",
          dont: "Avoid: Mixing different date formats",
          priority: "Medium"
        }
      ]
    }
  ];

  const checklist = [
    "Use standard section headings",
    "Include relevant keywords from job description",
    "Quantify achievements with numbers and metrics",
    "Use action verbs to start bullet points",
    "Keep formatting simple (no tables or columns)",
    "Proofread for spelling and grammar",
    "Tailor resume to each job application",
    "Save as DOCX or standard PDF",
    "Include professional summary at the top",
    "List experience in reverse chronological order"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MdVerified className="w-10 h-10 text-blue-200" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">ATS Optimization Tips</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Learn how to beat Applicant Tracking Systems and get your resume in front of real recruiters.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">98%</div>
            <p className="text-sm text-gray-500">of Fortune 500 companies use ATS</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">75%</div>
            <p className="text-sm text-gray-500">of resumes are rejected by ATS before review</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">3x</div>
            <p className="text-sm text-gray-500">More interviews with optimized resumes</p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-8">
          {tips.map((section, sectionIndex) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="bg-white rounded-2xl shadow-soft border border-gray-200 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{section.category}</h2>
              </div>

              <div className="space-y-6">
                {section.items.map((item, index) => (
                  <div key={index} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        item.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                        item.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-700">
                          <MdCheck className="w-4 h-4" />
                          <span className="text-xs font-semibold">DO</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">{item.do}</p>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-red-700">
                          <MdClose className="w-4 h-4" />
                          <span className="text-xs font-semibold">DON'T</span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">{item.dont}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-soft border border-gray-200 p-8 mt-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ATS Optimization Checklist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {checklist.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <MdCheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-center mt-8"
        >
          <h2 className="text-2xl font-bold text-white mb-3">Get Your ATS Score Now</h2>
          <p className="text-blue-100 mb-6">
            Upload your resume and get instant feedback on your ATS compatibility.
          </p>
          <Link
            to="/builder"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Analyze My Resume <MdArrowForward className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ATSTips;
