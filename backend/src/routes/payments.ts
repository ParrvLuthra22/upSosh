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
        dodo = new DodoPayments({
            bearerToken: apiKey,
            environment: process.env.NODE_ENV === 'production' ? 'live_mode' : 'test_mode',
        });
    }
    return dodo;
}

// Product ID for event tickets
const DODO_PRODUCT_ID = process.env.DODO_PRODUCT_ID || '';

// Create a checkout session for payment
router.post('/create-checkout', async (req: Request, res: Response): Promise<any> => {
    try {
        const { items, customer, returnUrl } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items provided' });
        }
        
        if (!customer || !customer.email) {
            return res.status(400).json({ error: 'Customer email is required' });
        }

        // Calculate total quantity
        const totalQuantity = items.reduce((sum: number, item: any) => sum + item.qty, 0);

        // Create checkout session with Dodo Payments
        const client = getDodoClient();
        const session = await client.checkoutSessions.create({
            billing_address: {
                country: 'IN', // India
                city: customer.city || null,
                state: customer.state || null,
                street: customer.address || null,
                zipcode: customer.zipcode || null,
            },
            customer: {
                email: customer.email,
                name: customer.name || 'Guest',
            },
            return_url: returnUrl || `${process.env.FRONTEND_URL || 'https://www.upsosh.app'}/booking/confirmation`,
            product_cart: [{
                product_id: DODO_PRODUCT_ID,
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
        console.error('Dodo Payments error:', error);
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
