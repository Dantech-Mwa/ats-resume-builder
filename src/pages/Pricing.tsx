// ============================================
// PRICING PAGE
// ============================================

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdCheck, MdVerified, MdBusiness, MdPerson } from 'react-icons/md';
import { useAuth, usePayment } from '../store';
import PricingCard from '../components/PricingCard';
import PaymentModal from '../components/PaymentModal';
import { PRICING_PLANS } from '../config/constants';
import toast from 'react-hot-toast';

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    searchParams.get('plan') || null
  );
  const [showPayment, setShowPayment] = useState(false);

  const handleSelectPlan = (planId: string) => {
    if (!isAuthenticated) {
      navigate(`/register?plan=${planId}`);
      return;
    }
    setSelectedPlan(planId);
    setShowPayment(true);
  };

  const faqs = [
    {
      question: 'What is the 14-day trial?',
      answer: 'Get full access to all features for 14 days for just $1. You can create unlimited resumes, use all templates, and access AI features.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes! You can cancel your subscription at any time. If you cancel, you\'ll continue to have access until the end of your billing period.',
    },
    {
      question: 'Is there a money-back guarantee?',
      answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied, we\'ll refund your payment in full.',
    },
    {
      question: 'Can I switch plans?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. The new pricing will take effect at the start of your next billing cycle.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start with a 14-day trial for just $1, then pick the plan that fits your needs.
              All plans include access to our AI-powered resume builder.
            </p>
            {user?.subscription && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm">
                <MdPerson className="w-4 h-4" />
                Current plan: <span className="font-semibold capitalize">{user.subscription.plan}</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PricingCard
                plan={plan}
                onSelect={handleSelectPlan}
                currentPlan={user?.subscription?.plan}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Feature Comparison
        </h2>
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-sm font-semibold text-gray-900">Feature</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-900">Trial</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-900 bg-blue-50">Monthly</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-900">Yearly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { feature: 'Resume Creation', trial: true, monthly: true, yearly: true },
                { feature: 'AI Suggestions', trial: 'Basic', monthly: 'Advanced', yearly: 'Advanced' },
                { feature: 'ATS Score', trial: true, monthly: true, yearly: true },
                { feature: 'Templates', trial: '5 Basic', monthly: 'All Premium', yearly: 'All Premium' },
                { feature: 'Exports', trial: '5/month', monthly: 'Unlimited', yearly: 'Unlimited' },
                { feature: 'Job Matching', trial: false, monthly: true, yearly: true },
                { feature: 'Priority Support', trial: false, monthly: true, yearly: true },
                { feature: 'Custom Branding', trial: false, monthly: false, yearly: true },
                { feature: 'API Access', trial: false, monthly: false, yearly: true },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-700">{row.feature}</td>
                  <td className="text-center p-4">
                    {typeof row.trial === 'boolean' ? (
                      row.trial ? <MdCheck className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>
                    ) : (
                      <span className="text-sm text-gray-600">{row.trial}</span>
                    )}
                  </td>
                  <td className="text-center p-4 bg-blue-50">
                    {typeof row.monthly === 'boolean' ? (
                      row.monthly ? <MdCheck className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>
                    ) : (
                      <span className="text-sm text-gray-600">{row.monthly}</span>
                    )}
                  </td>
                  <td className="text-center p-4">
                    {typeof row.yearly === 'boolean' ? (
                      row.yearly ? <MdCheck className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>
                    ) : (
                      <span className="text-sm text-gray-600">{row.yearly}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-sm text-gray-600">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-blue-100 mb-8">
            Join thousands of professionals who have created winning resumes.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-white text-blue-600 text-lg font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started for $1
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => {
            setShowPayment(false);
            setSelectedPlan(null);
          }}
          planId={selectedPlan}
        />
      )}
    </div>
  );
};

export default Pricing;