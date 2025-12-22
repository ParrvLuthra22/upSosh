// DODO PAYMENTS INTEGRATION
// Documentation: https://docs.dodopayments.com

import { Router, Request, Response } from 'express';
import DodoPayments from 'dodopayments';

const router = Router();

// Initialize Dodo Payments client
const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY || '',
    environment: process.env.NODE_ENV === 'production' ? 'live_mode' : 'test_mode',
});

// Create a checkout session for payment
router.post('/create-checkout', async (req: Request, res: Response): Promise<any> => {
    try {
        const { items, customer, returnUrl, metadata } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items provided' });
        }
        
        if (!customer || !customer.email) {
            return res.status(400).json({ error: 'Customer email is required' });
        }

        // Calculate total amount in cents (Dodo uses cents)
        const totalAmount = items.reduce((sum: number, item: any) => {
            return sum + (item.price * item.qty * 100); // Convert to cents
        }, 0);

        // Create checkout session with Dodo Payments
        const session = await dodo.checkoutSessions.create({
            billing: {
                city: customer.city || 'Delhi',
                country: 'IN', // India
                state: customer.state || 'Delhi',
                street: customer.address || 'N/A',
                zipcode: parseInt(customer.zipcode) || 110001,
            },
            customer: {
                email: customer.email,
                name: customer.name || 'Guest',
            },
            payment_link: true,
            return_url: returnUrl || `${process.env.FRONTEND_URL || 'https://www.upsosh.app'}/booking/confirmation`,
            metadata: {
                source: 'upsosh',
                items: JSON.stringify(items.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    qty: item.qty,
                    price: item.price
                }))),
                ...metadata
            },
            // For dynamic pricing, we'll use a flexible product
            product_cart: items.map((item: any) => ({
                product_id: process.env.DODO_PRODUCT_ID || 'prod_event_ticket', // Default product ID
                quantity: item.qty,
            })),
        });

        console.log('Dodo checkout session created:', session.checkout_url);

        res.json({
            success: true,
            checkoutUrl: session.checkout_url,
            sessionId: session.checkout_session_id,
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
        const { Webhook } = await import('standardwebhooks');
        const webhook = new Webhook(process.env.DODO_WEBHOOK_SECRET || '');
        
        const webhookId = req.headers['webhook-id'] as string;
        const webhookSignature = req.headers['webhook-signature'] as string;
        const webhookTimestamp = req.headers['webhook-timestamp'] as string;
        
        const rawBody = JSON.stringify(req.body);
        
        // Verify webhook signature
        const isValid = webhook.verify(rawBody, {
            'webhook-id': webhookId,
            'webhook-signature': webhookSignature,
            'webhook-timestamp': webhookTimestamp,
        });
        
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid webhook signature' });
        }
        
        const payload = req.body;
        
        // Handle different webhook events
        switch (payload.type) {
            case 'payment.succeeded':
                console.log('Payment succeeded:', payload.data.payment_id);
                // Update booking status in database
                // You can add your business logic here
                break;
                
            case 'payment.failed':
                console.log('Payment failed:', payload.data.payment_id);
                break;
                
            case 'payment.refunded':
                console.log('Payment refunded:', payload.data.payment_id);
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
        
        const payment = await dodo.payments.retrieve(paymentId);
        
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
