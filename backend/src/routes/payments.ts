// DODO PAYMENTS INTEGRATION
// Documentation: https://docs.dodopayments.com

import { Router, Request, Response } from 'express';
import DodoPayments from 'dodopayments';

const router = Router();

// Lazy initialization of Dodo Payments client to prevent startup crashes
let dodo: DodoPayments | null = null;

function getDodoClient(): DodoPayments {
    if (!dodo) {
        const apiKey = process.env.DODO_PAYMENTS_API_KEY;
        if (!apiKey) {
            throw new Error('DODO_PAYMENTS_API_KEY is not configured');
        }
        // Use test_mode or live_mode based on environment variable
        const mode = process.env.DODO_PAYMENTS_MODE === 'live' ? 'live_mode' : 'test_mode';
        dodo = new DodoPayments({
            bearerToken: apiKey,
            environment: mode,
        });
        console.log(`Dodo Payments client initialized in ${mode}`);
    }
    return dodo;
}

// Get or create a default product for event tickets
async function getOrCreateProductId(): Promise<string> {
    // If product ID is set in env, use it
    const envProductId = process.env.DODO_PRODUCT_ID;
    if (envProductId && envProductId.trim() !== '') {
        return envProductId;
    }
    
    // Otherwise, create a one-time payment link dynamically
    // For test mode, we'll use payment links instead of products
    throw new Error('DODO_PRODUCT_ID not configured. Please create a product in DodoPayments dashboard and set the product ID in environment variables.');
}

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
    const apiKeySet = !!process.env.DODO_PAYMENTS_API_KEY;
    const productIdSet = !!process.env.DODO_PRODUCT_ID && process.env.DODO_PRODUCT_ID.trim() !== '';
    const mode = process.env.DODO_PAYMENTS_MODE === 'live' ? 'live_mode' : 'test_mode';
    
    res.json({
        status: apiKeySet ? 'configured' : 'not_configured',
        mode,
        apiKeySet,
        productIdSet,
        message: !apiKeySet 
            ? 'DODO_PAYMENTS_API_KEY is not set' 
            : !productIdSet 
                ? 'DODO_PRODUCT_ID is not set - create a product in DodoPayments dashboard'
                : 'Payments are ready'
    });
});

// Create a checkout session for payment
router.post('/create-checkout', async (req: Request, res: Response): Promise<any> => {
    try {
        const { items, customer, returnUrl } = req.body;
        
        console.log('Create checkout request:', { items, customer: customer?.email, returnUrl });
        
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items provided' });
        }
        
        if (!customer || !customer.email) {
            return res.status(400).json({ error: 'Customer email is required' });
        }

        // Calculate total amount and quantity
        const totalQuantity = items.reduce((sum: number, item: any) => sum + item.qty, 0);
        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
        
        // Check if DodoPayments is properly configured
        const apiKey = process.env.DODO_PAYMENTS_API_KEY;
        const productId = process.env.DODO_PRODUCT_ID;
        
        if (!apiKey) {
            console.log('DodoPayments not configured, using manual payment flow');
            // Return a response that tells frontend to use manual payment
            return res.json({
                success: true,
                useManualPayment: true,
                message: 'Online payments are not configured. Please use manual payment.',
                totalAmount,
                totalQuantity,
            });
        }
        
        if (!productId || productId.trim() === '') {
            console.log('Product ID not set, using manual payment flow');
            return res.json({
                success: true,
                useManualPayment: true,
                message: 'Payment product not configured. Please use manual payment.',
                totalAmount,
                totalQuantity,
            });
        }

        console.log('Using product ID:', productId, 'Quantity:', totalQuantity);

        // Create checkout session with Dodo Payments
        const client = getDodoClient();
        const session = await client.checkoutSessions.create({
            billing_address: {
                country: 'IN', // India
            },
            customer: {
                email: customer.email,
                name: customer.name || 'Guest',
            },
            return_url: returnUrl || `${process.env.FRONTEND_URL || 'https://www.upsosh.app'}/booking/confirmation`,
            product_cart: [{
                product_id: productId,
                quantity: totalQuantity,
            }],
        });

        console.log('Dodo checkout session created:', session.checkout_url);

        res.json({
            success: true,
            checkoutUrl: session.checkout_url,
            sessionId: session.session_id,
        });
    } catch (error: any) {
        console.error('Dodo Payments error:', error.message);
        console.error('Full error:', JSON.stringify(error, null, 2));
        
        // If it's a configuration error, suggest manual payment
        if (error.message?.includes('not configured') || error.message?.includes('API key')) {
            return res.json({
                success: true,
                useManualPayment: true,
                message: 'Online payments temporarily unavailable. Please use manual payment.',
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to create payment session', 
            details: error.message 
        });
    }
});

// Webhook endpoint for Dodo Payments notifications
router.post('/webhook', async (req: Request, res: Response): Promise<any> => {
    try {
        const payload = req.body;
        
        // Log webhook event for debugging
        console.log('Received webhook event:', payload.type);
        
        // Handle different webhook events
        switch (payload.type) {
            case 'payment.succeeded':
                console.log('Payment succeeded:', payload.data?.payment_id);
                // Update booking status in database
                break;
                
            case 'payment.failed':
                console.log('Payment failed:', payload.data?.payment_id);
                break;
                
            case 'refund.succeeded':
                console.log('Refund succeeded:', payload.data);
                break;
                
            case 'refund.failed':
                console.log('Refund failed:', payload.data);
                break;
                
            default:
                console.log('Unhandled webhook event:', payload.type);
        }
        
        res.json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Get payment status
router.get('/status/:paymentId', async (req: Request, res: Response): Promise<any> => {
    try {
        const { paymentId } = req.params;
        
        const client = getDodoClient();
        const payment = await client.payments.retrieve(paymentId);
        
        res.json({
            success: true,
            payment: {
                id: payment.payment_id,
                status: payment.status,
                amount: payment.total_amount,
                currency: payment.currency,
            }
        });
    } catch (error: any) {
        console.error('Payment status error:', error);
        res.status(500).json({ error: 'Failed to get payment status' });
    }
});

export default router;
