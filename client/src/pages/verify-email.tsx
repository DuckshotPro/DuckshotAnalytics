/**
 * Email Verification Page
 * 
 * This page is shown when users click the verification link in their email.
 * It calls the backend API to verify the token and shows success/error messages.
 */

import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
    const params = useParams<{ token?: string }>();
    const [, setLocation] = useLocation();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [tokenToVerify, setTokenToVerify] = useState<string | null>(null);

    // Get token from URL params or wait for POST
    useEffect(() => {
        // Check if we have a token from URL parameter (for manual navigation)
        const urlToken = params.token;
        if (urlToken) {
            setTokenToVerify(urlToken);
        }
    }, [params.token]);

    useEffect(() => {
        const verifyEmail = async () => {
            if (!tokenToVerify) {
                // Wait for token from form submission
                return;
            }

            try {
                const response = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: tokenToVerify }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setStatus('success');
                    setMessage('Your email has been verified successfully!');
                    // Redirect to login after 3 seconds
                    setTimeout(() => setLocation('/auth'), 3000);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Failed to verify email. The link may have expired.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('An error occurred while verifying your email. Please try again.');
                console.error('Verification error:', error);
            }
        };

        verifyEmail();
    }, [tokenToVerify, setLocation]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
                <div className="text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        {status === 'loading' && (
                            <Loader2 className="h-16 w-16 text-primary animate-spin" />
                        )}
                        {status === 'success' && (
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        )}
                        {status === 'error' && (
                            <XCircle className="h-16 w-16 text-red-500" />
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold mb-4">
                        {status === 'loading' && 'Verifying Your Email...'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'error' && 'Verification Failed'}
                    </h1>

                    {/* Message */}
                    <p className="text-gray-600 mb-6">{message}</p>

                    {/* Actions */}
                    <div className="space-y-3">
                        {status === 'success' && (
                            <p className="text-sm text-gray-500">
                                Redirecting you to login in a few seconds...
                            </p>
                        )}

                        {status === 'error' && (
                            <div className="space-y-3">
                                <Button
                                    onClick={() => setLocation('/auth')}
                                    className="w-full"
                                >
                                    Go to Login
                                </Button>
                                <Button
                                    onClick={() => setLocation('/')}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Return Home
                                </Button>
                                <p className="text-sm text-gray-500">
                                    Need a new verification link? Log in and request a new one from your dashboard.
                                </p>
                            </div>
                        )}

                        {status === 'loading' && (
                            <Button
                                onClick={() => setLocation('/')}
                                variant="outline"
                                className="w-full"
                            >
                                Return Home
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
