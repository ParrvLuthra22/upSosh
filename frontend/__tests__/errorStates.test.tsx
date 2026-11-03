import '@testing-library/jest-dom';
import React from 'react';
import fs from 'fs';
import path from 'path';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const get = jest.fn();
const patch = jest.fn();
const httpFetch = jest.fn();
jest.mock('@/lib/api', () => ({ api: { get: (...a: any[]) => get(...a), patch: (...a: any[]) => patch(...a), post: jest.fn() }, getApiUrl: () => '' }));
jest.mock('@/lib/http', () => ({ httpFetch: (...a: any[]) => httpFetch(...a) }));
jest.mock('@/store/authStore', () => ({ useAuth: () => ({ isAuth: true, user: { id: 'u' } }) }));
jest.mock('next/navigation', () => ({ useParams: () => ({ id: 'e1' }), useRouter: () => ({ push: jest.fn() }) }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/components/ui/MagneticButton', () => ({ __esModule: true, default: ({ children }: any) => <>{children}</> }));
jest.mock('next/image', () => ({ __esModule: true, default: (p: any) => <img alt={p.alt} src={p.src} /> }));

beforeAll(() => {
  (global as any).URL.createObjectURL = jest.fn(() => 'blob:local');
  (global as any).IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
});
beforeEach(() => { get.mockReset(); patch.mockReset(); httpFetch.mockReset(); });

describe('host event detail', () => {
  const ev = { id: 'e1', title: 'Sunday Run', status: 'live', capacity: 10, bookingsCount: 1 };
  const att = { id: 'a1', name: 'Asha', email: 'a@x.test', checkedIn: false };
  async function page() { return (await import('@/app/host/events/[id]/page')).default; }

  it('a failed load is an error with Retry, not "Event not found"', async () => {
    const Page = await page();
    get.mockRejectedValueOnce(new Error('Server unreachable'));
    render(<Page />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn.t load this event/i);
    expect(screen.queryByText(/Event not found/i)).toBeNull();
    get.mockResolvedValueOnce(ev).mockResolvedValueOnce({ attendees: [att] });
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Sunday Run')).toBeInTheDocument();
  });

  it('a failed check-in shows a visible error on the page', async () => {
    const Page = await page();
    get.mockResolvedValueOnce(ev).mockResolvedValueOnce({ attendees: [att] });
    patch.mockRejectedValueOnce(new Error('Forbidden'));
    render(<Page />);
    await screen.findByText('Asha');
    const toggle = screen.getAllByRole('button').find((b) => /check/i.test(b.textContent ?? '') || /check/i.test(b.getAttribute('aria-label') ?? ''));
    expect(toggle).toBeTruthy();
    fireEvent.click(toggle!);
    expect(await screen.findByRole('alert')).toHaveTextContent(/Check-in update failed: Forbidden/);
  });
});

describe('host verification: identity upload', () => {
  async function page() { return (await import('@/app/onboarding/host-verification/identity/page')).default; }
  const file = new File(['x'], 'id.png', { type: 'image/png' });

  it('a failed upload is shown as an error and never becomes a blob: URL "document"', async () => {
    const Page = await page();
    httpFetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ message: 'Storage down' }) });
    render(<Page />);
    fireEvent.change(screen.getByLabelText('Government ID'), { target: { files: [file] } });
    expect(await screen.findByRole('alert')).toHaveTextContent(/Couldn.t upload your ID: Storage down/);
    // Continue stays blocked: no document URL was recorded.
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled();
  });

  it('a network failure is also an error', async () => {
    const Page = await page();
    httpFetch.mockRejectedValueOnce(new Error('Failed to fetch'));
    render(<Page />);
    fireEvent.change(screen.getByLabelText('Selfie with ID'), { target: { files: [file] } });
    expect(await screen.findByRole('alert')).toHaveTextContent(/Couldn.t upload your selfie: Failed to fetch/);
  });
});

describe('profile avatar sync', () => {
  const src = fs.readFileSync(path.join(__dirname, '../app/profile/page.tsx'), 'utf8');
  it('no longer swallows a failed save, and never persists a local blob: URL', () => {
    expect(src).not.toContain(".catch(() => {})");
    expect(src).toContain('setAvatarSyncError(');
    expect(src).not.toMatch(/data\.avatarUrl \?\? data\.photoUrl \?\? objectUrl/);
  });
});
