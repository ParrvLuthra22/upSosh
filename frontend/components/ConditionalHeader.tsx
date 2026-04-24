'use client';

import { usePathname } from 'next/navigation';
import Header from '@/src/components/Header';

const HIDDEN_ROUTES = ['/signin', '/signup', '/forgot', '/reset', '/onboarding', '/planner'];

export default function ConditionalHeader() {
  const pathname = usePathname();
  const hidden = HIDDEN_ROUTES.some((r) => pathname.startsWith(r));
  if (hidden) return null;
  return <Header />;
}
