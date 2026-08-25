import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import AdminHostsClient from './AdminHostsClient';

/**
 * Server component — the actual admin-role check.
 *
 * middleware.ts already refuses to render ANY /admin/* page shell for a
 * request with no session cookie at all (redirects to /signin). That check
 * can't see the user's role, though — it has no JWT_SECRET and no database
 * access, by design (see middleware.ts's own comment). This is where the
 * real authorization decision happens: a server-side call to the backend's
 * own /api/auth/me (which re-verifies the JWT and re-reads the row from the
 * database on every call) using the same httpOnly cookie, before any HTML
 * for this page — including the client bundle for AdminHostsClient — is
 * sent. A non-admin gets notFound(), not a redirect: a redirect confirms
 * "this route exists, you're just not allowed"; a 404 doesn't.
 */
async function getSessionRole(): Promise<string | null> {
  const token = cookies().get('token')?.value;
  if (!token) return null;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${backendUrl}/api/auth/me`, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user?.role ?? null;
  } catch {
    // Can't confirm admin status — fail closed, not open.
    return null;
  }
}

export default async function AdminHostsPage() {
  const role = await getSessionRole();
  if (role !== 'admin') notFound();

  return <AdminHostsClient />;
}
