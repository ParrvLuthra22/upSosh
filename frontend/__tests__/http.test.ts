/**
 * @jest-environment node
 */
import { httpFetch, FetchError, describeError, GET_TIMEOUT_MS, WRITE_TIMEOUT_MS, UPLOAD_TIMEOUT_MS, WAKING_AFTER_MS } from '@/lib/http';
import { useServerStatus } from '@/lib/stores/serverStatus';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth';

const fetchMock = jest.fn();
const res = (status: number, body: unknown = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
/** A fetch that never answers but does honour abort, like the real one. */
const hang = (_url: unknown, init?: RequestInit) =>
  new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  });

beforeEach(() => {
  jest.useFakeTimers();
  fetchMock.mockReset();
  (global as unknown as { fetch: typeof fetchMock }).fetch = fetchMock;
  useServerStatus.setState({ slowRequests: 0 });
});
afterEach(() => jest.useRealTimers());

/** Run a call to completion while advancing fake time, returning what it settled with. */
async function settle<T>(p: Promise<T>, ms = 120_000): Promise<{ ok: true; value: T } | { ok: false; error: unknown }> {
  const out = p.then((value) => ({ ok: true as const, value }), (error) => ({ ok: false as const, error }));
  await jest.advanceTimersByTimeAsync(ms);
  return out;
}

