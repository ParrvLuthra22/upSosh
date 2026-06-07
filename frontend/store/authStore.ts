/**
 * store/authStore.ts
 * ──────────────────
 * Backward-compatibility shim.
 * The canonical store now lives at lib/stores/auth.ts.
 * All existing imports keep working unchanged.
 */

export { useAuthStore, useAuth } from '@/lib/stores/auth';
