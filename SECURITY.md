# Security

This document narrates two real vulnerabilities found and fixed in this codebase — not hypothetical ones. Both were live, both were exploited against a running instance to confirm they were real before being fixed, and both are now guarded by a regression test that reproduces the original exploit.

---

## 1. Client-controlled payment amount

**File:** `backend/src/routes/payments.ts`

### The vulnerability

`POST /api/payments/create-order` read `amount` directly from the request body and passed it straight to `razorpay.orders.create()`:

```ts
// before
const { bookingId, amount } = req.body;
// ...
const order = await razorpay.orders.create({ amount, currency: 'INR', receipt: bookingId });
```

The booking row was already being fetched in the same handler — its real price (`booking.totalAmount`) was sitting right there — but nothing ever compared the two. The server trusted whatever number the client sent.

### The exploit

Razorpay's checkout widget reads the order amount from the order object the server created, so a modified client (or a raw `curl`/Postman request — no browser tooling needed) could request an order for `amount: 1` against a booking with `totalAmount: 5000`. Razorpay would create a real ₹0.01 order, the user would pay ₹0.01, `/verify` would check the payment *signature* (which was valid — Razorpay signs whatever order you actually created) and mark the booking paid. **A user could book any event for ₹1 regardless of its listed price**, and the signature check alone would never catch it, because the signature was never lying — the order itself was wrong.

Verified live before fixing it: injected `amount: 1` and `amount: 999999` against the same real booking and confirmed Razorpay created orders for exactly those (wrong) amounts both times.

### The fix

Deleted `amount` from the destructured request body entirely. The charge is now computed server-side from the booking row, in paise, with no path for the client to influence it:

```ts
// backend/src/routes/payments.ts
const amountInPaise = Math.round(booking.totalAmount * 100);
const order = await razorpay.orders.create({
  amount: amountInPaise,
  currency: 'INR',
  receipt: bookingId,
});
```

`booking.totalAmount` is itself computed server-side at booking-creation time (`ticketPrice + platformFee`), never accepted from the client — so there is no point in the flow where an attacker-supplied number reaches the payment amount.

### The regression test

`backend/tests/payments.test.ts` — `'ignores a client-supplied amount and charges booking.totalAmount instead'`:

```ts
const booking = await createBooking({ /* ... */ totalAmount: 5000 }); // ₹5000
ordersCreate.mockResolvedValueOnce({ id: 'order_mock_1', amount: 500000, currency: 'INR' });

await request(app)
  .post('/api/payments/create-order')
  .set(authHeader(user.id))
  .send({ bookingId: booking.id, amount: 1 }); // ← the attack

expect(ordersCreate).toHaveBeenCalledWith(
  expect.objectContaining({ amount: 500000, currency: 'INR' }), // ₹5000 in paise, not ₹0.01
);
```

The test sends the exact attack payload (`amount: 1` against a ₹5000 booking) and asserts the mocked Razorpay client was called with `500000` (the real total, in paise) regardless. If someone reintroduces `req.body.amount` into the order-creation call, this test fails immediately.

---

## 2. Cross-booking signature replay

**File:** `backend/src/routes/payments.ts`

### The vulnerability

`POST /api/payments/verify` checked that the HMAC-SHA256 signature Razorpay returned matched `order_id + '|' + payment_id` signed with the account's key secret — a correct check on its own. What it did *not* check was whether that `order_id` actually belonged to the booking the request claimed to be verifying.

A valid signature only proves *some* real payment happened on the account and Razorpay is vouching for that specific `(order_id, payment_id)` pair. It says nothing about which booking that order was created for.

### The exploit

1. Attacker books a genuinely cheap or free event, or a ₹1 event exploited via vulnerability #1 above, and completes a real, valid payment for it — order `order_AAA`, payment `pay_AAA`, a real signature Razorpay actually issued.
2. Attacker sends `POST /verify` with `bookingId: <expensive booking B>` but `razorpay_order_id: order_AAA`, `razorpay_payment_id: pay_AAA`, and the real signature from step 1.
3. The signature check passes — it's a genuine signature, just for the wrong order. Booking B gets marked paid, **for free**, reusing a payment that was never made against it.

This is a direct replay: one real ₹1 payment could be replayed to confirm an unlimited number of other bookings, each time presenting the same valid signature against a different `bookingId`.

### The fix

Added `razorpayOrderId String? @unique` to the `Booking` model (migration `20260824050000_add_razorpay_order_binding`) and populated it at order-creation time — the order id is bound to *that specific booking* the moment it's created, before any payment happens:

```ts
// create-order
await prisma.booking.update({
  where: { id: bookingId },
  data: { razorpayOrderId: order.id },
});
```

`/verify` now asserts the incoming order id matches the one already bound to the booking being verified, *before* it even checks the signature:

```ts
// backend/src/routes/payments.ts
if (!booking.razorpayOrderId || booking.razorpayOrderId !== razorpay_order_id) {
  console.warn(
    `[Payments] Order mismatch on booking ${bookingId}: ` +
    `expected ${booking.razorpayOrderId ?? 'none'}, got ${razorpay_order_id}`,
  );
  return res.status(400).json({ message: 'Payment does not match this booking' });
}
```

A signature replayed against a different booking now fails this check regardless of whether the signature itself is valid — the order was never created for that booking, so it was never bound to it.

`/verify` also requires `paymentStatus: 'unpaid'` via a conditional `updateMany`, so even a *same-booking* replay of an already-confirmed payment is rejected (409), not silently re-applied.

### The regression test

`backend/tests/payments.test.ts` — `'rejects a valid signature whose razorpay_order_id belongs to a different booking'`: creates two real bookings, computes a genuinely correct HMAC signature for booking A's order, then sends it to `/verify` claiming it's for booking B's `bookingId`. Asserts the response is `400` and that booking B's `paymentStatus` is still `'unpaid'` in the database afterward — the exact cross-booking replay described above, reproduced and confirmed blocked.

A second test, `'rejects a tampered signature — valid payload, wrong HMAC'`, covers the simpler case (a signature that was never valid at all) so the two failure modes — *wrong signature* and *right signature, wrong booking* — are both guarded independently.

---

## Why these two, and not a general write-up

Both of these were caught by actually attempting the exploit against a running instance — not by reading the code and reasoning about what *might* go wrong. That's deliberate: a signature check that "looks right" (HMAC comparison, `crypto.timingSafeEqual`, all present) can still be trivially bypassed if it's checking the right cryptography against the wrong data. The fix in both cases wasn't cryptographic — it was binding: making sure a payment credential can only ever be redeemed against the one thing it was issued for.

---

## Reporting a vulnerability

Both issues above were found and fixed before this document existed to disclose them to anyone else — there was no prior report to credit. If you find something similar, please don't open a public GitHub issue or test it against real bookings/payments beyond what's needed to confirm it. Email **parrvluthra@gmail.com** with a description and, if you have one, the minimal reproduction. Given this is a small, single-maintainer project, there's no bug bounty and no formal SLA, but reports will be read and real issues fixed.
