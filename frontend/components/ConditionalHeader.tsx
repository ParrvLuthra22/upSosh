'use client';

import { usePathname } from 'next/navigation';
import GlobalHeader from '@/components/layout/GlobalHeader';

// Routes where the header should not appear
const HIDDEN_ROUTES = [
  // Home page uses its own standalone Nav component
  '/',
  '/signin',
  '/signup',
  '/forgot',
  '/reset',
  '/onboarding',
  // host dashboard has its own sidebar + no global header needed
  '/host/dashboard',
  '/admin',
  // planner has its own TopBar component
  '/planner',
];

export default function ConditionalHeader() {
  const pathname = usePathname();
  // Exact match for "/" so /discover etc. still get the header
  const hidden = pathname === '/' || HIDDEN_ROUTES.some((r) => r !== '/' && pathname.startsWith(r));
  if (hidden) return null;
  return <GlobalHeader />;
}
