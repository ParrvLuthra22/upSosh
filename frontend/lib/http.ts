/**
 * The one fetch every call site goes through (lib/api.ts and the raw fetch
 * call sites alike). Same signature as `fetch`, plus:
 *
 *  - a timeout per attempt, so a hung request fails instead of spinning forever
 *  - a retry when the server looks asleep or unreachable: a timeout, a network
 *    error, or a 502/503/504 from the proxy. Only for safe methods (GET/HEAD)
 *    unless the caller opts in with `retry`, because replaying a POST that
 *    might have gone through could book or pay twice
 *  - after WAKING_AFTER_MS of waiting, flips the shared "Waking the server"
 *    notice on (see lib/stores/serverStatus.ts); it goes off when the request settles
 *
 * Failures that are not an HTTP response are thrown as FetchError, never
 * swallowed into an empty result, so callers can show them as errors.
 */

import { useServerStatus } from '@/lib/stores/serverStatus';

export const WAKING_AFTER_MS = 4000;
export const GET_TIMEOUT_MS = 20_000;
export const WRITE_TIMEOUT_MS = 30_000;
const DEFAULT_RETRIES = 2;
const RETRY_BACKOFF_MS = [800, 2000];
const RETRY_STATUSES = new Set([502, 503, 504]);

export interface HttpOptions {
  /** Per-attempt timeout. Default 20 s for GET/HEAD, 30 s otherwise. */
  timeoutMs?: number;
  /** Extra attempts after a timeout / network error / 502-504. Default 2 for GET/HEAD, 0 otherwise. */
  retries?: number;
  /** Don't show the "Waking the server" notice for this request (e.g. a big upload). */
  quiet?: boolean;
}

export type FetchErrorKind = 'timeout' | 'network';

export class FetchError extends Error {
  readonly kind: FetchErrorKind;
  constructor(kind: FetchErrorKind, message: string) {
    super(message);
    this.name = 'FetchError';
    this.kind = kind;
  }
}

export function isFetchError(err: unknown): err is FetchError {
  return err instanceof FetchError;
}

/** Plain-language text for any thrown value, for an error state or toast. */
export function describeError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof FetchError) {
    return err.kind === 'timeout'
      ? 'The server took too long to respond. Please try again.'
      : "We couldn't reach the server. Check your connection and try again.";
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** One attempt: its own timeout, still honouring the caller's abort signal. */
async function attempt(input: RequestInfo | URL, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const outer = init.signal;
  const onOuterAbort = () => controller.abort();
  if (outer) {
    if (outer.aborted) controller.abort();
    else outer.addEventListener('abort', onOuterAbort, { once: true });
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    // The caller cancelled (unmount, new search): let that through untouched.
    if (outer?.aborted) throw err;
    if (timedOut) throw new FetchError('timeout', `Request timed out after ${timeoutMs} ms`);
    throw new FetchError('network', err instanceof Error ? err.message : 'Network error');
  } finally {
    clearTimeout(timer);
    outer?.removeEventListener('abort', onOuterAbort);
  }
}

export async function httpFetch(
  input: RequestInfo | URL,
  init: RequestInit & HttpOptions = {},
): Promise<Response> {
  const { timeoutMs, retries, quiet, ...fetchInit } = init;
  const method = (fetchInit.method ?? 'GET').toUpperCase();
  const safe = method === 'GET' || method === 'HEAD';
  const perAttempt = timeoutMs ?? (safe ? GET_TIMEOUT_MS : WRITE_TIMEOUT_MS);
  const maxRetries = retries ?? (safe ? DEFAULT_RETRIES : 0);

  let slow = false;
  const wakingTimer = quiet
    ? null
    : setTimeout(() => {
        slow = true;
        useServerStatus.getState()._slow(1);
      }, WAKING_AFTER_MS);

  try {
    for (let n = 0; ; n++) {
      try {
        const res = await attempt(input, fetchInit, perAttempt);
        if (n < maxRetries && RETRY_STATUSES.has(res.status)) {
          await sleep(RETRY_BACKOFF_MS[Math.min(n, RETRY_BACKOFF_MS.length - 1)]);
          continue;
        }
        return res;
      } catch (err) {
        if (!(err instanceof FetchError) || n >= maxRetries) throw err;
        await sleep(RETRY_BACKOFF_MS[Math.min(n, RETRY_BACKOFF_MS.length - 1)]);
      }
    }
  } finally {
    if (wakingTimer) clearTimeout(wakingTimer);
    if (slow) useServerStatus.getState()._slow(-1);
  }
}
