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
