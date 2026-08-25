import { test, expect } from '@playwright/test';

/**
 * The golden path: signup → discover → open an event → book → pay with a
 * real Razorpay test-mode card → land on the in-modal confirmation → see
 * the ticket in /my-bookings.
 *
 * Runs against a live backend + Razorpay test-mode account — this is not a
 * mock. NEXT_PUBLIC_RAZORPAY_KEY_ID (frontend) and RAZORPAY_KEY_ID /
 * RAZORPAY_KEY_SECRET (backend) must be real `rzp_test_...` credentials for
 * an account with test mode enabled, or every step past "Book now" fails.
 *
 * Card: 5267 3181 8797 5449 (Mastercard), NOT the commonly-cited
 * 4111 1111 1111 1111. Razorpay's BIN lookup flags 4111... as an
 * international-issued test card, and this project's test account has
 * international cards disabled (confirmed live: it fails with "Payment
 * could not be completed — International cards are not supported"). 5267…
 * is Razorpay's own documented India-domestic Mastercard test number and
 * is what was actually verified working end-to-end against this account,
 * including its 3-D Secure OTP step (any 6 digits succeeds in test mode).
 */

const RAZORPAY_TEST_CARD = {
  number: '5267318187975449',
  expiry: '1230',
  cvv: '123',
  otp: '123456',
};

