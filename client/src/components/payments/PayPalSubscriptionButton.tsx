// @ts-nocheck
/**
 * PayPal Subscription Button Component
 * Branded for DuckSnapAnalytics with PayPal integration
 */

import { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Button } from '@/components/ui/button';
import { Loader2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayPalSubscriptionButtonProps {
    planId: string;
    billingPeriod: 'monthly' | 'yearly';
    amount: string;
    onSuccess?: (subscriptionId: string) => void;
    onError?: (error: any) => void;
    buttonText?: string;
    variant?: 'default' | 'premium';
}

export function PayPalSubscriptionButton({
    planId,
    billingPeriod,
    amount,
    onSuccess,
    onError,
    buttonText = 'Subscribe with PayPal',
    variant = 'premium'
}: PayPalSubscriptionButtonProps) {
    const { toast } = useToast();
    const [showPayPal, setShowPayPal] = useState(false);

    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    // Premium gradient button styling
    const buttonClass = variant === 'premium'
        ? 'w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200'
        : 'w-full';

    if (!clientId) {
        return (
            <Button disabled className={buttonClass}>
                PayPal Not Configured
            </Button>
        );
    }

    return (
        <div className="w-full">
            {!showPayPal ? (
                <Button
                    onClick={() => setShowPayPal(true)}
                    className={buttonClass}
                >
                    <Zap className="mr-2 h-5 w-5" />
                    {buttonText}
                </Button>
            ) : (
                <div className="w-full border-2 border-amber-200 rounded-lg p-4 bg-gradient-to-b from-amber-50/50 to-white">
                    <PayPalScriptProvider
                        options={{
                            clientId,
                            vault: true,
                            intent: 'subscription',
                            currency: 'USD',
                        }}
                    >
                        <PayPalButtons
                            style={{
                                layout: 'vertical',
                                color: 'gold',
                                shape: 'rect',
                                label: 'subscribe',
                                height: 45,
                            }}
                            createSubscription={(data, actions) => {
                                // If planId is provided from PayPal, use it
                                if (planId && planId.startsWith('P-')) {
                                    return actions.subscription.create({
                                        plan_id: planId as string,
                                    });
                                }

                                // Otherwise, create order through our backend
                                return fetch('/api/subscription/upgrade', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        plan: 'premium',
                                        billingPeriod,
                                    }),
                                    credentials: 'include',
                                })
                                    .then((res) => res.json())
                                    .then((order) => {
                                        if (order.subscriptionId) {
                                            return order.subscriptionId;
                                        }
                                        throw new Error('Failed to create subscription');
                                    });
                            }}
                            onApprove={(data, actions) => {
                                toast({
                                    title: 'Subscription Activated! 🎉',
                                    description: 'Welcome to DuckShot Analytics Premium!',
                                });

                                // Update subscription in database
                                return fetch('/api/subscription/activate', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        subscriptionId: data.subscriptionID,
                                    }),
                                    credentials: 'include',
                                })
                                    .then((res) => res.json())
                                    .then(() => {
                                        if (onSuccess) {
                                            onSuccess(data.subscriptionID);
                                        }
                                        // Reload to refresh user data
                                        window.location.href = '/dashboard';
                                    });
                            }}
                            onError={(err) => {
                                console.error('PayPal Error:', err);
                                toast({
                                    title: 'Payment Failed',
                                    description: 'There was an error processing your payment. Please try again.',
                                    variant: 'destructive',
                                });
                                if (onError) {
                                    onError(err);
                                }
                                setShowPayPal(false);
                            }}
                            onCancel={() => {
                                toast({
                                    title: 'Payment Cancelled',
                                    description: 'You can subscribe anytime!',
                                });
                                setShowPayPal(false);
                            }}
                        />
                    </PayPalScriptProvider>

                    <button
                        onClick={() => setShowPayPal(false)}
                        className="mt-2 text-sm text-gray-500 hover:text-gray-700 underline w-full text-center"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {showPayPal && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                    Secure payment powered by PayPal • ${amount}/{billingPeriod}
                </p>
            )}
        </div>
    );
}

export default PayPalSubscriptionButton;
