'use client';

import { usePathname } from 'next/navigation';
import GlobalFooter from '@/components/layout/GlobalFooter';

// Pages that show the footer
const FOOTER_ROUTES = ['/', '/discover', '/events', '/about', '/become-a-host', '/u/', '/features', '/pricing', '/contact', '/privacy', '/terms', '/refund', '/safety', '/my-bookings', '/settings', '/profile'];

// Pages that explicitly hide the footer
const HIDDEN_ROUTES = ['/signin', '/signup', '/forgot', '/reset', '/onboarding', '/host/dashboard', '/admin', '/planner'];

export default function ConditionalFooter() {
  const pathname = usePathname();
  const hidden = HIDDEN_ROUTES.some((r) => pathname.startsWith(r));
  if (hidden) return null;
  return <GlobalFooter />;
}
