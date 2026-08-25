// Manual mock for the `razorpay` npm package. Jest only applies this to a
// node_modules package when a test file calls jest.mock('razorpay')
// explicitly (unlike mocks for the app's own modules, which auto-apply).
//
// Exposes the same jest.fn()s the mock itself uses via `__mocks__` so tests
// can both assert on calls (e.g. "was orders.create called with amount
// 500000?") and control what they resolve to.

export const ordersCreate = jest.fn();
export const paymentsRefund = jest.fn();

export default class MockRazorpay {
  orders = { create: ordersCreate };
  payments = { refund: paymentsRefund };
}
