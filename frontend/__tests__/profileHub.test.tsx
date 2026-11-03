import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StatsSummary, BookingsSection } from '@/components/profile/ProfileHub';

const mockGet = jest.fn();
jest.mock('@/lib/api', () => ({ api: { get: (...a: unknown[]) => mockGet(...a) } }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a> }));

beforeEach(() => mockGet.mockReset());

describe('<StatsSummary />', () => {
  it('shows attended, upcoming and total spent from /api/users/me/stats', async () => {
    mockGet.mockResolvedValue({ eventsAttended: 4, upcomingCount: 2, totalPaid: 3600, totalRefunded: 2000, totalSpent: 1600 });
    render(<StatsSummary />);
    expect(await screen.findByText('₹1,600')).toBeInTheDocument();
    expect(mockGet).toHaveBeenCalledWith('/api/users/me/stats');
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/₹3,600 paid, ₹2,000 refunded/)).toBeInTheDocument();
  });

  it('shows an error with Retry rather than zeros', async () => {
    mockGet.mockRejectedValueOnce(new Error('nope'));
    render(<StatsSummary />);
    expect(await screen.findByRole('alert')).toHaveTextContent('nope');
    expect(screen.queryByText('₹0')).toBeNull();
    mockGet.mockResolvedValueOnce({ eventsAttended: 0, upcomingCount: 0, totalPaid: 0, totalRefunded: 0, totalSpent: 0 });
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.getByText('₹0')).toBeInTheDocument());
  });
});

describe('<BookingsSection />', () => {
  const ev = (title: string, days: number) => ({ title, date: new Date(Date.now() + days * 864e5).toISOString(), time: '7 PM', venue: 'V', city: 'D' });
  const row = (id: string, o: object) => ({ id, status: 'confirmed', paymentStatus: 'paid', totalAmount: 525, guestCount: 1, event: ev('Show ' + id, 5), ...o });

  it('lists upcoming first and labels expired/refunded honestly', async () => {
    mockGet.mockResolvedValue({ bookings: [
      row('Old', { event: ev('Show Old', -5) }),
      row('Expired', { status: 'expired', paymentStatus: 'unpaid' }),
      row('Soon', {}),
    ] });
    render(<BookingsSection />);
    await screen.findByText('Show Soon');
    const titles = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(titles[0]).toContain('Show Soon');
    expect(screen.getByText('expired')).toBeInTheDocument();
    expect(screen.getByText(/not paid, expired/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /all bookings and tickets/i })).toHaveAttribute('href', '/my-bookings');
  });

  it('shows at most five', async () => {
    mockGet.mockResolvedValue({ bookings: Array.from({ length: 8 }, (_, i) => row('B' + i, {})) });
    render(<BookingsSection />);
    await screen.findByText('Show B0');
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });

  it('error state with Retry; genuine empty state otherwise', async () => {
    mockGet.mockRejectedValueOnce(new Error('down'));
    render(<BookingsSection />);
    expect(await screen.findByRole('alert')).toHaveTextContent('down');
    mockGet.mockResolvedValueOnce({ bookings: [] });
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText(/haven.t booked anything yet/)).toBeInTheDocument();
  });
});
