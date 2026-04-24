'use client';

import { usePathname } from 'next/navigation';
import GlobalHeader from '@/components/layout/GlobalHeader';

// Routes where the header should not appear
const HIDDEN_ROUTES = [
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
  const hidden = HIDDEN_ROUTES.some((r) => pathname.startsWith(r));
  if (hidden) return null;
  return <GlobalHeader />;
}
