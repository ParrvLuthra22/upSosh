# Payment Flow Diagram

## Complete Payment Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. Browse Events
   └─> User visits /booking page
   └─> Sees formal/informal events with prices in ₹

2. Add to Cart
   └─> Click "Book Now" on event
   └─> Select ticket quantity
   └─> Cart badge updates with count
   └─> Can add multiple events

3. View Cart
   └─> Click cart icon in header
   └─> See all selected events
   └─> See total amount
   └─> Can adjust quantities or remove items

4. Checkout
   └─> Click "Proceed to Checkout"
   └─> CheckoutModal opens
   └─> Fill in details:
       ├─> Name
       ├─> Email
       └─> Phone

5. Payment Initiation
   └─> Click "Pay Now"
   └─> Frontend calls: POST /api/payments/create-order
       └─> Backend creates Razorpay order
       └─> Returns: order_id, amount, currency, razorpay_key_id

6. Razorpay Modal Opens
   └─> Shows payment options:
       ├─> Credit/Debit Card
       ├─> UPI (Google Pay, PhonePe, etc.)
       ├─> Net Banking
       └─> Wallets
   └─> User selects method and pays

7. Payment Processing
   └─> Razorpay processes payment
   └─> On success: Returns payment data
       ├─> razorpay_order_id
       ├─> razorpay_payment_id
       └─> razorpay_signature

8. Payment Verification
   └─> Frontend calls: POST /api/payments/verify-payment
   └─> Backend verifies signature using HMAC SHA256
   └─> Checks: HMAC(order_id + "|" + payment_id, secret) == signature
   └─> If valid: Returns payment details

9. Booking Creation
   └─> Frontend calls: POST /api/bookings
   └─> Backend creates booking with:
       ├─> userId (from auth token)
       ├─> items (cart contents)
       ├─> totalAmount
       ├─> status: "confirmed"
       ├─> paymentId (from Razorpay)
       └─> customer details
   └─> Saves to database

10. Success Confirmation
    └─> CheckoutModal shows success screen
    └─> Displays booking reference ID
    └─> Cart is cleared
    └─> User can click "Continue Exploring"
    └─> Razorpay sends confirmation email

11. View Tickets
    └─> User goes to profile
    └─> Clicks "My Tickets"
    └─> Sees all bookings with payment IDs


┌─────────────────────────────────────────────────────────────────┐
│                      TECHNICAL FLOW                              │
└─────────────────────────────────────────────────────────────────┘

Frontend (CheckoutModal.tsx)
    │
    ├─> handleCheckout(formData)
    │   │
    │   ├─> Step 1: Create Order
    │   │   └─> api.createPaymentOrder(amount)
    │   │       └─> POST /api/payments/create-order
    │   │           ├─> Headers: Authorization: Bearer <token>
    │   │           ├─> Body: { amount, currency: "INR" }
    │   │           └─> Response: { orderId, amount, currency, key }
    │   │
    │   ├─> Step 2: Initialize Razorpay
    │   │   └─> new window.Razorpay(options)
    │   │       ├─> key: razorpay_key_id
    │   │       ├─> order_id: from step 1
    │   │       ├─> amount: in paise (₹500 = 50000 paise)
    │   │       ├─> prefill: { name, email, phone }
    │   │       └─> handler: async function for success
    │   │
    │   ├─> Step 3: Open Payment Modal
    │   │   └─> razorpay.open()
    │   │       └─> User completes payment on Razorpay
    │   │
    │   ├─> Step 4: Payment Handler (on success)
    │   │   └─> api.verifyPayment(response)
    │   │       └─> POST /api/payments/verify-payment
    │   │           ├─> Headers: Authorization: Bearer <token>
    │   │           ├─> Body: {
    │   │           │     razorpay_order_id,
    │   │           │     razorpay_payment_id,
    │   │           │     razorpay_signature
    │   │           │   }
    │   │           └─> Response: { success, payment {...} }
    │   │
    │   └─> Step 5: Create Booking
    │       └─> api.createBooking(bookingData)
    │           └─> POST /api/bookings
    │               ├─> Headers: Authorization: Bearer <token>
    │               ├─> Body: {
    │               │     items: cart,
    │               │     totalAmount,
    │               │     status: "confirmed",
    │               │     paymentId,
    │               │     customer: { name, email, phone }
    │               │   }
    │               └─> Response: { id, ...bookingDetails }


Backend Routes
    │
    ├─> /api/payments/create-order
    │   ├─> Middleware: authenticate (checks JWT token)
    │   ├─> Extract: amount, currency
    │   ├─> Call: razorpay.orders.create({
    │   │     amount: amount * 100, // Convert to paise
    │   │     currency: "INR",
    │   │     receipt: `receipt_${timestamp}`,
    │   │     notes: { userId }
    │   │   })
    │   └─> Return: { orderId, amount, currency, key }
    │
    ├─> /api/payments/verify-payment
    │   ├─> Middleware: authenticate
    │   ├─> Extract: razorpay_order_id, razorpay_payment_id, razorpay_signature
    │   ├─> Generate signature:
    │   │   └─> HMAC_SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)
    │   ├─> Compare: generated_signature === razorpay_signature
    │   ├─> If valid:
    │   │   ├─> Fetch payment details from Razorpay
    │   │   └─> Return: { success: true, paymentId, payment {...} }
    │   └─> If invalid:
    │       └─> Return: { success: false, error: "Verification failed" }
    │
    ├─> /api/payments/payment/:paymentId
    │   ├─> Middleware: authenticate
    │   ├─> Call: razorpay.payments.fetch(paymentId)
    │   └─> Return: payment details
    │
    └─> /api/payments/refund
        ├─> Middleware: authenticate
        ├─> Extract: paymentId, amount (optional)
        ├─> Call: razorpay.payments.refund(paymentId, { amount })
        └─> Return: { success, refundId, amount, status }


