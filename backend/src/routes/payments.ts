import { Router, Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth';

const router = Router();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

// Create Razorpay order
router.post('/create-order', authenticate, async (req: Request, res: Response) => {
    try {
        const { amount, currency = 'INR' } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Razorpay expects amount in smallest currency unit (paise for INR)
        const options: any = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: req.userId
            }
        };

        const order: any = await razorpay.orders.create(options);

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error: any) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({ 
            error: 'Failed to create payment order',
            message: error.message 
        });
    }
});

// Verify Razorpay payment signature
router.post('/verify-payment', authenticate, async (req: Request, res: Response) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature 
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing payment details' });
        }

        // Generate signature for verification
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body)
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Fetch payment details from Razorpay
            const payment: any = await razorpay.payments.fetch(razorpay_payment_id);

            res.json({
                success: true,
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                payment: {
                    id: payment.id,
                    amount: (payment.amount || 0) / 100, // Convert from paise to rupees
                    currency: payment.currency,
                    status: payment.status,
                    method: payment.method,
                    email: payment.email,
                    contact: payment.contact,
                    createdAt: payment.created_at
                }
            });
        } else {
            res.status(400).json({ 
                success: false, 
                error: 'Payment verification failed' 
            });
        }
    } catch (error: any) {
        console.error('Payment verification error:', error);
        res.status(500).json({ 
            error: 'Failed to verify payment',
            message: error.message 
        });
    }
});

// Fetch payment details
router.get('/payment/:paymentId', authenticate, async (req: Request, res: Response) => {
    try {
        const { paymentId } = req.params;
        const payment: any = await razorpay.payments.fetch(paymentId);

        res.json({
            id: payment.id,
            amount: (payment.amount || 0) / 100,
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            email: payment.email,
            contact: payment.contact,
            createdAt: payment.created_at
        });
    } catch (error: any) {
        console.error('Fetch payment error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch payment details',
            message: error.message 
        });
    }
});

// Refund payment (for cancellations)
router.post('/refund', authenticate, async (req: Request, res: Response) => {
    try {
        const { paymentId, amount } = req.body;

        if (!paymentId) {
            return res.status(400).json({ error: 'Payment ID is required' });
        }

        const refundOptions: any = {};
        if (amount) {
            refundOptions.amount = Math.round(amount * 100); // Convert to paise
        }

        const refund: any = await razorpay.payments.refund(paymentId, refundOptions);

        res.json({
            success: true,
            refundId: refund.id,
            amount: (refund.amount || 0) / 100,
            status: refund.status
        });
    } catch (error: any) {
        console.error('Refund error:', error);
        res.status(500).json({ 
            error: 'Failed to process refund',
            message: error.message 
        });
    }
});

export default router;
