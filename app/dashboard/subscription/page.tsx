'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthContext';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  maxTvs: number;
  maxCarousels: number;
}

interface UserSubscription {
  planId: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // In a real app, this would fetch from Firestore
        // For this demo, we'll create mock data
        
        setTimeout(() => {
          // Mock subscription plans
          const plans: SubscriptionPlan[] = [
            {
              id: 'basic',
              name: 'Basic',
              price: 49,
              features: [
                'Up to 2 TVs',
                '5 Ad Carousels',
                'Basic Analytics',
                'Email Support',
              ],
              maxTvs: 2,
              maxCarousels: 5,
            },
            {
              id: 'business',
              name: 'Business',
              price: 99,
              features: [
                'Up to 10 TVs',
                '20 Ad Carousels',
                'Advanced Analytics',
                'Priority Support',
                'Custom Branding',
              ],
              maxTvs: 10,
              maxCarousels: 20,
            },
            {
              id: 'enterprise',
              name: 'Enterprise',
              price: 199,
              features: [
                'Unlimited TVs',
                'Unlimited Ad Carousels',
                'Premium Analytics',
                'Dedicated Support',
                'Custom Branding',
                'API Access',
              ],
              maxTvs: 999, // Unlimited
              maxCarousels: 999, // Unlimited
            },
          ];
          
          // Mock user subscription
          const userSubscription: UserSubscription = {
            planId: 'business',
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            cancelAtPeriodEnd: false,
          };
          
          setAvailablePlans(plans);
          setSubscription(userSubscription);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        setLoading(false);
      }
    };
    
