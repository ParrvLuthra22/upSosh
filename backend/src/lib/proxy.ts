/**
 * How many reverse-proxy hops sit between the internet and this process.
 * Express uses it (`trust proxy`) to decide which X-Forwarded-For entry is the
 * real client address, and the rate limiters key on that address.
 *
 * Too low: every client appears as the nearest proxy, so they share one rate
 * limit bucket. Too high: a client can put a fake address at the front of
 * X-Forwarded-For and pick its own bucket. The right value depends on the
 * hosting chain, so it is set with TRUST_PROXY_HOPS instead of being guessed.
 */
export const DEFAULT_TRUST_PROXY_HOPS = 1;
const MAX_TRUST_PROXY_HOPS = 10;

export function parseTrustProxyHops(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === '') return DEFAULT_TRUST_PROXY_HOPS;
  const value = Number(raw.trim());
  if (!Number.isInteger(value) || value < 0 || value > MAX_TRUST_PROXY_HOPS) {
    console.warn(
      `[Config] TRUST_PROXY_HOPS must be a whole number from 0 to ${MAX_TRUST_PROXY_HOPS}; ` +
      `using the default of ${DEFAULT_TRUST_PROXY_HOPS}.`,
    );
    return DEFAULT_TRUST_PROXY_HOPS;
  }
  return value;
}
