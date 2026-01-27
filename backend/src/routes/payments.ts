

import { Router, Request, Response } from 'express';
import DodoPayments from 'dodopayments';

const router = Router();

let dodo: DodoPayments | null = null;

function getDodoClient(): DodoPayments {
    if (!dodo) {
        const apiKey = process.env.DODO_PAYMENTS_API_KEY;
        if (!apiKey) {
            throw new Error('DODO_PAYMENTS_API_KEY is not configured');
        }
        
        
        const modeEnv = process.env.DODO_PAYMENTS_MODE?.toLowerCase();
        const mode = modeEnv === 'live' ? 'live_mode' : 'test_mode';
        console.log(`[DodoPayments] Initializing with mode: ${mode} (env: ${modeEnv || 'not set, defaulting to test'})`);
        dodo = new DodoPayments({
            bearerToken: apiKey,
            environment: mode,
        });
        console.log(`[DodoPayments] Client initialized successfully in ${mode}`);
    }
    return dodo;
}

async function getOrCreateProductId(): Promise<string> {
    
    const envProductId = process.env.DODO_PRODUCT_ID;
    if (envProductId && envProductId.trim() !== '') {
        return envProductId;
    }
    
    
    
    throw new Error('DODO_PRODUCT_ID not configured. Please create a product in DodoPayments dashboard and set the product ID in environment variables.');
}

router.get('/health', (req: Request, res: Response) => {
    const apiKeySet = !!process.env.DODO_PAYMENTS_API_KEY;
    const productIdSet = !!process.env.DODO_PRODUCT_ID && process.env.DODO_PRODUCT_ID.trim() !== '';
    const modeEnv = process.env.DODO_PAYMENTS_MODE?.toLowerCase();
    const mode = modeEnv === 'live' ? 'live_mode' : 'test_mode';
    
    res.json({
        status: apiKeySet ? 'configured' : 'not_configured',
        mode,
        modeEnvValue: modeEnv || 'not set (defaulting to test)',
        apiKeySet,
        apiKeyPrefix: apiKeySet ? process.env.DODO_PAYMENTS_API_KEY?.substring(0, 10) + '...' : null,
        productIdSet,
        message: !apiKeySet 
            ? 'DODO_PAYMENTS_API_KEY is not set' 
            : !productIdSet 
                ? 'DODO_PRODUCT_ID is not set - create a product in DodoPayments dashboard'
                : 'Payments are ready'
    });
});

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

        
        const totalQuantity = items.reduce((sum: number, item: any) => sum + item.qty, 0);
        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
        
        
        const apiKey = process.env.DODO_PAYMENTS_API_KEY;
        const productId = process.env.DODO_PRODUCT_ID;
        
        if (!apiKey) {
            console.log('DodoPayments not configured, using manual payment flow');
            
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

        
        const client = getDodoClient();
        const session = await client.checkoutSessions.create({
            billing_address: {
                country: 'IN', 
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

router.post('/webhook', async (req: Request, res: Response): Promise<any> => {
    try {
        const payload = req.body;
        
        
        console.log('Received webhook event:', payload.type);
        
        
        switch (payload.type) {
            case 'payment.succeeded':
                console.log('Payment succeeded:', payload.data?.payment_id);
                
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
