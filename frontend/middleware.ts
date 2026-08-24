import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Server-side route protection.
 *
 * Previously the only guard on /dashboard, /settings, /host/dashboard etc. was
 * a client `useEffect` redirect in components/ProtectedRoute.tsx. Because those
 * routes are statically prerendered, the full HTML and JS bundle were served to
 * anyone, logged in or not, and the redirect could be skipped entirely by
 * disabling JavaScript, or defeated by writing one localStorage key that
 * ProtectedRoute trusted.
 *
 * This runs on the server before any of that HTML is sent, so there is no
 * shell to inspect and no JS to disable.
 *
 * It checks for the PRESENCE of the backend's httpOnly `token` cookie — it does
 * not verify the JWT's signature or expiry here. Doing that would require
 * giving the frontend the same JWT_SECRET the backend signs with, and if the
 * two ever drifted (different values in two separately-configured .env files,
 * which is a normal way for that to happen) every legitimate user would be
 * silently logged out with no way to tell why. Signature and expiry
 * verification remain the backend's job — middleware/auth.ts checks both, and
 * re-fetches the user from the database, on every single API call. That is
 * where the real authorization decision is made; this file's job is narrower
 * and cheaper: refuse to render a protected page shell for a request that
 * plainly has no session at all.
 *
 * A forged or expired cookie still passes this check and reaches the page, but
 * gets nothing from it — every data fetch on that page hits the backend, which
 * verifies the token independently and returns 401. ProtectedRoute.tsx (kept
 * for UX: loading skeleton, ?from= redirect while the client store rehydrates)
 * handles that response. This middleware exists to close the specific gap the
 * client-only guard could not: a request that never runs JavaScript at all.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/my-bookings/:path*',
    '/host/:path*',
    '/onboarding/:path*',
    '/admin/:path*',
    '/booking/:path*',
  ],
};
