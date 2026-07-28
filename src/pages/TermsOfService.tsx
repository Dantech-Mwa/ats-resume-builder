// src/pages/TermsOfService.tsx
// ============================================
// TERMS OF SERVICE - Legal Terms & Conditions
// ============================================

import React from 'react';
import { motion } from 'framer-motion';
import { MdCheckCircle, MdGavel, MdPayment, MdSecurity, MdCode, MdPeople } from 'react-icons/md';

const TermsOfService: React.FC = () => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `
        By using ATS Resume Builder ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. We reserve the right to update these terms at any time, and continued use constitutes acceptance of the updated terms.
      `,
      icon: <MdGavel className="w-6 h-6" />
    },
    {
      title: "2. User Accounts",
      content: `
        To use certain features, you must create an account. You are responsible for:
        - Maintaining the confidentiality of your account credentials
        - All activities that occur under your account
        - Providing accurate and complete information
        - Notifying us immediately of any unauthorized use
        - Ensuring your account information is current
      `,
      icon: <MdPeople className="w-6 h-6" />
    },
    {
      title: "3. Subscription and Payments",
      content: `
        Our Services are provided on a subscription basis:
        - 14-day trial: $1 for full access
        - Monthly subscription: $14.99 per month
        - Yearly subscription: $89.99 per year
        - Payments are processed securely via PayPal or Stripe
        - Subscriptions auto-renew unless cancelled
        - Refunds are available within 30 days of purchase
        - You may cancel anytime through your account settings
      `,
      icon: <MdPayment className="w-6 h-6" />
    },
    {
      title: "4. User Content",
      content: `
        You retain all rights to your resume content. By using our Service, you grant us:
        - The right to process and analyze your data to provide AI-powered suggestions
        - The right to store your data securely for future access
        - The right to anonymize and aggregate data for analytics purposes
        - We do not claim ownership of your content
        - You may delete your data at any time
      `,
      icon: <MdCode className="w-6 h-6" />
    },
    {
      title: "5. Prohibited Uses",
      content: `
        You may not use our Service to:
        - Create fraudulent or misleading content
        - Violate any applicable laws or regulations
        - Infringe on the rights of others
        - Distribute malware or harmful code
        - Circumvent our security measures
        - Harvest or collect user data without consent
        - Impersonate any person or entity
      `,
      icon: <MdSecurity className="w-6 h-6" />
    },
    {
      title: "6. Termination",
      content: `
        We reserve the right to terminate or suspend accounts:
        - For violation of these Terms
        - For extended periods of inactivity
        - At our sole discretion
        - Upon request by the user
        - Termination may result in loss of data
        - You may export your data before termination
      `,
      icon: <MdCheckCircle className="w-6 h-6" />
    },
    {
      title: "7. Disclaimer of Warranties",
      content: `
        Our Services are provided "as is" and "as available." We do not guarantee:
        - That the service will be uninterrupted or error-free
        - Specific outcomes or job placements
        - Accuracy of AI-generated content
        - Compatibility with all ATS systems
        We are not responsible for any decisions made based on our services.
      `,
      icon: <MdCheckCircle className="w-6 h-6" />
    },
    {
      title: "8. Limitation of Liability",
      content: `
        To the maximum extent permitted by law:
        - We are not liable for any indirect, incidental, or consequential damages
        - Our total liability is limited to the amount you paid us
        - We are not responsible for third-party actions or content
        - We are not liable for any data loss or corruption
        - Some jurisdictions do not allow these limitations
      `,
      icon: <MdGavel className="w-6 h-6" />
    },
    {
      title: "9. Governing Law",
      content: `
        These Terms are governed by the laws of Kenya. Any disputes shall be resolved in the courts of Kenya. By using our Service, you consent to this jurisdiction and venue.
      `,
      icon: <MdGavel className="w-6 h-6" />
    },
    {
      title: "10. Contact Information",
      content: `
        For questions about these Terms of Service:
        - Email: wambuamwanza6@gmail.com
        - Response time: Within 48 hours
        - We strive to resolve all issues promptly
      `,
      icon: <MdPeople className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-blue-100">
            Please read these terms carefully before using our platform.
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
            Welcome to ATS Resume Builder. These Terms of Service govern your use of our platform and services. By using our platform, you agree to these terms. Please read them carefully before using any of our services.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
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
            By using our platform, you agree to these Terms of Service and our Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
