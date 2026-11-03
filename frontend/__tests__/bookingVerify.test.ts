import { useBookingStore } from '@/lib/stores/booking';
import { FetchError } from '@/lib/http';

const mockFetch = jest.fn();
jest.mock('@/lib/http', () => {
  const actual = jest.requireActual('@/lib/http');
  return { ...actual, httpFetch: (...a: unknown[]) => mockFetch(...a) };
});

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });
const calls = (path: string) => mockFetch.mock.calls.filter((c) => c[0] === path);

function setup(verify: () => unknown) {
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'rzp_test_x';
  (window as any).Razorpay = function (opts: any) {
    return { open: () => opts.handler({ razorpay_payment_id: 'pay_1', razorpay_order_id: 'order_1', razorpay_signature: 'sig' }) };
  };
  mockFetch.mockReset();
  mockFetch.mockImplementation(async (path: string) => {
    if (path === '/api/bookings') return ok({ booking: { id: 'b1', guestCount: 1, ticketPrice: 500, platformFee: 25, totalAmount: 525 } });
    if (path === '/api/payments/razorpay/order' || path.startsWith('/api/payments/create-order')) return ok({ orderId: 'order_1', amount: 52500, currency: 'INR' });
    if (path === '/api/payments/verify') return verify();
    throw new Error('unexpected ' + path);
  });
  const s = useBookingStore.getState();
  s.open('evt1', { id: 'evt1', title: 'Run', price: 500 } as any, 1);
  s.setGuestDetails({ name: 'A', email: 'a@x.test', phone: '9999999999' });
  s.setPaymentMethod('instant');
}

describe('payment verify step', () => {
  for (const kind of ['timeout', 'network'] as const) {
    it(`a ${kind} on /verify means "payment may have gone through": no failure, no retry`, async () => {
      setup(() => { throw new FetchError(kind, 'x'); });
      await useBookingStore.getState().submit();
      const s = useBookingStore.getState();
      expect(s.paymentUncertain).toBe(true);
      expect(s.errorMessage).toBeNull();
      expect(s.errorAfterPayment).toBe(false);
      expect(s.isProcessing).toBe(false);
      expect(s.step).not.toBe(3);            // not shown as a confirmed ticket either
      expect(calls('/api/payments/verify')).toHaveLength(1); // the POST was never repeated
      expect(calls('/api/bookings')).toHaveLength(1);
    });
  }

  it('a real server rejection is still reported as an error, not as "received"', async () => {
    setup(() => ({ ok: false, status: 400, json: async () => ({ message: 'Invalid signature' }) }));
    await useBookingStore.getState().submit();
    const s = useBookingStore.getState();
    expect(s.paymentUncertain).toBe(false);
    expect(s.errorMessage).toBe('Invalid signature');
    expect(s.errorAfterPayment).toBe(true);
  });

  it('success still advances to confirmation', async () => {
    setup(() => ok({ success: true }));
    await useBookingStore.getState().submit();
    const s = useBookingStore.getState();
    expect(s.step).toBe(3);
    expect(s.paymentUncertain).toBe(false);
  });

  it('opening or closing the flow clears the notice', async () => {
    setup(() => { throw new FetchError('timeout', 'x'); });
    await useBookingStore.getState().submit();
    useBookingStore.getState().close();
    expect(useBookingStore.getState().paymentUncertain).toBe(false);
  });
});
