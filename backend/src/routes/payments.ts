// RAZORPAY ROUTES COMMENTED OUT - Using manual payment verification
// Uncomment when Razorpay is approved

import { Router } from 'express';

const router = Router();

// All Razorpay payment routes have been disabled
// Currently using manual payment verification with screenshot upload
// See: frontend/src/components/booking/CheckoutModal.tsx

// When Razorpay is approved, uncomment the following:
/*
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

router.post('/create-order', authenticate, async (req, res) => {
    // Create Razorpay order logic
});

router.post('/verify-payment', authenticate, async (req, res) => {
    // Verify Razorpay payment signature logic
});

router.get('/payment/:paymentId', authenticate, async (req, res) => {
    // Fetch payment details logic
});

router.post('/refund', authenticate, async (req, res) => {
    // Process refund logic
});
*/

export default router;
