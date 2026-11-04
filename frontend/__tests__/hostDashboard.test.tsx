import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import {
  statusStyle, apiEventToHostEvent, isUpcoming, HOST_NAV, activeHostNav, type HostEventStatus,
} from '@/lib/hostEventTypes';

const ALL_STATUSES: HostEventStatus[] = ['draft', 'live', 'full', 'past', 'cancelled'];

describe('statusStyle', () => {
  it.each(ALL_STATUSES)('has a style for %s', (status) => {
    const s = statusStyle(status);
    expect(s.bg && s.text && s.label).toBeTruthy();
  });

  it('labels cancelled events as Cancelled (this used to crash the dashboard)', () => {
    expect(statusStyle('cancelled').label).toBe('Cancelled');
  });

  it('never returns undefined, whatever the server sends', () => {
    for (const odd of ['archived', '', undefined, null, 'constructor', '__proto__', 'toString']) {
      const s = statusStyle(odd as string | undefined);
      expect(s).toBeDefined();
      expect(typeof s.bg).toBe('string');
    }
    expect(statusStyle('archived').label).toBe('Archived');
  });
});

describe('apiEventToHostEvent', () => {
  const row = { id: 'e1', slug: 'run-club', title: 'Run', date: '2030-05-04T10:00:00.000Z', price: 500, attendees: 40, capacity: 50, status: 'live' };

  it('takes revenue from the server total, never price x attendees', () => {
    expect(apiEventToHostEvent({ ...row, revenue: 1050 }).revenue).toBe(1050);
    expect(apiEventToHostEvent({ ...row, revenue: 0 }).revenue).toBe(0); // 500 x 40 would have said 20000
    expect(apiEventToHostEvent(row).revenue).toBe(0);
  });

  it('keeps the slug for linking, and falls back to the id', () => {
    expect(apiEventToHostEvent(row).slug).toBe('run-club');
    expect(apiEventToHostEvent({ ...row, slug: undefined }).slug).toBe('e1');
  });

  it('marks free events', () => {
    expect(apiEventToHostEvent({ ...row, price: 0 }).isFree).toBe(true);
    expect(apiEventToHostEvent({ ...row, price: 500, isFree: false }).isFree).toBe(false);
  });
});

describe('isUpcoming', () => {
  const now = new Date('2030-01-01T00:00:00Z');
  const future = '2030-02-01T00:00:00Z';
  const past = '2029-12-01T00:00:00Z';
  it('counts published events that are still ahead', () => {
    expect(isUpcoming({ status: 'live', startsAt: future }, now)).toBe(true);
    expect(isUpcoming({ status: 'full', startsAt: future }, now)).toBe(true);
  });
  it('does not count drafts, cancelled, past or undated events', () => {
    expect(isUpcoming({ status: 'draft', startsAt: future }, now)).toBe(false);
    expect(isUpcoming({ status: 'cancelled', startsAt: future }, now)).toBe(false);
    expect(isUpcoming({ status: 'live', startsAt: past }, now)).toBe(false);
    expect(isUpcoming({ status: 'live', startsAt: null }, now)).toBe(false);
  });
});

describe('host navigation', () => {
  it('has no entries without content behind them', () => {
    const labels = HOST_NAV.map((n) => n.label.toLowerCase());
    for (const gone of ['attendees', 'analytics', 'payouts']) expect(labels).not.toContain(gone);
  });

  it.each(HOST_NAV.map((n) => [n.label, n.href]))('%s -> %s is a real page in app/', (_label, href) => {
    const page = path.join(__dirname, '..', 'app', href, 'page.tsx');
    expect(fs.existsSync(page)).toBe(true);
  });

  it('fits on one phone-width bar', () => {
    expect(HOST_NAV.length).toBeLessThanOrEqual(5);
  });

  it('picks the active item from the path', () => {
    expect(activeHostNav('/host/dashboard')).toBe('overview');
    expect(activeHostNav('/host/events')).toBe('events');
    expect(activeHostNav('/host/events/abc123')).toBe('events');
    expect(activeHostNav('/host/events/new')).toBe('new');
    expect(activeHostNav('/planner')).toBe('planner');
    expect(activeHostNav('/settings')).toBe('settings');
  });
});

// ── The page itself, with the network and framework faked ────────────────────
// jsdom has neither of these; framer-motion's useInView and the reduced-motion hook need them.
class FakeIntersectionObserver {
  constructor(private cb: IntersectionObserverCallback) {}
  observe(target: Element) { this.cb([{ isIntersecting: true, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver); }
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
beforeAll(() => {
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = FakeIntersectionObserver;
  window.matchMedia = window.matchMedia || ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false }) as unknown as MediaQueryList);
});
const mockGet = jest.fn();
jest.mock('@/lib/api', () => ({ api: { get: (...a: unknown[]) => mockGet(...a) } }));
jest.mock('@/lib/stores/auth', () => ({
  useAuth: () => ({ user: { name: 'Hari Host', hostStatus: 'verified', role: 'host' }, isAuth: true }),
}));
jest.mock('@/components/ProtectedRoute', () => ({ withAuth: (C: React.ComponentType) => C }));
jest.mock('next/navigation', () => ({ usePathname: () => '/host/dashboard' }));
jest.mock('next/image', () => ({ __esModule: true, default: (p: { alt: string }) => <span data-testid="img">{p.alt}</span> }));
jest.mock('@/components/layout/ModeSwitch', () => ({ __esModule: true, default: () => <div data-testid="mode-switch" /> }));

