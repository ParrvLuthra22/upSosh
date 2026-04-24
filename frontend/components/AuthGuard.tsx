'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/store/authStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, hydrated, initializeAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !user) {
      void initializeAuth();
    }
  }, [hydrated, user, initializeAuth]);

  useEffect(() => {
    if (hydrated && !loading && !user) {
      router.push(`/signin?from=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, hydrated, pathname, router]);

  if (!hydrated)
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );

  if (user) return <>{children}</>;

  if (loading)
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );

  if (!user) return null;
  return <>{children}</>;
}
