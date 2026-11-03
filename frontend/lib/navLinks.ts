/**
 * Which account links a signed-in user gets. One place, so the desktop avatar
 * menu and the mobile menu cannot drift apart again (the mobile menu used to
 * have only Discover / Planner / About / Dashboard).
 */

export interface NavLink {
  name: string;
  href: string;
}

export interface NavUser {
  role?: string;
  hostStatus?: string;
}

/** Who can create events and use the host dashboard: verified hosts, and admins. */
export function canHost(user: NavUser | null | undefined): boolean {
  return !!user && (user.hostStatus === 'verified' || user.role === 'admin');
}

const PUBLIC_LINKS: NavLink[] = [
  { name: 'Discover', href: '/discover' },
  { name: 'Planner', href: '/planner' },
  { name: 'About', href: '/about' },
];

/** Links for the full-screen mobile menu, in display order. */
export function mobileMenuLinks(user: NavUser | null | undefined): NavLink[] {
  if (!user) return [...PUBLIC_LINKS, { name: 'Sign in', href: '/signin' }];

  const links: NavLink[] = [
    ...PUBLIC_LINKS,
    { name: 'My bookings', href: '/my-bookings' },
    { name: 'Profile', href: '/profile' },
    { name: 'Settings', href: '/settings' },
  ];

  if (canHost(user)) {
    links.push(
      { name: 'Host dashboard', href: '/host/dashboard' },
      { name: 'Create event', href: '/host/events/new' },
    );
  } else if (user.hostStatus === 'pending') {
    links.push({ name: 'Host application', href: '/host/pending' });
  } else {
    links.push({ name: 'Become a host', href: '/become-a-host' });
  }

  if (user.role === 'admin') links.push({ name: 'Admin', href: '/admin/hosts' });
  return links;
}

/** Where the Attending / Hosting switch points, and which side the current path is on. */
export const MODE_LINKS = {
  attending: '/discover',
  hosting: '/host/dashboard',
} as const;

export function currentMode(pathname: string): 'attending' | 'hosting' {
  return pathname.startsWith('/host') ? 'hosting' : 'attending';
}

export type HostGate = 'wait' | 'allow' | 'signin' | 'become-a-host';

/**
 * Decide what a host-only page should do. On a hard load the persisted auth
 * store has not rehydrated (and the session check may still be running), so
 * `user` is briefly null even for a verified host; redirecting then bounced
 * hosts to /become-a-host. Only decide once auth has settled.
 */
export function hostGate(s: { hydrated: boolean; loading: boolean; user: NavUser | null | undefined }): HostGate {
  if (!s.hydrated || s.loading) return 'wait';
  if (!s.user) return 'signin';
  return canHost(s.user) ? 'allow' : 'become-a-host';
}