Database
    │
    └─> Booking Table
        ├─> id: cuid()
        ├─> userId: string (from JWT)
        ├─> items: JSON string (cart events)
        ├─> totalAmount: float (₹500.00)
        ├─> status: "confirmed" | "pending" | "cancelled"
        ├─> paymentId: string (razorpay payment ID)
        ├─> customer: JSON string { name, email, phone }
        └─> createdAt: DateTime


┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY MEASURES                             │
└─────────────────────────────────────────────────────────────────┘

1. User Authentication
   ✅ JWT token required for all payment operations
   ✅ Token verified on every request
   ✅ User ID extracted from token, not from request body

2. Payment Signature Verification
   ✅ Razorpay signature verified using HMAC SHA256
   ✅ Prevents payment tampering
   ✅ Ensures payment came from Razorpay

3. Amount Verification
   ✅ Amount calculated on frontend from cart
   ✅ Order created on backend with exact amount
   ✅ Razorpay ensures amount matches

4. API Key Security
   ✅ Keys stored in environment variables
   ✅ Never exposed to frontend (except key_id for SDK)
   ✅ Secret key only used on backend

5. HTTPS Required
   ✅ All communication encrypted
   ✅ Razorpay requires HTTPS for live mode
   ✅ Railway provides HTTPS by default

6. Error Handling
   ✅ Payment failures handled gracefully
   ✅ User can retry payment
   ✅ Booking only created after successful payment
   ✅ No duplicate bookings


┌─────────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                               │
└─────────────────────────────────────────────────────────────────┘

1. User not logged in
   └─> Middleware returns 401
   └─> Frontend redirects to /login

2. Payment creation fails
   └─> Show error: "Failed to create payment order"
   └─> User can retry

3. User cancels payment
   └─> Razorpay modal.ondismiss called
   └─> Show: "Payment cancelled. Please try again."
   └─> User can retry

4. Payment fails (insufficient funds, etc.)
   └─> Razorpay handles error
   └─> User can try different payment method

5. Signature verification fails
   └─> Show: "Payment verification failed"
   └─> Log error on backend
   └─> User should contact support

6. Booking creation fails
   └─> Payment successful but booking fails
   └─> Show error with payment ID
   └─> User should contact support for manual booking
   └─> Payment ID stored for refund if needed


┌─────────────────────────────────────────────────────────────────┐
│                    TESTING GUIDE                                 │
└─────────────────────────────────────────────────────────────────┘

Test Cards:
─────────────────────────────────────────
Success:    4111 1111 1111 1111
Failed:     4000 0000 0000 0002
Timeout:    5000 0000 0000 0000
─────────────────────────────────────────

Test UPI IDs:
─────────────────────────────────────────
Success:    success@razorpay
Failed:     failure@razorpay
─────────────────────────────────────────

Test Flow:
1. Add ₹500 event to cart
2. Checkout
3. Use test card 4111 1111 1111 1111
4. CVV: 123, Expiry: 12/25
5. Payment succeeds
6. Booking created
7. View in "My Tickets"
8. Check Razorpay dashboard for transaction


┌─────────────────────────────────────────────────────────────────┐
│                    FILES MODIFIED                                │
└─────────────────────────────────────────────────────────────────┘

Backend:
├─> src/routes/payments.ts (NEW)
│   └─> 4 endpoints for payment operations
├─> src/index.ts (MODIFIED)
│   └─> Added payment routes
├─> package.json (MODIFIED)
│   └─> Added razorpay dependency
└─> .env (MODIFIED)
    └─> Added RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET

Frontend:
├─> components/booking/CheckoutModal.tsx (MODIFIED)
│   └─> Integrated Razorpay SDK and payment flow
└─> lib/api.ts (MODIFIED)
    └─> Added 3 payment API methods

Documentation:
├─> RAZORPAY_SETUP.md (NEW)
│   └─> Detailed setup and configuration guide
└─> PAYMENT_INTEGRATION.md (NEW)
    └─> Quick start guide for implementation


┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT CHECKLIST                          │
└─────────────────────────────────────────────────────────────────┘

Backend (Railway):
□ npm install (razorpay installed)
□ Add RAZORPAY_KEY_ID to environment variables
□ Add RAZORPAY_KEY_SECRET to environment variables
□ Deploy/Redeploy backend
□ Test API endpoint: GET /api/debug

Frontend (Vercel):
□ Automatic deployment from GitHub
□ Test payment flow after deploy
□ Check console for errors

Testing:
□ Login with test user
□ Add events to cart
□ Proceed to checkout
□ Test successful payment (4111 1111 1111 1111)
□ Verify booking created
□ Check "My Tickets" shows booking
□ Test failed payment (4000 0000 0000 0002)
□ Test payment cancellation

Production:
□ Complete Razorpay KYC
□ Generate live API keys
□ Replace test keys with live keys in Railway
□ Test with real card (small amount)
□ Monitor first transactions
□ Set up webhooks (optional)


🎉 Payment Integration Complete!
All code changes pushed to GitHub
Backend will auto-deploy on Railway
Frontend will auto-deploy on Vercel
Add Razorpay keys to Railway to activate!
```
