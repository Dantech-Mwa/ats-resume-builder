// src/pages/ResumeGuide.tsx
// ============================================
// RESUME WRITING GUIDE - Professional Resume Tips
// ============================================

import React from 'react';
import { motion } from 'framer-motion';
import {
  MdCheckCircle, MdLightbulb, MdSchool, MdWork,
  MdTrendingUp, MdPeople, MdStar, MdBookmark,
  MdDescription, MdFormatListBulleted, MdPublishedWithChanges,
  MdVerified, MdInfo, MdArrowForward, MdKeyboardArrowDown,
} from 'react-icons/md';
import { Link } from 'react-router-dom';

const ResumeGuide: React.FC = () => {
  const sections = [
    {
      icon: <MdLightbulb className="w-6 h-6" />,
      title: "Understanding ATS",
      content: "Applicant Tracking Systems (ATS) are software used by 98% of Fortune 500 companies to filter resumes before they reach human eyes. Your resume must be optimized to pass these systems.",
      tips: [
        "Use standard section headings (EXPERIENCE, EDUCATION, SKILLS)",
        "Avoid complex formatting (tables, columns, graphics)",
        "Include relevant keywords from the job description",
        "Save as DOCX or standard PDF format"
      ]
    },
    {
      icon: <MdDescription className="w-6 h-6" />,
      title: "Resume Structure",
      content: "A well-structured resume follows a clear hierarchy that guides the reader's eye and makes information easy to find.",
      tips: [
        "Contact Information - Full name, email, phone, location",
        "Professional Summary - 3-4 sentences highlighting your value",
        "Work Experience - Reverse chronological order with achievements",
        "Education - Degrees, institutions, and relevant coursework",
        "Skills - Technical and soft skills relevant to the role"
      ]
    },
    {
      icon: <MdFormatListBulleted className="w-6 h-6" />,
      title: "Writing Achievements",
      content: "Employers want to see what you accomplished, not just what you did. Use the STAR method (Situation, Task, Action, Result) to structure your bullet points.",
      tips: [
        "Start each bullet with a strong action verb (Led, Developed, Increased)",
        "Include specific numbers and metrics (%, $, # of people)",
        "Focus on outcomes and impact, not just responsibilities",
        "Keep bullet points to 1-2 lines each"
      ]
    },
    {
      icon: <MdTrendingUp className="w-6 h-6" />,
      title: "Keyword Optimization",
      content: "ATS systems scan for keywords that match the job description. The more relevant keywords your resume contains, the higher it will rank.",
      tips: [
        "Analyze job descriptions for recurring keywords",
        "Use both long-form and acronym versions (Project Management, PM)",
        "Include industry-specific terminology",
        "Place keywords naturally in context"
      ]
    },
    {
      icon: <MdSchool className="w-6 h-6" />,
      title: "Education Section",
      content: "Your education section should highlight your academic achievements and relevant coursework.",
      tips: [
        "List degrees in reverse chronological order",
        "Include GPA if 3.5 or above",
        "Add relevant coursework, honors, and activities",
        "Include certifications and professional development"
      ]
    },
    {
      icon: <MdPeople className="w-6 h-6" />,
      title: "Common Mistakes to Avoid",
      content: "Even the most qualified candidates can be rejected by ATS due to common formatting and content errors.",
      tips: [
        "Don't use images, logos, or graphics",
        "Avoid headers and footers",
        "Don't use columns or tables",
        "Avoid using 'I' or personal pronouns",
        "Don't include irrelevant personal information"
      ]
    }
  ];

  const actionVerbs = [
    "Achieved", "Led", "Developed", "Implemented", "Managed",
    "Created", "Designed", "Increased", "Reduced", "Improved",
    "Optimized", "Streamlined", "Launched", "Directed", "Coordinated",
    "Spearheaded", "Orchestrated", "Delivered", "Executed", "Transformed",
    "Accelerated", "Maximized", "Generated", "Established", "Pioneered"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Resume Writing Guide</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Master the art of resume writing and create documents that stand out to both AI and human recruiters.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-soft border border-gray-200 p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Your Resume Matters</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Your resume is your most important career document. It's the first impression you make on potential employers and the key that unlocks opportunities. In today's competitive job market, a well-crafted resume can be the difference between landing an interview and being overlooked.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Our AI-powered resume builder helps you create professionally optimized resumes that pass through ATS filters and impress hiring managers. Use this guide to understand the principles behind effective resume writing.
          </p>
        </motion.div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-soft transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                  {section.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{section.content}</p>
                  <ul className="space-y-1.5">
                    {section.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <MdCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Verbs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-soft border border-gray-200 p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Powerful Action Verbs</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Start your bullet points with these powerful action verbs to make your achievements more impactful:
          </p>
          <div className="flex flex-wrap gap-2">
            {actionVerbs.map((verb, index) => (
              <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                {verb}
              </span>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Build Your Resume?</h2>
          <p className="text-blue-100 mb-6">
            Use our AI-powered resume builder to create a professional, ATS-optimized resume in minutes.
          </p>
          <Link
            to="/builder"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Start Building <MdArrowForward className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeGuide;
