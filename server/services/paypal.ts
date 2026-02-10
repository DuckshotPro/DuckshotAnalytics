/**
 * PayPal Service
 * 
 * Handles PayPal subscription billing using PayPal REST API.
 * Uses the new @paypal/paypal-server-sdk (replaces deprecated checkout-server-sdk)
 */

import paypalSDK from '@paypal/paypal-server-sdk';

const {
    Client,
    Environment,
    OrdersController,
    PaymentsController,
    LogLevel,
} = paypalSDK;

// Initialize PayPal client
function getPayPalClient() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const mode = process.env.PAYPAL_MODE || 'sandbox';

    if (!clientId || !clientSecret) {
        console.warn('[PayPal] PayPal credentials not set. Subscription features will be disabled.');
        return null;
    }

    const environment = mode === 'live' ? Environment.Production : Environment.Sandbox;

    const client = new Client({
        clientCredentialsAuthCredentials: {
            oAuthClientId: clientId,
            oAuthClientSecret: clientSecret,
        },
        timeout: 0,
        environment,
        logging: {
            logLevel: LogLevel.Info,
            logRequest: { logBody: true },
            logResponse: { logHeaders: true },
        },
    });

    return client;
}

/**
 * Create a PayPal order for subscription payment
 * @param {string} planId - PayPal plan ID (monthly or yearly)
 * @param {object} user - User object
 * @param {string} returnUrl - Success return URL
 * @param {string} cancelUrl - Cancel return URL
 * @returns {Promise<object>} Order creation response with approval URL
 */
export async function createSubscription(
    planId: string,
    user: any,
    returnUrl: string = '',
    cancelUrl: string = ''
) {
    const client = getPayPalClient();
    if (!client) {
        throw new Error('PayPal client not configured');
    }

    const ordersController = new OrdersController(client);

    // Determine amount based on plan ID
    const amount = planId.includes('monthly') ? '19.99' : '191.90';

    const collect = {
        body: {
            intent: 'CAPTURE' as any,
            purchaseUnits: [
                {
                    referenceId: `user_${user.id}`,
                    customId: `${user.id}`,
                    description: 'DuckShot Analytics Premium Subscription',
                    amount: {
                        currencyCode: 'USD',
                        value: amount,
                    },
                },
            ],
            applicationContext: {
                returnUrl: returnUrl || `${process.env.APP_URL}/subscription/success`,
                cancelUrl: cancelUrl || `${process.env.APP_URL}/pricing`,
                userAction: 'PAY_NOW' as any,
                shippingPreference: 'NO_SHIPPING' as any,
            },
        },
    };

    try {
        const { result, ...httpResponse } = await ordersController.ordersCreate(collect);

        // Extract approval URL
        const approvalUrl = result.links?.find(
            (link: any) => link.rel === 'approve'
        )?.href;

        return {
            subscriptionId: result.id,
            approvalUrl,
            status: result.status,
        };
    } catch (error) {
        console.error('[PayPal] Error creating order:', error);
        throw new Error('Failed to create PayPal order');
    }
}

/**
 * Cancel a PayPal subscription
 * Note: For actual implementation, you'd use the Subscriptions API
 */
export async function cancelSubscription(subscriptionId: string, reason: string = 'User requested') {
    console.log(`[PayPal] Cancelling subscription ${subscriptionId}. Reason: ${reason}`);
    // In production, implement actual cancellation via PayPal Subscriptions API
    return Promise.resolve();
}

/**
 * Verify PayPal webhook signature
 */
export async function verifyWebhookSignature(webhookEvent: any, headers: any): Promise<boolean> {
    console.log('[PayPal] Webhook received:', webhookEvent.event_type);
    // Implement webhook signature verification using PayPal SDK
    return true;
}

/**
 * Handle PayPal webhook events
 */
export async function handleWebhookEvent(event: any) {
    const eventType = event.event_type;
    const resource = event.resource;

    console.log(`[PayPal] Processing webhook event: ${eventType}`);

    switch (eventType) {
        case 'PAYMENT.CAPTURE.COMPLETED':
        case 'CHECKOUT.ORDER.APPROVED':
            return {
                action: 'activate_subscription',
                userId: resource.custom_id || resource.payer?.payer_id,
                orderId: resource.id,
                status: 'premium',
            };

        case 'PAYMENT.CAPTURE.DENIED':
        case 'CHECKOUT.ORDER.VOIDED':
            return {
                action: 'cancel_subscription',
                userId: resource.custom_id,
                orderId: resource.id,
                status: 'free',
            };

        default:
            console.log(`[PayPal] Unhandled event type: ${eventType}`);
            return { action: 'ignored', eventType };
    }
}

export default {
    createSubscription,
    cancelSubscription,
    verifyWebhookSignature,
    handleWebhookEvent,
};
