/**
 * In-memory, per-instance sliding-window rate limiter. No external store —
 * fine for a single low-traffic contact endpoint; resets on cold start /
 * redeploy, which is an accepted tradeoff for "simple" IP throttling here.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

const hitsByIp = new Map<string, number[]>();

/** Above this many tracked keys, stale ones are swept so a long-lived
 * instance under a spray of unique IPs can't grow the map without bound. */
const SWEEP_THRESHOLD = 5000;

/** Longest window any caller uses; hits older than this are never read. */
const MAX_WINDOW_MS = 60 * 60 * 1000;

function sweep(now: number) {
  for (const [key, hits] of hitsByIp) {
    if (!hits.some((t) => now - t < MAX_WINDOW_MS)) hitsByIp.delete(key);
  }
}

export type RateLimit = { windowMs: number; max: number };

const DEFAULT_LIMIT: RateLimit = { windowMs: WINDOW_MS, max: MAX_REQUESTS_PER_WINDOW };

/** Records a hit for `key` and says whether it is now over `limit`. */
export function isRateLimited(key: string, limit: RateLimit = DEFAULT_LIMIT): boolean {
  const now = Date.now();
  if (hitsByIp.size > SWEEP_THRESHOLD) sweep(now);
  const recentHits = (hitsByIp.get(key) ?? []).filter((t) => now - t < limit.windowMs);
  recentHits.push(now);
  hitsByIp.set(key, recentHits);
  return recentHits.length > limit.max;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
