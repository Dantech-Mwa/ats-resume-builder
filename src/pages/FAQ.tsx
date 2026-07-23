import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdExpandMore } from 'react-icons/md';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: 'What is an ATS and why does it matter?', a: 'An Applicant Tracking System (ATS) is software used by employers to filter and rank resumes. Over 75% of large companies use ATS. If your resume isn\'t optimized, it may be rejected before a human ever sees it.' },
    { q: 'How does the AI scoring work?', a: 'Our AI analyzes your resume against 10 key factors including keyword optimization, formatting, action verbs, quantifiable results, and section completeness. It compares your resume against industry standards and provides specific recommendations for improvement.' },
    { q: 'What file formats do you support?', a: 'We support PDF, DOCX, and TXT files for upload. You can download your resume in PDF, DOCX, or plain text format.' },
    { q: 'Is my data secure?', a: 'Yes. Your data is encrypted both in transit and at rest. We use Firebase security rules to ensure only you can access your resumes. We never share your personal information with third parties.' },
    { q: 'How does the 14-day trial work?', a: 'For just $1, you get 14 days of full access to all features including AI analysis, unlimited downloads, and all templates. After the trial, you can subscribe monthly ($5) or yearly ($50).' },
    { q: 'Can I cancel my subscription?', a: 'Yes, you can cancel anytime. You\'ll continue to have access until the end of your billing period. We also offer a 30-day money-back guarantee.' },
    { q: 'How accurate is the ATS score?', a: 'Our scoring engine uses both local analysis (consistent, instant) and AI enhancement (deep, contextual). The blended score reflects how well your resume would perform against real ATS systems.' },
    { q: 'Do you offer templates for specific industries?', a: 'Yes! We have templates optimized for technology, finance, healthcare, creative, and executive roles. Each template is designed with ATS compatibility in mind.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600">Everything you need to know about ATS Resume Builder</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                <MdExpandMore className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <p className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
