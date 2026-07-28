// src/pages/PrivacyPolicy.tsx
// ============================================
// PRIVACY POLICY - Data Protection & Privacy
// ============================================

import React from 'react';
import { motion } from 'framer-motion';
import { MdCheckCircle, MdSecurity, MdDataUsage, MdShare, MdEmail } from 'react-icons/md';

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      title: "1. Information We Collect",
      content: `
        We collect information you provide directly to us, including:
        - Personal details (name, email, phone number, location)
        - Professional information (resume content, work experience, education, skills)
        - Account credentials (username, password)
        - Payment information (processed through secure third-party providers)
        - Communication history with our support team
      `,
      icon: <MdDataUsage className="w-6 h-6" />
    },
    {
      title: "2. How We Use Your Information",
      content: `
        We use your information to:
        - Provide and improve our resume building services
        - Generate ATS scores and AI-powered recommendations
        - Process payments and manage your subscription
        - Send you important updates about your account
        - Respond to your inquiries and support requests
        - Analyze usage patterns to improve user experience
      `,
      icon: <MdShare className="w-6 h-6" />
    },
    {
      title: "3. Data Security",
      content: `
        We take data security seriously:
        - All data is encrypted in transit using SSL/TLS
        - Your resume data is stored securely in Firebase with industry-standard encryption
        - We implement strict access controls and monitoring
        - Regular security audits are conducted
        - We never store sensitive payment information (processed by PayPal/Stripe)
      `,
      icon: <MdSecurity className="w-6 h-6" />
    },
    {
      title: "4. Data Sharing",
      content: `
        We do not sell your personal information. We share data only:
        - With trusted third-party services (Firebase, PayPal, Stripe) for essential operations
        - When required by law or to protect our legal rights
        - With your explicit consent
        - To detect and prevent fraud or security issues
      `,
      icon: <MdCheckCircle className="w-6 h-6" />
    },
    {
      title: "5. Your Rights",
      content: `
        You have the right to:
        - Access, correct, or delete your personal data
        - Export your resume data at any time
        - Opt out of marketing communications
        - Request a copy of your data
        - Withdraw consent at any time
        - Lodge a complaint with data protection authorities
      `,
      icon: <MdCheckCircle className="w-6 h-6" />
    },
    {
      title: "6. Contact Us",
      content: `
        If you have questions about this privacy policy or your data:
        - Email: wambuamwanza6@gmail.com
        - Response time: Within 48 hours
        - We're committed to protecting your privacy
      `,
      icon: <MdEmail className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-blue-100">
            Your privacy matters to us. Learn how we protect your data.
          </p>
          <p className="text-sm text-blue-200 mt-4">Last Updated: July 2024</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-soft border border-gray-200 p-8 mb-8"
        >
          <p className="text-gray-600 leading-relaxed">
            Your privacy is critically important to us. This Privacy Policy explains how ATS Resume Builder ("we," "our," or "us") collects, uses, and protects your personal information when you use our platform. We are committed to transparency and ensuring you understand how your data is handled.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
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
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-50 rounded-xl border border-gray-200 p-6 mt-8 text-center"
        >
          <p className="text-sm text-gray-500">
            This Privacy Policy may be updated from time to time. We will notify you of any changes by posting the new policy on this page.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
