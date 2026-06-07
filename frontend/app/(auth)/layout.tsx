/**
 * app/(auth)/layout.tsx
 * ─────────────────────
 * Passthrough — each auth page owns its full split layout so the design
 * can vary per page (sign-in vs sign-up vs forgot-password).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