function mine(events: object[]) {
  mockGet.mockImplementation(async (url: string) => {
    if (url.includes('/host/mine')) return { events };
    if (url.includes('/host/stats')) return { upcomingEvents: 1, totalAttendees: 4, totalRevenue: 2100, eventsHosted: events.length };
    throw new Error('unexpected ' + url);
  });
}
const base = { image: 'https://example.test/i.jpg', category: 'Social', time: '7 PM', capacity: 30, price: 500 };

describe('<HostDashboard />', () => {
  beforeEach(() => mockGet.mockReset());
  const load = async () => {
    const Page = (await import('@/app/host/dashboard/page')).default;
    return render(<Page />);
  };

  it('renders a cancelled event instead of crashing, with a Cancelled badge', async () => {
    mine([{ ...base, id: 'c1', slug: 'cancelled-one', title: 'Cancelled gig', date: '2030-05-04T10:00:00Z', status: 'cancelled', attendees: 0, revenue: 0 }]);
    await load();
    expect(await screen.findByText('Cancelled')).toBeInTheDocument();
    expect(screen.getByText('Cancelled gig')).toBeInTheDocument();
  });

  it('renders every status at once', async () => {
    mine(ALL_STATUSES.map((status, i) => ({ ...base, id: `e${i}`, slug: `s${i}`, title: `Event ${status}`, date: '2030-05-04T10:00:00Z', status, attendees: 1, revenue: 0 })));
    await load();
    for (const status of ALL_STATUSES) expect(await screen.findByText(`Event ${status}`)).toBeInTheDocument();
  });

  it('links each card to the event page by slug, and to its manage page', async () => {
    mine([{ ...base, id: 'id-1', slug: 'my-slug', title: 'Linked', date: '2030-05-04T10:00:00Z', status: 'live', attendees: 2, revenue: 1050 }]);
    await load();
    await screen.findByText('Linked');
    expect(screen.getByRole('link', { name: 'View Linked' })).toHaveAttribute('href', '/events/my-slug');
    expect(screen.getByRole('link', { name: 'Manage →' })).toHaveAttribute('href', '/host/events/id-1');
  });

  it('shows the server revenue, and no fake month-over-month trend', async () => {
    mine([{ ...base, id: 'r1', slug: 'r', title: 'Paid', date: '2030-05-04T10:00:00Z', status: 'live', attendees: 40, revenue: 1050 }]);
    const { container } = await load();
    await screen.findByText('Paid');
    expect(screen.getByText('₹1,050 ticket revenue')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/vs last month/i);
    expect(container.textContent).not.toMatch(/\d+% vs/);
  });

  it('has a Back to site link, the Attending/Hosting switch, and a working AI Planner link', async () => {
    mine([]);
    await load();
    await screen.findByText(/Your events/);
    for (const link of screen.getAllByRole('link', { name: /back to site/i })) expect(link).toHaveAttribute('href', '/discover');
    expect(screen.getByTestId('mode-switch')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open ai planner/i })).toHaveAttribute('href', '/planner');
  });

  it('sidebar and bottom bar are links to real routes', async () => {
    mine([]);
    await load();
    await screen.findByText(/Your events/);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    for (const item of HOST_NAV) expect(hrefs).toContain(item.href);
    expect(screen.queryByText('Attendees')).toBeNull();
    expect(screen.queryByText('Payouts')).toBeNull();
  });

  it('shows an error with Retry when the API fails, not zeros', async () => {
    mockGet.mockRejectedValue(new Error('boom'));
    await load();
    expect(await screen.findByRole('alert')).toHaveTextContent('boom');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.queryByText('Ticket revenue')).toBeNull();
    mine([]);
    screen.getByRole('button', { name: 'Retry' }).click();
    await waitFor(() => expect(screen.getByText('Ticket revenue')).toBeInTheDocument());
  });
});

describe('events saved without a cover image', () => {
  it('fall back to the default image instead of an empty src', () => {
    const { apiEventToHostEvent } = require('@/lib/hostEventTypes');
    expect(apiEventToHostEvent({ id: 'e', title: 'T', status: 'draft', image: '' }).image).toMatch(/^https:\/\//);
    expect(apiEventToHostEvent({ id: 'e', title: 'T', status: 'draft', image: 'https://res.cloudinary.com/x.png' }).image).toBe('https://res.cloudinary.com/x.png');
  });
});
