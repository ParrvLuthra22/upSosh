import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

const mockGet = jest.fn();
jest.mock('@/lib/api', () => ({ api: { get: (...a: unknown[]) => mockGet(...a), patch: jest.fn() } }));
jest.mock('@/store/authStore', () => ({ useAuth: () => ({ isAuth: true, loading: false, hydrated: true }) }));
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('next/image', () => ({ __esModule: true, default: (p: { alt: string }) => <span>{p.alt}</span> }));
jest.mock('react-qr-code', () => ({ __esModule: true, default: ({ value }: { value: string }) => <div data-testid="qr">{value}</div> }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const event = (title: string, days = 10) => ({
  id: 'e-' + title, title, date: new Date(Date.now() + days * 864e5).toISOString(), time: '7:00 PM',
  venue: 'Venue', city: 'Delhi', image: '', category: 'Social', isFree: false, slug: 's-' + title,
});
const booking = (id: string, o: Record<string, unknown>) => ({
  id, status: 'confirmed', paymentStatus: 'paid', totalAmount: 525, ticketPrice: 500, platformFee: 25,
  guestName: 'G', guestEmail: 'g@x.test', guestPhone: '1', guestCount: 1, createdAt: new Date().toISOString(),
  event: event('Show ' + id), ...o,
});

async function mount(rows: unknown[]) {
  mockGet.mockResolvedValue({ bookings: rows });
  const Page = (await import('@/app/my-bookings/page')).default;
  return render(<Page />);
}
const tab = (name: RegExp) => screen.getByRole('button', { name });
const openRow = (id: string) => fireEvent.click(screen.getByText('Show ' + id).closest('button')!);

beforeEach(() => mockGet.mockReset());

describe('/my-bookings', () => {
  it('keeps expired, refunded and refunded-but-confirmed bookings out of Upcoming', async () => {
    await mount([
      booking('Good', {}),
      booking('Expired', { status: 'expired', paymentStatus: 'unpaid' }),
      booking('RefundedStatus', { status: 'refunded', paymentStatus: 'refunded' }),
      booking('RefundedPayment', { status: 'confirmed', paymentStatus: 'refunded' }),
    ]);
    await screen.findByText('Show Good');
    for (const t of ['Expired', 'RefundedStatus', 'RefundedPayment']) expect(screen.queryByText('Show ' + t)).toBeNull();
    fireEvent.click(tab(/^Cancelled/));
    for (const t of ['Expired', 'RefundedStatus', 'RefundedPayment']) expect(await screen.findByText('Show ' + t)).toBeInTheDocument();
    expect(screen.getByText('Expired', { selector: 'span' })).toBeInTheDocument(); // status chip
    expect(screen.getAllByText('Refunded').length).toBeGreaterThanOrEqual(2);
  });

  it('shows a QR only for the confirmed, paid booking', async () => {
    await mount([
      booking('Paid', {}),
      booking('Hold', { status: 'pending', paymentStatus: 'unpaid' }),
    ]);
    await screen.findByText('Show Paid');
    openRow('Paid');
    expect(await screen.findByTestId('qr')).toHaveTextContent('UPSOSH-Paid');
    fireEvent.click(screen.getByLabelText('Close ticket') ?? screen.getByText('✕'));
    await waitFor(() => expect(screen.queryByTestId('qr')).toBeNull());

    openRow('Hold');
    await screen.findByText(/once your payment goes through/);
    expect(screen.queryByTestId('qr')).toBeNull();
  });

  it('never shows a QR for an expired or refunded booking', async () => {
    await mount([
      booking('Expired', { status: 'expired', paymentStatus: 'unpaid' }),
      booking('Refunded', { status: 'refunded', paymentStatus: 'refunded' }),
    ]);
    fireEvent.click(await screen.findByRole('button', { name: /^Cancelled/ }));
    for (const t of ['Expired', 'Refunded']) {
      await screen.findByText('Show ' + t);
      openRow(t);
      await screen.findByTestId('guest-count-line');
      expect(screen.queryByTestId('qr')).toBeNull();
      fireEvent.click(screen.getByLabelText('Close ticket') ?? screen.getByText('✕'));
      await waitFor(() => expect(screen.queryByTestId('guest-count-line')).toBeNull());
    }
  });

  it('shows the guest count in the ticket modal', async () => {
    await mount([booking('One', { guestCount: 1 }), booking('Three', { guestCount: 3, totalAmount: 1525, ticketPrice: 1500 })]);
    await screen.findByText('Show Three');
    openRow('Three');
    expect(await screen.findByTestId('guest-count-line')).toHaveTextContent('3 guests');
    expect(screen.getByText(/Ticket \(3 guests\)/)).toBeInTheDocument();
  });

  it('shows an error with Retry when loading fails, not an empty state', async () => {
    mockGet.mockRejectedValueOnce(new Error('Server is down'));
    const Page = (await import('@/app/my-bookings/page')).default;
    render(<Page />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("We couldn't load your bookings");
    expect(alert).toHaveTextContent('Server is down');
    expect(screen.queryByText('No upcoming bookings')).toBeNull();

    mockGet.mockResolvedValueOnce({ bookings: [booking('Back', {})] });
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Show Back')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('a genuinely empty list is still the empty state', async () => {
    await mount([]);
    expect(await screen.findByText('No upcoming bookings')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