describe('retries: GET only', () => {
  it('retries a GET after a network failure and returns the later success', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValueOnce(res(200, { ok: 1 }));
    const r = await settle(httpFetch('/api/events'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(r.ok && r.value.status).toBe(200);
  });

  it('retries a GET on 502/503/504 (a sleeping backend), at most twice', async () => {
    fetchMock.mockResolvedValue(res(503));
    const r = await settle(httpFetch('/api/events'));
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(r.ok && r.value.status).toBe(503);
  });

  it('retries a GET that times out', async () => {
    fetchMock.mockImplementationOnce(hang).mockResolvedValueOnce(res(200));
    const r = await settle(httpFetch('/api/events'));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(r.ok && r.value.status).toBe(200);
  });

  it('does not retry a real answer such as 404 or 401', async () => {
    fetchMock.mockResolvedValue(res(404));
    await settle(httpFetch('/api/events/nope'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each(['POST', 'PATCH', 'PUT', 'DELETE'])('never retries a %s after a network failure', async (method) => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const r = await settle(httpFetch('/api/anything', { method }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(!r.ok && r.error).toBeInstanceOf(FetchError);
  });

  it.each(['POST', 'PATCH', 'DELETE'])('never retries a %s that gets 502/503/504', async (method) => {
    fetchMock.mockResolvedValue(res(503));
    const r = await settle(httpFetch('/api/anything', { method }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(r.ok && r.value.status).toBe(503);
  });

  it('never retries a write that times out', async () => {
    fetchMock.mockImplementation(hang);
    const r = await settle(httpFetch('/api/bookings', { method: 'POST', body: '{}' }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(!r.ok && (r.error as FetchError).kind).toBe('timeout');
  });

  it.each(['/api/bookings', '/api/payments/create-order', '/api/payments/verify'])('never retries POST %s, even if the caller asks for retries', async (path) => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await settle(httpFetch(path, { method: 'POST', body: '{}', retries: 5 }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('caps GET retries at 2 even if the caller asks for more', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await settle(httpFetch('/api/events', { retries: 9 }));
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('does not retry once the caller has aborted', async () => {
    const controller = new AbortController();
    fetchMock.mockImplementation(async () => {
      controller.abort();
      throw new TypeError('Failed to fetch');
    });
    await settle(httpFetch('/api/events', { signal: controller.signal }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('timeouts', () => {
  async function timeoutAt(init: RequestInit & { timeoutMs?: number }): Promise<{ stillPendingAt: (ms: number) => Promise<boolean> }> {
    fetchMock.mockImplementation(hang);
    let settled = false;
    httpFetch('/api/x', { ...init, retries: 0 }).catch(() => { settled = true; });
    return { stillPendingAt: async (ms) => { await jest.advanceTimersByTimeAsync(ms); return !settled; } };
  }

  it('gives a GET 20 s, a JSON write 30 s', async () => {
    expect(GET_TIMEOUT_MS).toBe(20_000);
    expect(WRITE_TIMEOUT_MS).toBe(30_000);
    const get = await timeoutAt({});
    expect(await get.stillPendingAt(GET_TIMEOUT_MS - 100)).toBe(true);
    expect(await get.stillPendingAt(200)).toBe(false);

    fetchMock.mockReset();
    const post = await timeoutAt({ method: 'POST', body: '{}' });
    expect(await post.stillPendingAt(WRITE_TIMEOUT_MS - 100)).toBe(true);
    expect(await post.stillPendingAt(200)).toBe(false);
  });

  it('gives a FormData upload far longer than a JSON write', async () => {
    expect(UPLOAD_TIMEOUT_MS).toBeGreaterThan(WRITE_TIMEOUT_MS * 2);
    const upload = await timeoutAt({ method: 'POST', body: new FormData() });
    expect(await upload.stillPendingAt(WRITE_TIMEOUT_MS + 5_000)).toBe(true);
    expect(await upload.stillPendingAt(UPLOAD_TIMEOUT_MS - WRITE_TIMEOUT_MS - 5_000 - 100)).toBe(true);
    expect(await upload.stillPendingAt(200)).toBe(false);
  });

  it('an explicit timeoutMs wins', async () => {
    const t = await timeoutAt({ timeoutMs: 1_000 });
    expect(await t.stillPendingAt(900)).toBe(true);
    expect(await t.stillPendingAt(200)).toBe(false);
  });
});

describe('waking notice', () => {
  it('turns on after 4 s of waiting and off when the request settles', async () => {
    let answer!: (r: Response) => void;
    fetchMock.mockImplementation(() => new Promise<Response>((r) => { answer = r; }));
    const p = httpFetch('/api/events');
    await jest.advanceTimersByTimeAsync(WAKING_AFTER_MS - 100);
    expect(useServerStatus.getState().slowRequests).toBe(0);
    await jest.advanceTimersByTimeAsync(200);
    expect(useServerStatus.getState().slowRequests).toBe(1);
    answer(res(200));
    await p;
    expect(useServerStatus.getState().slowRequests).toBe(0);
  });

  it('stays off for a request that answers quickly, and for uploads', async () => {
    fetchMock.mockResolvedValue(res(200));
    await httpFetch('/api/events');
    expect(useServerStatus.getState().slowRequests).toBe(0);

    fetchMock.mockImplementation(hang);
    httpFetch('/api/uploads', { method: 'POST', body: new FormData() }).catch(() => {});
    await jest.advanceTimersByTimeAsync(WAKING_AFTER_MS * 3);
    expect(useServerStatus.getState().slowRequests).toBe(0);
  });
});

describe('describeError', () => {
  it('words timeouts and network failures for people', () => {
    expect(describeError(new FetchError('timeout', 'x'))).toMatch(/too long/);
    expect(describeError(new FetchError('network', 'x'))).toMatch(/reach the server/);
    expect(describeError(new Error('Booking not found'))).toBe('Booking not found');
  });
});

describe('lib/api.ts keeps its 401 handling', () => {
  // Node environment has no window; lib/api.ts only touches window.location in its 401 branch.
  const g = global as unknown as { window?: { location: { pathname: string; href: string } } };
  afterEach(() => { delete g.window; });

  it('logs out, sends the user to /signin?from=..., throws, and does not retry', async () => {
    const loc = { pathname: '/my-bookings', href: 'http://localhost/my-bookings' };
    g.window = { location: loc };
    const logout = jest.fn();
    jest.spyOn(useAuthStore, 'getState').mockReturnValue({ logout } as unknown as ReturnType<typeof useAuthStore.getState>);
    fetchMock.mockResolvedValue(res(401, { message: 'nope' }));

    const r = await settle(api.get('/api/bookings'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalled();
    expect(loc.href).toBe('/signin?from=%2Fmy-bookings');
    expect(!r.ok && (r.error as Error).message).toBe('Unauthorized — redirecting to sign-in');
    jest.restoreAllMocks();
  });

  it('turns a non-2xx answer into an Error with status and server message, and sends cookies', async () => {
    fetchMock.mockResolvedValue(res(409, { message: 'Already paid' }));
    const r = await settle(api.post('/api/payments/create-order', { bookingId: 'b' }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].credentials).toBe('include');
    expect(!r.ok && (r.error as Error & { status: number }).status).toBe(409);
    expect(!r.ok && (r.error as Error).message).toBe('Already paid');
  });
});
