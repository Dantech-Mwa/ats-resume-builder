// ============================================
// PAYMENT MODAL - PayPal Integration with Real Buttons
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MdLock, MdPayment, MdCheckCircle, MdError } from 'react-icons/md';
import { FaPaypal, FaStripe } from 'react-icons/fa';
import Modal from './Modal';
import Loading from './Loading';
import { usePayment } from '../store';
import { PRICING_PLANS } from '../config/constants';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
}

// PayPal Hosted Button IDs
const PAYPAL_BUTTON_IDS: Record<string, string> = {
  trial: 'A8FY2UJYT78A6',    // 14-day trial - $1
  monthly: 'NL8V38YK9U3HW',   // 1 month - $5
  yearly: 'SAFHCK6ZZWULN',    // 1 year - $50
};

// PayPal Button Container IDs
const PAYPAL_CONTAINER_IDS: Record<string, string> = {
  trial: 'paypal-container-A8FY2UJYT78A6',
  monthly: 'paypal-container-NL8V38YK9U3HW',
  yearly: 'paypal-container-SAFHCK6ZZWULN',
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  planId,
}) => {
  const { loading, error, addPayment, updateSubscription } = usePayment();
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'stripe'>('paypal');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const paypalScriptLoaded = useRef(false);

  const plan = PRICING_PLANS.find((p) => p.id === planId);
  const containerId = PAYPAL_CONTAINER_IDS[planId] || PAYPAL_CONTAINER_IDS.trial;
  const buttonId = PAYPAL_BUTTON_IDS[planId] || PAYPAL_BUTTON_IDS.trial;

  // Load PayPal SDK
  useEffect(() => {
    if (paymentMethod === 'paypal' && isOpen && !paypalScriptLoaded.current) {
      // Remove any existing PayPal scripts
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Load PayPal SDK with Hosted Buttons
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=BAA6-pKbrnpOaKuvEMkQ8nG3vEociOmnS3OVnp_oPANPNefmj3dPjrXcVvoKrr3prhADRZ4TY1jidZlNOQ&components=hosted-buttons&disable-funding=venmo&currency=USD`;
      script.async = true;
      
      script.onload = () => {
        console.log('✅ PayPal SDK loaded');
        paypalScriptLoaded.current = true;
        
        // Render the PayPal button
        try {
          if ((window as any).paypal?.HostedButtons) {
            (window as any).paypal.HostedButtons({
              hostedButtonId: buttonId,
            }).render(`#${containerId}`);
            console.log(`✅ PayPal button rendered for plan: ${planId}`);
          }
        } catch (error) {
          console.error('Failed to render PayPal button:', error);
        }
      };

      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
        toast.error('Failed to load PayPal. Please try again.');
      };

      document.body.appendChild(script);
    }

    return () => {
      // Cleanup - remove PayPal scripts when modal closes
      if (!isOpen) {
        const script = document.querySelector('script[src*="paypal.com/sdk/js"]');
        if (script) {
          script.remove();
          paypalScriptLoaded.current = false;
        }
      }
    };
  }, [paymentMethod, isOpen, planId, containerId, buttonId]);

  const handleStripePayment = async () => {
    setProcessing(true);
    
    try {
      // Simulate Stripe payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create payment record
      const paymentDetails = {
        planId: planId,
        amount: plan?.price || 0,
        currency: 'USD',
        method: 'stripe' as const,
        status: 'completed' as const,
        transactionId: `STRIPE-TXN-${Date.now()}`,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      addPayment(paymentDetails);

      // Update subscription
      const now = new Date();
      let endDate = new Date();
      
      switch (plan?.duration) {
        case 'trial':
          endDate.setDate(now.getDate() + 14);
          break;
        case 'monthly':
          endDate.setMonth(now.getMonth() + 1);
          break;
        case 'yearly':
          endDate.setFullYear(now.getFullYear() + 1);
          break;
      }

      updateSubscription({
        plan: plan?.duration || 'none',
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        paymentMethod: 'stripe',
        status: 'active',
        amount: plan?.price || 0,
        currency: 'USD',
        autoRenew: plan?.duration !== 'trial',
        paymentId: paymentDetails.transactionId,
      });

      setSuccess(true);
      toast.success('Payment successful!');
      
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!plan) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={success ? 'Payment Successful!' : 'Complete Your Purchase'}
      size="md"
      showCloseButton={!processing}
      closeOnOverlay={!processing}
    >
      {success ? (
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <MdCheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Thank You!
          </h3>
          <p className="text-gray-500">
            Your {plan.name} subscription is now active on DanJobs.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h4>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">{plan.name} Plan</span>
              <span className="text-sm font-medium text-gray-900">${plan.price}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">
                ${plan.price} <span className="text-xs text-gray-500">USD</span>
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Payment Method
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('paypal')}
                className={`
                  p-4 border-2 rounded-xl flex items-center justify-center gap-2 transition-colors
                  ${paymentMethod === 'paypal'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <FaPaypal className="w-6 h-6 text-[#0070ba]" />
                <span className="text-sm font-medium">PayPal</span>
              </button>
              <button
                onClick={() => setPaymentMethod('stripe')}
                className={`
                  p-4 border-2 rounded-xl flex items-center justify-center gap-2 transition-colors
                  ${paymentMethod === 'stripe'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <FaStripe className="w-6 h-6 text-[#635bff]" />
                <span className="text-sm font-medium">Stripe</span>
              </button>
            </div>
          </div>

          {/* PayPal Button Container */}
          {paymentMethod === 'paypal' && (
            <div className="min-h-[200px] flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-4">
                You will be redirected to PayPal to complete your payment.
              </p>
              <div 
                id={containerId}
                className="w-full flex justify-center"
              />
              <p className="text-xs text-gray-400 mt-3">
                Secure payment processed by PayPal
              </p>
            </div>
          )}

          {/* Stripe Payment */}
          {paymentMethod === 'stripe' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={handleStripePayment}
                disabled={processing}
                className="w-full py-3 px-6 bg-[#635bff] text-white text-sm font-semibold rounded-xl hover:bg-[#4f46e5] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loading type="spinner" size="sm" />
                    Processing...
                  </>
                ) : (
                  <>
                    <MdLock className="w-4 h-4" />
                    Pay ${plan.price} with Stripe
                  </>
                )}
              </button>
            </div>
          )}

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <MdLock className="w-3 h-3" />
            Secured by {paymentMethod === 'paypal' ? 'PayPal' : 'Stripe'}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PaymentModal;