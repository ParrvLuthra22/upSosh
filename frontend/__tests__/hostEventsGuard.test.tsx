import '@testing-library/jest-dom';
import React from 'react';
import fs from 'fs';
import path from 'path';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { hostGate } from '@/lib/navLinks';

const verified = { role: 'user', hostStatus: 'verified' };

describe('hostGate', () => {
  it('waits until the store has rehydrated and the session check is done', () => {
    expect(hostGate({ hydrated: false, loading: false, user: null })).toBe('wait');
    expect(hostGate({ hydrated: true, loading: true, user: null })).toBe('wait');
    expect(hostGate({ hydrated: false, loading: false, user: verified })).toBe('wait');
  });
  it('allows verified hosts and admins', () => {
    expect(hostGate({ hydrated: true, loading: false, user: verified })).toBe('allow');
    expect(hostGate({ hydrated: true, loading: false, user: { role: 'admin', hostStatus: 'none' } })).toBe('allow');
  });
  it('sends signed-out users to sign in and everyone else to become-a-host', () => {
    expect(hostGate({ hydrated: true, loading: false, user: null })).toBe('signin');
    expect(hostGate({ hydrated: true, loading: false, user: { role: 'user', hostStatus: 'none' } })).toBe('become-a-host');
    expect(hostGate({ hydrated: true, loading: false, user: { role: 'user', hostStatus: 'pending' } })).toBe('become-a-host');
  });
});

let mockAuth: any;
const replace = jest.fn();
const get = jest.fn();
jest.mock('@/store/authStore', () => ({ useAuth: () => mockAuth }));
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), replace }) }));
jest.mock('@/lib/api', () => ({ api: { get: (...a: any[]) => get(...a), delete: jest.fn() } }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

beforeAll(() => {
  (global as any).IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
});
beforeEach(() => { replace.mockReset(); get.mockReset(); });

describe('/host/events page', () => {
  async function page() { return (await import('@/app/host/events/page')).default; }

  it('hard load: no redirect while auth is rehydrating, and none once a verified host is known', async () => {
    const Page = await page();
    get.mockResolvedValue({ events: [] });
    mockAuth = { user: null, isAuth: false, loading: false, hydrated: false };
    const { rerender } = render(<Page />);
    expect(replace).not.toHaveBeenCalled();
    mockAuth = { user: verified, isAuth: true, loading: false, hydrated: true };
    rerender(<Page />);
    expect(replace).not.toHaveBeenCalled();
    await waitFor(() => expect(get).toHaveBeenCalledWith('/api/events/host/mine'));
  });

  it('a non-host is redirected only after hydration', async () => {
    const Page = await page();
    mockAuth = { user: { role: 'user', hostStatus: 'none' }, isAuth: true, loading: false, hydrated: true };
    render(<Page />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/become-a-host'));
    expect(get).not.toHaveBeenCalled();
  });

  it('a failed load is an error with Retry, not "No live events"', async () => {
    const Page = await page();
    mockAuth = { user: verified, isAuth: true, loading: false, hydrated: true };
    get.mockRejectedValueOnce(new Error('boom'));
    render(<Page />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn.t load your events/i);
    expect(screen.queryByText(/No live events/i)).toBeNull();
    get.mockResolvedValueOnce({ events: [{ id: 'e1', title: 'Run', status: 'full', bookingsCount: 2, capacity: 2 }, { id: 'e2', title: 'Odd', status: 'mystery' }] });
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Run')).toBeInTheDocument(); // 'full' shows under Live, with a badge, no crash
  });
});

describe('/settings layout', () => {
  it('stacks the mobile tab strip above the content instead of beside it', () => {
    const src = fs.readFileSync(path.join(__dirname, '../app/settings/page.tsx'), 'utf8');
    expect(src).toContain('flex flex-col md:flex-row md:gap-10');
    expect(src).not.toMatch(/className="flex gap-10"/);
  });
});
