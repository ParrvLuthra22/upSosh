import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { mobileMenuLinks, canHost, currentMode, MODE_LINKS } from '@/lib/navLinks';

const names = (u: Parameters<typeof mobileMenuLinks>[0]) => mobileMenuLinks(u).map((l) => l.name);
const href = (u: Parameters<typeof mobileMenuLinks>[0], name: string) => mobileMenuLinks(u).find((l) => l.name === name)?.href;

describe('mobileMenuLinks', () => {
  it('signed out: public pages and Sign in only', () => {
    expect(names(null)).toEqual(['Discover', 'Planner', 'About', 'Sign in']);
  });

  it('any signed-in user gets My bookings, Profile and Settings', () => {
    for (const u of [{ role: 'user', hostStatus: 'none' }, { role: 'user', hostStatus: 'pending' }, { role: 'host', hostStatus: 'verified' }, { role: 'admin', hostStatus: 'none' }]) {
      expect(href(u, 'My bookings')).toBe('/my-bookings');
      expect(href(u, 'Profile')).toBe('/profile');
      expect(href(u, 'Settings')).toBe('/settings');
    }
  });

  it('a plain user is offered Become a host, not host tools or Admin', () => {
    const n = names({ role: 'user', hostStatus: 'none' });
    expect(n).toContain('Become a host');
    expect(n).not.toContain('Host dashboard');
    expect(n).not.toContain('Create event');
    expect(n).not.toContain('Admin');
  });

  it('a pending applicant sees their application, not Become a host', () => {
    const u = { role: 'user', hostStatus: 'pending' };
    expect(href(u, 'Host application')).toBe('/host/pending');
    expect(names(u)).not.toContain('Become a host');
  });

  it('a verified host gets Host dashboard and Create event, but not Admin', () => {
    const u = { role: 'host', hostStatus: 'verified' };
    expect(href(u, 'Host dashboard')).toBe('/host/dashboard');
    expect(href(u, 'Create event')).toBe('/host/events/new');
    expect(names(u)).not.toContain('Become a host');
    expect(names(u)).not.toContain('Admin');
  });

  it('an admin gets Admin and the host tools, even without a host application', () => {
    const u = { role: 'admin', hostStatus: 'none' };
    expect(href(u, 'Admin')).toBe('/admin/hosts');
    expect(canHost(u)).toBe(true);
    expect(href(u, 'Host dashboard')).toBe('/host/dashboard');
    expect(href(u, 'Create event')).toBe('/host/events/new');
  });

  it('has no duplicate names or hrefs', () => {
    for (const u of [null, { role: 'admin', hostStatus: 'verified' }, { role: 'user', hostStatus: 'none' }]) {
      const links = mobileMenuLinks(u);
      expect(new Set(links.map((l) => l.name)).size).toBe(links.length);
      expect(new Set(links.map((l) => l.href)).size).toBe(links.length);
    }
  });
});

describe('Attending / Hosting mode', () => {
  it('reads the side from the path', () => {
    expect(currentMode('/host/dashboard')).toBe('hosting');
    expect(currentMode('/host/events/new')).toBe('hosting');
    expect(currentMode('/discover')).toBe('attending');
    expect(currentMode('/my-bookings')).toBe('attending');
  });
  it('points at real pages', () => {
    expect(MODE_LINKS).toEqual({ attending: '/discover', hosting: '/host/dashboard' });
  });
});

// ── The real header, with its mobile menu opened ─────────────────────────────
let mockUser: unknown = null;
jest.mock('@/store/authStore', () => ({
  useAuth: () => ({ user: mockUser, isAuth: !!mockUser, signOut: jest.fn() }),
}));
jest.mock('next/navigation', () => ({ usePathname: () => '/discover', useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@/lib/api', () => ({ api: { get: jest.fn().mockResolvedValue({ notifications: [] }), patch: jest.fn() } }));
jest.mock('sonner', () => ({ toast: { success: jest.fn() } }));
jest.mock('@/components/ui/MagneticButton', () => ({ __esModule: true, default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

describe('<GlobalHeader /> mobile menu', () => {
  async function openMenu(user: unknown) {
    mockUser = user;
    const Header = (await import('@/components/layout/GlobalHeader')).default;
    render(<Header />);
    fireEvent.click(screen.getByLabelText('Open menu'));
    const close = await screen.findByLabelText('Close menu');
    // the overlay is the nearest ancestor that also holds the menu links
    let el: HTMLElement | null = close;
    while (el && !within(el).queryByRole('link', { name: 'Settings' }) && !within(el).queryByRole('link', { name: 'Sign in' })) el = el.parentElement;
    return el as HTMLElement;
  }

  it('signed-in host sees every account link plus the Attending/Hosting switch', async () => {
    const menu = await openMenu({ name: 'Hari', email: 'h@x.test', role: 'host', hostStatus: 'verified' });
    for (const [label, to] of [['My bookings', '/my-bookings'], ['Profile', '/profile'], ['Settings', '/settings'], ['Host dashboard', '/host/dashboard'], ['Create event', '/host/events/new']]) {
      expect(within(menu).getByRole('link', { name: label })).toHaveAttribute('href', to);
    }
    expect(within(menu).getByRole('group', { name: /attending and hosting/i })).toBeInTheDocument();
    expect(within(menu).queryByRole('link', { name: 'Admin' })).toBeNull();
  });

  it('signed-in admin sees Admin', async () => {
    const menu = await openMenu({ name: 'Ada', email: 'a@x.test', role: 'admin', hostStatus: 'none' });
    expect(within(menu).getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin/hosts');
  });

  it('plain user sees Become a host and no switch', async () => {
    const menu = await openMenu({ name: 'Una', email: 'u@x.test', role: 'user', hostStatus: 'none' });
    expect(within(menu).getByRole('link', { name: 'Become a host' })).toHaveAttribute('href', '/become-a-host');
    expect(within(menu).queryByRole('group', { name: /attending and hosting/i })).toBeNull();
  });
});

describe('avatar menu', () => {
  it('"My profile" opens the edit page, and the public page is its own item', async () => {
    mockUser = { name: 'Hari', email: 'h@x.test', role: 'user', hostStatus: 'none', username: 'hari' };
    const Header = (await import('@/components/layout/GlobalHeader')).default;
    render(<Header />);
    fireEvent.click(screen.getByLabelText('Account menu'));
    expect(await screen.findByRole('link', { name: 'My profile' })).toHaveAttribute('href', '/profile');
    expect(screen.getByRole('link', { name: 'Public profile' })).toHaveAttribute('href', '/u/hari');
  });
});