    fetchSubscriptionData();
  }, [user]);
  
  // Get current plan details
  const getCurrentPlan = () => {
    if (!subscription) return null;
    return availablePlans.find(plan => plan.id === subscription.planId) || null;
  };
  
  // Handle plan change
  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    setShowUpgradeModal(true);
  };
  
  // Upgrade subscription
  const handleUpgradeSubscription = async () => {
    if (!user || !selectedPlanId) return;
    
    try {
      setProcessingAction(true);
      
      // In a real app, this would update the subscription in Stripe and Firestore
      // For this demo, we'll just update the local state
      
      setTimeout(() => {
        setSubscription(prev => {
          if (!prev) return null;
          return {
            ...prev,
            planId: selectedPlanId,
            cancelAtPeriodEnd: false,
          };
        });
        
        setShowUpgradeModal(false);
        setSelectedPlanId(null);
        setProcessingAction(false);
        setMessage({
          text: 'Your subscription has been updated successfully!',
          type: 'success',
        });
      }, 1500);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      setProcessingAction(false);
      setMessage({
        text: 'Failed to update subscription. Please try again or contact support.',
        type: 'error',
      });
    }
  };
  
  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;
    
    try {
      setProcessingAction(true);
      
      // In a real app, this would update the subscription in Stripe and Firestore
      // For this demo, we'll just update the local state
      
      setTimeout(() => {
        setSubscription(prev => {
          if (!prev) return null;
          return {
            ...prev,
            cancelAtPeriodEnd: true,
          };
        });
        
        setShowCancelModal(false);
        setProcessingAction(false);
        setMessage({
          text: 'Your subscription has been set to cancel at the end of the current billing period.',
          type: 'success',
        });
      }, 1500);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setProcessingAction(false);
      setMessage({
        text: 'Failed to cancel subscription. Please try again or contact support.',
        type: 'error',
      });
    }
  };
  
  // Handle resume subscription
  const handleResumeSubscription = async () => {
    if (!user || !subscription) return;
    
    try {
      setProcessingAction(true);
      
      // In a real app, this would update the subscription in Stripe and Firestore
      // For this demo, we'll just update the local state
      
      setTimeout(() => {
        setSubscription(prev => {
          if (!prev) return null;
          return {
            ...prev,
            cancelAtPeriodEnd: false,
          };
        });
        
        setProcessingAction(false);
        setMessage({
          text: 'Your subscription has been resumed successfully!',
          type: 'success',
        });
      }, 1500);
    } catch (error) {
      console.error('Error resuming subscription:', error);
      setProcessingAction(false);
      setMessage({
        text: 'Failed to resume subscription. Please try again or contact support.',
        type: 'error',
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  const currentPlan = getCurrentPlan();
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscription Management</h1>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      {/* Current Subscription */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium text-gray-900">Current Subscription</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your current subscription plan and billing.
          </p>
        </div>
        
        <div className="p-6">
          {subscription ? (
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{currentPlan?.name} Plan</h3>
                  <p className="text-gray-600 mt-1">${currentPlan?.price}/month</p>
                  
                  <div className="mt-4">
                    <div className="flex items-center">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subscription.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : subscription.status === 'past_due' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {subscription.status === 'active' ? 'Active' : subscription.status === 'past_due' ? 'Past Due' : 'Canceled'}
                      </span>
                      
                      {subscription.cancelAtPeriodEnd && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Cancels on {subscription.currentPeriodEnd.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-2">
                      Current period ends on {subscription.currentPeriodEnd.toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Plan Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {currentPlan?.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  {subscription.cancelAtPeriodEnd ? (
                    <button
                      onClick={handleResumeSubscription}
                      disabled={processingAction}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {processingAction ? 'Processing...' : 'Resume Subscription'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      disabled={processingAction}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Payment Method:</h4>
                <div className="flex items-center">
                  <div className="bg-gray-100 rounded p-2 mr-3">
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900">Visa ending in 4242</p>
                    <p className="text-sm text-gray-500">Expires 12/2025</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                    Update Payment Method
                  </button>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Billing History:</h4>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600">View your billing history and download invoices</p>
                  <button className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm">
                    View Billing History
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">You don't have an active subscription.</p>
              <button
                onClick={() => {
                  setSelectedPlanId('basic');
                  setShowUpgradeModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Choose a Plan
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Available Plans */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium text-gray-900">Available Plans</h2>
          <p className="mt-1 text-sm text-gray-500">
            Compare plans and choose the one that best fits your needs.
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availablePlans.map((plan) => (
              <div 
                key={plan.id} 
                className={`rounded-lg border ${plan.id === subscription?.planId ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'} p-6 flex flex-col`}
              >
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  {plan.id === subscription?.planId ? (
                    <button
                      disabled
                      className="w-full px-4 py-2 bg-indigo-100 text-indigo-800 rounded-md font-medium"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePlanChange(plan.id)}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      {subscription ? 'Change Plan' : 'Select Plan'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Change Plan Modal */}
      {showUpgradeModal && selectedPlanId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {subscription ? 'Change Subscription Plan' : 'Confirm Subscription'}
              </h3>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  setSelectedPlanId(null);
                }}
                disabled={processingAction}
                className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                {subscription 
                  ? `You are about to change your subscription from ${currentPlan?.name} to ${availablePlans.find(p => p.id === selectedPlanId)?.name}.` 
                  : `You are about to subscribe to the ${availablePlans.find(p => p.id === selectedPlanId)?.name} plan.`
                }
              </p>
              <p className="mt-2 text-gray-700">
                Your card will be charged ${availablePlans.find(p => p.id === selectedPlanId)?.price} per month.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowUpgradeModal(false);
                  setSelectedPlanId(null);
                }}
                disabled={processingAction}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpgradeSubscription}
                disabled={processingAction}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {processingAction ? 'Processing...' : subscription ? 'Confirm Change' : 'Subscribe'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Cancel Subscription</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={processingAction}
                className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to cancel your subscription? Your subscription will remain active until the end of the current billing period.
              </p>
              <p className="mt-4 text-gray-700">
                Your subscription will end on <span className="font-semibold">{subscription?.currentPeriodEnd.toLocaleDateString()}</span>.
              </p>
              <p className="mt-4 text-gray-700">
                You'll lose access to:
              </p>
              <ul className="mt-2 space-y-1 text-gray-700">
                {currentPlan?.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={processingAction}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Keep Subscription
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={processingAction}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {processingAction ? 'Processing...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
