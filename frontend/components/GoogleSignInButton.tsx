'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/lib/stores/auth';

// Google Identity Services attaches itself to window at runtime — no
// package for this, it's a script tag (see the loader below), so the
// global has to be typed by hand rather than imported.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
        };
      };
    };
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let scriptLoadPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

/**
 * Renders Google's own "Continue with Google" button (Identity Services —
 * the ID-token flow, not full OAuth: no client secret or redirect URI on
 * our end, just a signed JWT Google hands the browser directly). Google's
 * branding terms require using their rendered button rather than a custom
 * one, hence the iframe-in-a-div rather than styled markup here.
 *
 * Renders nothing if NEXT_PUBLIC_GOOGLE_CLIENT_ID isn't set, so this is
 * safe to drop into a page before that's configured.
 */
export function GoogleSignInButton({ redirectTo = '/discover' }: { redirectTo?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [scriptFailed, setScriptFailed] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    async function handleCredentialResponse(response: { credential: string }) {
      try {
        await loginWithGoogle(response.credential);
        router.push(redirectTo);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Google sign-in failed');
      }
    }

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID!,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          width: 320,
          text: 'continue_with',
        });
      })
      .catch(() => {
        if (!cancelled) setScriptFailed(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CLIENT_ID || scriptFailed) return null;

  return <div ref={containerRef} className="flex justify-center" />;
}

export default GoogleSignInButton;
