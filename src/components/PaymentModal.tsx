// src/components/PaymentModal.tsx
// ============================================
// PAYMENT MODAL - PayPal Integration with Real Buttons
// Pay-to-Download Flow: After payment, update subscription
// WITH TRIAL-SPECIFIC MESSAGING
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MdLock, MdPayment, MdCheckCircle, MdError, MdDownload, MdPerson, MdRocket } from 'react-icons/md';
import { FaPaypal, FaStripe } from 'react-icons/fa';
import Modal from './Modal';
import Loading from './Loading';
import { usePayment, useAuth } from '../store';
import { PRICING_PLANS } from '../config/constants';
import { authService, databaseService } from '../lib/firebase';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  onSuccess?: () => void;
}

// PayPal Hosted Button IDs
const PAYPAL_BUTTON_IDS: Record<string, string> = {
  trial: 'A8FY2UJYT78A6',    // 14-day trial - $1
  monthly: 'NL8V38YK9U3HW',   // 1 month - $14.99
  yearly: 'SAFHCK6ZZWULN',    // 1 year - $89.99
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
  onSuccess,
}) => {
  const { user } = useAuth();
  const { loading, error, addPayment, updateSubscription } = usePayment();
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'stripe'>('paypal');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const paypalScriptLoaded = useRef(false);

  const plan = PRICING_PLANS.find((p) => p.id === planId);
  const containerId = PAYPAL_CONTAINER_IDS[planId] || PAYPAL_CONTAINER_IDS.trial;
  const buttonId = PAYPAL_BUTTON_IDS[planId] || PAYPAL_BUTTON_IDS.trial;
  
  // ✅ Check if this is a trial plan
  const isTrial = planId === 'trial';

  // Load PayPal SDK
  useEffect(() => {
    if (paymentMethod === 'paypal' && isOpen && !paypalScriptLoaded.current) {
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript) {
        existingScript.remove();
        paypalScriptLoaded.current = false;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=BAA6-pKbrnpOaKuvEMkQ8nG3vEociOmnS3OVnp_oPANPNefmj3dPjrXcVvoKrr3prhADRZ4TY1jidZlNOQ&components=hosted-buttons&disable-funding=venmo&currency=USD`;
      script.async = true;
      
     script.onload = () => {
  console.log('✅ PayPal SDK loaded');
  paypalScriptLoaded.current = true;
  
  // ✅ Add delay to ensure DOM is ready
  setTimeout(() => {
    try {
      if ((window as any).paypal?.HostedButtons) {
        console.log('🎯 Rendering PayPal button for:', containerId);
        
        (window as any).paypal.HostedButtons({
          hostedButtonId: buttonId,
          // ✅ Add style configuration
          style: {
            layout: 'horizontal',
            color: 'blue',
            shape: 'rect',
            label: 'paypal',
          },
          onApprove: (data: any) => {
            console.log('✅ PayPal payment approved:', data);
            handlePayPalSuccess(data);
          },
          onCancel: () => {
            console.log('❌ PayPal payment cancelled');
            toast.error('Payment cancelled');
          },
          onError: (err: any) => {
            console.error('❌ PayPal error:', err);
            setPaymentError('PayPal payment failed. Please try again.');
            toast.error('Payment failed. Please try again.');
          },
        }).render(`#${containerId}`);
        
        console.log(`✅ PayPal button rendered for plan: ${planId}`);
      } else {
        console.warn('⚠️ PayPal HostedButtons not available');
      }
    } catch (error) {
      console.error('Failed to render PayPal button:', error);
      setPaymentError('Failed to load PayPal button. Please try again.');
    }
  }, 500); // ✅ 500ms delay for DOM readiness
};

      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
        setPaymentError('Failed to load PayPal. Please check your connection.');
        toast.error('Failed to load PayPal. Please try again.');
      };

      document.body.appendChild(script);
    }

    return () => {
      if (!isOpen) {
        const script = document.querySelector('script[src*="paypal.com/sdk/js"]');
        if (script) {
          script.remove();
          paypalScriptLoaded.current = false;
        }
      }
    };
  }, [paymentMethod, isOpen, planId, containerId, buttonId]);

  // ============================================
  // HANDLE PAYPAL SUCCESS
  // ============================================
