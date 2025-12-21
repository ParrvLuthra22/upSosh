# Razorpay Payment Gateway Integration Guide

## Setup Instructions

### 1. Create Razorpay Account
1. Go to https://razorpay.com/
2. Click "Sign Up" and create an account
3. Complete KYC verification (for production use)

### 2. Get API Keys
1. Login to Razorpay Dashboard: https://dashboard.razorpay.com/
2. Navigate to Settings > API Keys
3. Generate Test/Live API Keys
4. Copy both:
   - Key ID (starts with `rzp_test_` or `rzp_live_`)
   - Key Secret

### 3. Configure Backend

Add to your Railway environment variables:

```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

Or in local `.env` file:
```bash
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_secret_key_here"
```

### 4. Test Mode vs Live Mode

**Test Mode (Development):**
- Keys start with `rzp_test_`
- No actual money is charged
- Use test cards from: https://razorpay.com/docs/payments/payments/test-card-upi-details/

**Live Mode (Production):**
- Keys start with `rzp_live_`
- Real transactions
- Requires completed KYC

### 5. Payment Flow

1. User fills checkout form
2. Frontend calls `/api/payments/create-order` with amount
3. Backend creates Razorpay order
4. Razorpay payment modal opens on frontend
5. User completes payment
6. Razorpay sends payment data to frontend handler
7. Frontend calls `/api/payments/verify-payment` with signature
8. Backend verifies payment authenticity
9. Booking is created and confirmed

### 6. Payment Methods Supported

- Credit/Debit Cards (Visa, Mastercard, Amex, Rupay)
- UPI (Google Pay, PhonePe, Paytm, etc.)
- Net Banking
- Wallets (Paytm, PhonePe, Mobikwik, etc.)
- EMI options

### 7. Test Cards for Development

**Successful Payment:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Failed Payment:**
- Card: 4000 0000 0000 0002
- CVV: Any 3 digits
- Expiry: Any future date

### 8. Webhooks (Optional but Recommended)

For production, set up webhooks to handle:
- Payment success
- Payment failure
- Refund processing

Webhook URL: `https://your-backend.railway.app/api/payments/webhook`

### 9. Security Features

✅ Payment signature verification
✅ HTTPS required
✅ API keys stored in environment variables
✅ Amount verification on backend
✅ User authentication required

### 10. Currency Support

Default: INR (Indian Rupees)
Supports: 100+ currencies including USD, EUR, GBP, etc.

### 11. Fees

- 2% transaction fee on Indian cards
- 3% on international cards
- No setup fees
- No annual maintenance charges

### 12. Dashboard Features

- Real-time transaction monitoring
- Refund management
- Settlement reports
- Customer disputes
- Analytics and insights

### 13. Going Live Checklist

- [ ] Complete KYC verification
- [ ] Switch to live API keys
- [ ] Test with real card (small amount)
- [ ] Set up webhooks
- [ ] Configure auto-settlements
- [ ] Add refund policy
- [ ] Test error scenarios
- [ ] Monitor first few transactions

### 14. Support

- Documentation: https://razorpay.com/docs/
- Support: support@razorpay.com
- Phone: 1800-120-020120

### 15. Important Notes

⚠️ Never commit API keys to git
⚠️ Always verify payments on backend
⚠️ Use HTTPS in production
⚠️ Keep Razorpay SDK updated
⚠️ Handle payment failures gracefully
⚠️ Store payment IDs for reference
⚠️ Test refund flow before going live
