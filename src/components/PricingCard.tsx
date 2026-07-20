// ============================================
// PRICING CARD COMPONENT
// ============================================

import React from 'react';
import { motion } from 'framer-motion';
import { MdCheck, MdClose, MdStar } from 'react-icons/md';
import { PricingPlan } from '../lib/types';

interface PricingCardProps {
  plan: PricingPlan;
  onSelect: (planId: string) => void;
  loading?: boolean;
  currentPlan?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  onSelect,
  loading = false,
  currentPlan,
}) => {
  const isCurrentPlan = currentPlan === plan.id;
  const isPopular = plan.highlighted;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`
        relative bg-white rounded-2xl border-2 overflow-hidden
        transition-all duration-200
        ${isPopular 
          ? 'border-blue-500 shadow-strong ring-2 ring-blue-500/20' 
          : 'border-gray-200 shadow-soft hover:shadow-medium'
        }
      `}
    >
      {/* Popular Badge */}
      {plan.badge && (
        <div className="absolute top-4 right-4">
          <span className={`
            px-3 py-1 text-xs font-bold rounded-full
            ${isPopular 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700'
            }
          `}>
            {plan.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className={`p-6 ${isPopular ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : ''}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.name}</h3>
        <div className="flex items-baseline gap-1 mt-4">
          <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
          <span className="text-gray-500">/{plan.duration}</span>
        </div>
        {plan.originalPrice && (
          <p className="text-sm text-gray-400 line-through mt-1">
            ${plan.originalPrice}/{plan.duration}
          </p>
        )}
      </div>

      {/* Features */}
      <div className="p-6">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <MdCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <div className="p-6 pt-0">
        <button
          onClick={() => onSelect(plan.id)}
          disabled={loading || isCurrentPlan}
          className={`
            w-full py-3 px-6 text-sm font-semibold rounded-xl transition-all duration-200
            ${isCurrentPlan
              ? 'bg-green-50 text-green-700 cursor-default'
              : isPopular
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isCurrentPlan ? 'Current Plan' : plan.buttonText}
        </button>
        {plan.id === 'yearly' && (
          <p className="text-xs text-gray-400 text-center mt-2">
            Save 17% compared to monthly billing
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default PricingCard;