const handlePayPalSuccess = async (data: any) => {
  if (!user) {
    toast.error('User not found. Please login again.');
    return;
  }

  setProcessing(true);
  setPaymentError(null);

  try {
    // Create payment record
    const paymentDetails = {
      planId: planId,
      amount: plan?.price || 0,
      currency: 'USD',
      method: 'paypal' as const,
      status: 'completed' as const,
      transactionId: data.orderID || `PAYPAL-TXN-${Date.now()}`,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    addPayment(paymentDetails);

    const now = new Date();
    let endDate = new Date();
    let amount = plan?.price || 0;
    
    switch (plan?.duration) {
      case 'trial':
        endDate.setDate(now.getDate() + 14);
        amount = 1;
        break;
      case 'monthly':
        endDate.setMonth(now.getMonth() + 1);
        amount = 14.99;
        break;
      case 'yearly':
        endDate.setFullYear(now.getFullYear() + 1);
        amount = 89.99;
        break;
      default:
        endDate.setDate(now.getDate() + 14);
        amount = 1;
    }

    const subscription = {
      plan: plan?.duration || 'trial',
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      paymentMethod: 'paypal' as const,
      status: 'active' as const,
      amount: amount,
      currency: 'USD',
      autoRenew: plan?.duration !== 'trial',
      paymentId: paymentDetails.transactionId,
      isPaid: true, // ✅ MAKE SURE THIS IS SET TO true
    };

    // ✅ 3. Update local state
    updateSubscription(subscription);

    // ✅ 4. Save payment and subscription to Firebase
    try {
      await databaseService.savePayment(user.id, paymentDetails);
      await authService.updateSubscription(user.id, subscription);
      console.log('✅ Payment and subscription saved to Firebase', subscription);
    } catch (firebaseError) {
      console.warn('Firebase save failed, but local state is updated:', firebaseError);
    }

    setSuccess(true);
    toast.success(`✅ ${plan?.name || 'Plan'} activated! You can now download your resume.`);

    if (onSuccess) {
      onSuccess();
    }

    setTimeout(() => {
      onClose();
      setSuccess(false);
      setProcessing(false);
    }, 2000);

  } catch (error: any) {
    console.error('Payment processing error:', error);
    setPaymentError(error.message || 'Payment processing failed. Please try again.');
    toast.error(error.message || 'Payment failed. Please try again.');
    setProcessing(false);
  }
};

  // ============================================
  // HANDLE STRIPE PAYMENT
  // ============================================
const handleStripePayment = async () => {
  if (!user) {
    toast.error('User not found. Please login again.');
    return;
  }

  setProcessing(true);
  setPaymentError(null);

  try {
    // Simulate Stripe payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

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

    const now = new Date();
    let endDate = new Date();
    let amount = plan?.price || 0;
    
    switch (plan?.duration) {
      case 'trial':
        endDate.setDate(now.getDate() + 14);
        amount = 1;
        break;
      case 'monthly':
        endDate.setMonth(now.getMonth() + 1);
        amount = 14.99;
        break;
      case 'yearly':
        endDate.setFullYear(now.getFullYear() + 1);
        amount = 89.99;
        break;
      default:
        endDate.setDate(now.getDate() + 14);
        amount = 1;
    }

    const subscription = {
      plan: plan?.duration || 'trial',
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      paymentMethod: 'stripe' as const,
      status: 'active' as const,
      amount: amount,
      currency: 'USD',
      autoRenew: plan?.duration !== 'trial',
      paymentId: paymentDetails.transactionId,
      isPaid: true, // ✅ MAKE SURE THIS IS SET TO true
    };

    updateSubscription(subscription);

    try {
      await databaseService.savePayment(user.id, paymentDetails);
      await authService.updateSubscription(user.id, subscription);
      console.log('✅ Payment and subscription saved to Firebase', subscription);
    } catch (firebaseError) {
      console.warn('Firebase save failed, but local state is updated:', firebaseError);
    }

    setSuccess(true);
    toast.success(`✅ ${plan?.name || 'Plan'} activated! You can now download your resume.`);

    if (onSuccess) {
      onSuccess();
    }

    setTimeout(() => {
      onClose();
      setSuccess(false);
      setProcessing(false);
    }, 2000);

  } catch (error: any) {
    console.error('Stripe payment error:', error);
    setPaymentError(error.message || 'Payment failed. Please try again.');
    toast.error(error.message || 'Payment failed. Please try again.');
    setProcessing(false);
  }
};

  if (!plan) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={success ? '🎉 Payment Successful!' : isTrial ? '🚀 Start Your 14-Day Trial' : 'Complete Your Purchase'}
      size="md"
      showCloseButton={!processing && !success}
      closeOnOverlay={!processing && !success}
    >
      {success ? (
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isTrial ? 'bg-green-100' : 'bg-green-100'
            }`}
          >
            <MdCheckCircle className={`w-10 h-10 ${isTrial ? 'text-green-600' : 'text-green-600'}`} />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isTrial ? '🎉 Trial Activated!' : 'Thank You!'}
          </h3>
          <p className="text-gray-500">
            {isTrial 
              ? 'Your 14-day trial is now active!'
              : `Your <span className="font-semibold">${plan.name}</span> subscription is now active.`
            }
          </p>
          <p className="text-sm text-green-600 mt-2">
            ✅ You can now download your resume from the builder!
          </p>
          <button
            onClick={() => {
              onClose();
              setSuccess(false);
            }}
            className="mt-4 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Builder
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ✅ TRIAL-SPECIFIC BANNER */}
          {isTrial ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MdRocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-green-800">🚀 14-Day Trial</p>
                  <p className="text-sm text-green-700">
                    Pay just <span className="font-bold text-xl">$1</span> for full access to download your resume
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    ✅ No auto-renewal • Cancel anytime • Full features included
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <MdDownload className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    🔓 Unlock resume downloads
                  </p>
                  <p className="text-xs text-blue-600">
                    Subscribe to download your resume in PDF, DOCX, or TXT format
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className={`rounded-xl p-4 ${isTrial ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h4>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">{plan.name} Plan</span>
              <span className={`text-sm font-medium ${isTrial ? 'text-green-600' : 'text-gray-900'}`}>
                ${plan.price}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Duration</span>
              <span className="capitalize">{plan.duration === 'trial' ? '14 Days' : plan.duration}</span>
            </div>
            {isTrial && (
              <div className="flex justify-between items-center text-sm text-green-600 mt-1">
                <span>💡 Savings</span>
                <span className="font-medium">Full 14-day access</span>
              </div>
            )}
            <div className={`border-t pt-2 mt-2 flex justify-between items-center ${
              isTrial ? 'border-green-200' : 'border-gray-200'
            }`}>
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className={`text-lg font-bold ${isTrial ? 'text-green-600' : 'text-gray-900'}`}>
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

          {/* Error Message */}
          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600">{paymentError}</p>
            </div>
          )}

          {/* PayPal Button Container */}
{paymentMethod === 'paypal' && (
  <div className="min-h-[200px] flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
    <p className="text-sm text-gray-500 mb-4 text-center">
      {isTrial 
        ? 'Pay $1 with PayPal to start your 14-day trial'
        : 'You will be redirected to PayPal to complete your payment.'
      }
    </p>
    
    {/* ✅ CRITICAL FIX: Explicit width and min-width */}
    <div 
      id={containerId}
      className="w-full"
      style={{ 
        width: '100%', 
        minWidth: '300px',
        maxWidth: '400px',
        margin: '0 auto'
      }}
    />
    
    <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
      <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
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
                className={`w-full py-3 px-6 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  isTrial 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-[#635bff] hover:bg-[#4f46e5]'
                }`}
              >
                {processing ? (
                  <>
                    <Loading type="spinner" size="sm" />
                    Processing...
                  </>
                ) : (
                  <>
                    <MdLock className="w-4 h-4" />
                    {isTrial ? 'Pay $1 with Stripe' : `Pay $${plan.price} with Stripe`}
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

          {/* ✅ Trial-specific footer note */}
          {isTrial && (
            <div className="text-center text-xs text-gray-400 border-t border-gray-100 pt-3">
              💡 Your payment of $1 gives you full access for 14 days. No auto-renewal.
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default PaymentModal;
