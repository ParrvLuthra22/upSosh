'use client';

/**
 * components/ProtectedRoute.tsx
 * ──────────────────────────────
 * Two ways to protect a page:
 *
 *   1. Wrap the page JSX:
 *      <ProtectedRoute>
 *        <DashboardContent />
 *      </ProtectedRoute>
 *
 *   2. HOC — wrap the page component export:
 *      export default withAuth(DashboardPage);
 *
 *   3. Hook — use inside a component for custom guard logic:
 *      const { isReady, isAuthenticated } = useProtectedRoute();
 *
 * Behaviour:
 *   • Unauthenticated after hydration → redirect to /signin?from=<current path>
 *   • Pre-hydration / loading → show full-screen loading skeleton
 *   • Authenticated → render children
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/stores/auth';

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function AuthLoadingSkeleton() {
  // Generic page skeleton — matches the layout of most protected pages.
  // Only shown in the brief SSR→CSR hydration window (< 100 ms for logged-in users).
  return (
    <div className="min-h-screen bg-void animate-pulse">
      {/* Fake header */}
      <div className="h-14 border-b border-border bg-void/90 flex items-center px-6 gap-8">
        <div className="h-4 w-20 bg-surface rounded" />
        <div className="flex-1" />
        <div className="h-4 w-16 bg-surface rounded" />
        <div className="h-4 w-16 bg-surface rounded" />
        <div className="w-8 h-8 rounded-full bg-surface" />
      </div>
      {/* Fake content */}
      <div className="max-w-3xl mx-auto px-6 pt-20 space-y-6">
        <div className="h-3 w-24 bg-surface rounded" />
        <div className="h-10 w-64 bg-surface rounded" />
        <div className="h-px bg-border" />
        <div className="space-y-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-surface border border-border rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProtectedRoute() {
  const { user, isLoading, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isReady = hydrated && !isLoading;
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace(`/signin?from=${encodeURIComponent(pathname)}`);
    }
  }, [isReady, isAuthenticated, pathname, router]);

  return { isReady, isAuthenticated, user };
}

// ─── Wrapper component ────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Override the redirect target (defaults to /signin) */
  redirectTo?: string;
  /** Custom fallback instead of the default skeleton */
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  redirectTo = '/signin',
  fallback,
}: ProtectedRouteProps) {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect once we know for sure there's no user (after hydration)
    if (!hydrated) return;
    if (!user) {
      router.replace(`${redirectTo}?from=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, user, pathname, redirectTo, router]);

  // Before localStorage has rehydrated we can't know if the user is logged in.
  // Show skeleton only during that brief moment (~50ms).
  // ✅ User is in store (persisted from localStorage) → render immediately.
  // The background refresh() validates the token; if it returns 401 the store
  // clears the user and the useEffect above redirects.
  if (user) return <>{children}</>;

  // No user yet — show skeleton only while waiting for hydration.
  // After hydration, if still no user the useEffect redirects to /signin.
  return <>{fallback ?? <AuthLoadingSkeleton />}</>;
}

// ─── HOC ──────────────────────────────────────────────────────────────────────

/**
 * Wraps a page component with auth protection.
 *
 * @example
 *   export default withAuth(DashboardPage);
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { redirectTo?: string; fallback?: React.ReactNode }
) {
  const Guarded = (props: P) => (
    <ProtectedRoute
      redirectTo={options?.redirectTo}
      fallback={options?.fallback}
    >
      <Component {...props} />
    </ProtectedRoute>
  );

  Guarded.displayName = `withAuth(${Component.displayName ?? Component.name})`;
  return Guarded;
}