test('signup, book a paid event, pay with a real test card, see the ticket', async ({ page }) => {
  const uniqueEmail = `pw-e2e-${Date.now()}@example.test`;
  const guestName = 'Playwright E2E';

  // ── 1. Sign up ────────────────────────────────────────────────────────────
  await page.goto('/signup');
  await page.getByPlaceholder('Full name').fill(guestName);
  await page.getByPlaceholder('Email address').fill(uniqueEmail);
  await page.getByPlaceholder('Password').fill('TestPassword123!');
  // The terms checkbox is a plain `<button type="button">` with no
  // accessible name (an icon-only toggle) inside a `<label>` alongside the
  // "I agree to..." text — scope by the label's text, then grab its button.
  await page.locator('label', { hasText: "I agree to UpSosh's" }).getByRole('button').click();
  await page.getByRole('button', { name: 'Create account' }).click();

  // ── 2. Land on /discover ─────────────────────────────────────────────────
  await expect(page).toHaveURL(/\/discover/, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Events worth showing up to.' })).toBeVisible();

  // ── 3. Open a paid event ─────────────────────────────────────────────────
  // The seeded "Creator Meetup — Your First 1,000 Followers" event (₹499) —
  // a stable, known paid event rather than "whichever card is first", so
  // the test doesn't depend on seed-data ordering. Scoped to an <a
  // href="/events/..."> specifically: the category filter bar has its own
  // "Creator Meetups" chip whose text is a substring match for the event
  // title and sits earlier in the DOM, so a bare getByText click landed on
  // the filter instead of the event card.
  await page.locator('a[href^="/events/"]', { hasText: 'Creator Meetup' }).first().click();
  await expect(page).toHaveURL(/\/events\//);

  // ── 4. Book now → guest details ──────────────────────────────────────────
  await page.getByRole('button', { name: 'Book now' }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Review your booking')).toBeVisible();

  // Inputs have visible <label> text but no htmlFor/id association
  // (components/ui/input.tsx renders a bare <label>), so getByLabel can't
  // find them. `div:has(label)` matches every ancestor level that contains
  // that label (the whole form container included, since :has checks any
  // descendant, not just direct children) — .first() on that then always
  // grabbed the form's very first input regardless of which field was
  // requested. Going label → its own direct parent (the label and the
  // input sit in the same one-field wrapper div, as siblings) scopes
  // correctly to just that field.
  async function fillLabelledInput(labelText: string, value: string) {
    await dialog
      .locator('label', { hasText: labelText })
      .locator('..')
      .locator('input')
      .fill(value);
  }
  await fillLabelledInput('Full name', guestName);
  await fillLabelledInput('Email address', uniqueEmail);
  await fillLabelledInput('Phone number', '9999999999');
  await dialog.getByRole('button', { name: 'Continue' }).click();

  // ── 5. Payment method + terms ─────────────────────────────────────────────
  await expect(dialog.getByText('Pay your way')).toBeVisible();
  // paymentMethod starts as `null` (lib/stores/booking.ts) — nothing is
  // pre-selected, so the "Instant payment" card has to be clicked
  // explicitly or the Pay button stays disabled.
  await dialog.getByText('Instant payment').click();
  // Same pattern as the signup checkbox, but here the toggle is a bare
  // <div onClick> with no button role at all.
  await dialog.locator('label', { hasText: 'I agree to the' }).locator('div').first().click();
  await dialog.getByRole('button', { name: /^Pay ₹/ }).click();

  // ── 6. Razorpay's real test-mode checkout (iframe) ───────────────────────
  // The checkout iframe has no `name` attribute — select by its src instead
  // (confirmed live: src is https://api.razorpay.com/v1/checkout/public?...).
  // A second, unrelated iframe (Sardine's fraud-detection collector) also
  // loads under the same api.razorpay.com origin partway through the flow,
  // so the selector is scoped to the specific /v1/checkout/ path.
  const razorpayFrame = page.frameLocator('iframe[src*="api.razorpay.com/v1/checkout/"]');

  // In a fresh browser context (no prior Razorpay cookies — every test run
  // here, and every real first-time visitor) Razorpay's Magic Checkout asks
  // for a mobile number before showing payment options at all. It renders
  // as an overlay on TOP of the Payment Options panel, so skipping it made
  // every later click silently fail (blocked by "overlay-backdrop
  // intercepts pointer events") rather than erroring outright.
  const mobileInput = razorpayFrame.getByPlaceholder('Mobile number');
  await mobileInput.waitFor({ timeout: 15000 });
  await mobileInput.fill('9625789901');
  await razorpayFrame.getByRole('button', { name: 'Continue' }).click();

  await razorpayFrame.getByText('Cards', { exact: true }).click();

  // .fill() sets the DOM value directly and only fires 'input'/'change' —
  // Razorpay's card-number field listens per-keystroke (for its live
  // network-detection and Luhn validation) and never recognizes a .fill()'d
  // value as complete, so Continue silently no-ops forever. Real per-key
  // events, via pressSequentially, are what a human typing would produce.
  const cardNumberInput = razorpayFrame.getByPlaceholder('Card Number');
  await cardNumberInput.click();
  await cardNumberInput.pressSequentially(RAZORPAY_TEST_CARD.number, { delay: 30 });
  await razorpayFrame.getByPlaceholder('MM / YY').pressSequentially(RAZORPAY_TEST_CARD.expiry, { delay: 30 });
  await razorpayFrame.getByPlaceholder('CVV').pressSequentially(RAZORPAY_TEST_CARD.cvv, { delay: 30 });
  await razorpayFrame.getByRole('button', { name: 'Continue' }).click();

  // "Save this card?" prompt — decline, it's not part of this flow.
  const maybeLater = razorpayFrame.getByText('Maybe later');
  if (await maybeLater.isVisible({ timeout: 5000 }).catch(() => false)) {
    await maybeLater.click();
  }

  // 3-D Secure OTP step — any 6 digits succeeds against a test-mode card.
  // pressSequentially again, same reason as the card fields above. The
  // original (now-hidden, but still in the DOM) "add a new card" Continue
  // button makes a plain getByRole('button', {name:'Continue'}) ambiguous
  // here — visible-only scoping picks the OTP form's actual submit button.
  const otpInput = razorpayFrame.getByPlaceholder('Enter OTP');
  await otpInput.waitFor({ timeout: 10000 });
  await otpInput.pressSequentially(RAZORPAY_TEST_CARD.otp, { delay: 30 });
  await razorpayFrame.getByRole('button', { name: 'Continue' }).last().click();

  // ── 7. In-modal confirmation ──────────────────────────────────────────────
  await expect(page.getByText("You're in.")).toBeVisible({ timeout: 20000 });
  await expect(page.getByText('Your spot is confirmed.')).toBeVisible();
  await page.getByRole('button', { name: 'Done' }).click();

  // ── 8. See the ticket in /my-bookings ─────────────────────────────────────
  await page.goto('/my-bookings');
  await expect(page.getByText('Creator Meetup')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('CONFIRMED')).toBeVisible();
  await expect(page.getByText(/paid/)).toBeVisible();
});
