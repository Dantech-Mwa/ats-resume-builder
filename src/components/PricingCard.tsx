// src/components/PricingCard.tsx
// ============================================
// PRICING CARD COMPONENT - FULLY CLICKABLE TRIAL
// ============================================

import React from 'react';
import { motion } from 'framer-motion';
import { MdCheck, MdLock } from 'react-icons/md';
import { PricingPlan } from '../lib/types';

interface PricingCardProps {
  plan: PricingPlan;
  onSelect: (planId: string) => void;
  loading?: boolean;
  currentPlan?: string;
  isLocked?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  onSelect,
  loading = false,
  currentPlan,
  isLocked = false,
}) => {
  // ✅ FIX: Always allow trial selection, even if user is on trial
  const isTrial = plan.id === 'trial';
  const isCurrentPlan = currentPlan === plan.id && !isTrial; // ✅ Trial is never "current"
  const isPopular = plan.highlighted;
  
  // ✅ FIX: Only disable if loading, or if it's a non-trial current plan
  const isDisabled = loading || (isCurrentPlan && !isTrial);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`
        relative bg-white rounded-2xl border-2 overflow-hidden
        transition-all duration-200
        ${isPopular 
          ? 'border-blue-500 shadow-strong ring-2 ring-blue-500/20' 
          : isTrial
            ? 'border-green-400 shadow-soft hover:shadow-medium hover:border-green-500'
            : 'border-gray-200 shadow-soft hover:shadow-medium'
        }
        ${isLocked ? 'opacity-90' : ''}
      `}
    >
      {/* Popular Badge */}
      {plan.badge && (
        <div className="absolute top-4 right-4">
          <span className={`
            px-3 py-1 text-xs font-bold rounded-full
            ${isPopular 
              ? 'bg-blue-100 text-blue-700' 
              : isTrial
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }
          `}>
            {plan.badge}
          </span>
        </div>
      )}

      {/* Trial Badge */}
      {isTrial && (
        <div className="absolute top-4 left-4">
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
            🚀 Best Value
          </span>
        </div>
      )}

      {/* Locked Badge */}
      {isLocked && !isTrial && (
        <div className="absolute top-4 left-4">
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-700">
            <MdLock className="w-3 h-3" />
            Locked
          </span>
        </div>
      )}

      {/* Header */}
      <div className={`p-6 ${
        isTrial 
          ? 'bg-gradient-to-br from-green-50 to-emerald-50' 
          : isPopular 
            ? 'bg-gradient-to-br from-blue-50 to-indigo-50' 
            : ''
      }`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.name}</h3>
        <div className="flex items-baseline gap-1 mt-4">
          <span className={`text-4xl font-bold ${isTrial ? 'text-green-600' : 'text-gray-900'}`}>
            ${plan.price}
          </span>
          <span className="text-gray-500">/{plan.duration}</span>
        </div>
        {plan.originalPrice && (
          <p className="text-sm text-gray-400 line-through mt-1">
            ${plan.originalPrice}/{plan.duration}
          </p>
        )}
        
        {/* Trial special offer */}
        {isTrial && (
          <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
            <span className="font-bold">🎯</span>
            <span>Pay $1 • Full access for 14 days</span>
          </div>
        )}

        {/* Locked indicator */}
        {isLocked && !isTrial && (
          <div className="mt-2 flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">
            <MdLock className="w-3 h-3" />
            <span>Subscribe to download</span>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="p-6">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <MdCheck className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isTrial ? 'text-green-500' : 'text-green-500'}`} />
              <span className={`text-sm ${isLocked && !isTrial ? 'text-gray-400' : 'text-gray-600'}`}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <div className="p-6 pt-0">
        <button
          onClick={() => onSelect(plan.id)}
          disabled={isDisabled}
          className={`
            w-full py-3 px-6 text-sm font-semibold rounded-xl transition-all duration-200
            ${isDisabled && !isTrial
              ? 'bg-green-50 text-green-700 cursor-default'
              : isTrial
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30 hover:shadow-green-600/40 transform hover:scale-[1.02]'
                : isLocked
                  ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25'
                  : isPopular
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
            }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          `}
        >
          {isTrial && currentPlan === 'trial' && !isLocked
            ? '🚀 Start Trial Now' // ✅ Always clickable
            : isTrial
              ? '🚀 Start 14-Day Trial'
              : isCurrentPlan
                ? '✅ Current Plan'
                : isLocked
                  ? '🔒 Subscribe to Download'
                  : plan.buttonText
          }
        </button>
        
        {/* Trial-specific messaging */}
        {isTrial && (
          <div className="mt-2 text-center">
            <p className="text-xs text-green-600 font-medium">
              🔓 Pay $1 now • Cancel anytime
            </p>
            <p className="text-xs text-gray-400 mt-1">
              No auto-renewal • 14-day full access
            </p>
          </div>
        )}
        
        {/* Yearly savings */}
        {plan.id === 'yearly' && !isLocked && (
          <p className="text-xs text-gray-400 text-center mt-2">
            Save 17% compared to monthly billing
          </p>
        )}
        
        {/* Locked footer */}
        {isLocked && !isTrial && (
          <p className="text-xs text-orange-400 text-center mt-2">
            🔓 Subscribe to unlock downloads
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default PricingCard;
