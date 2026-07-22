/**
 * In-memory, per-instance sliding-window rate limiter. No external store —
 * fine for a single low-traffic contact endpoint; resets on cold start /
 * redeploy, which is an accepted tradeoff for "simple" IP throttling here.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

const hitsByIp = new Map<string, number[]>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recentHits = (hitsByIp.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recentHits.push(now);
  hitsByIp.set(ip, recentHits);
  return recentHits.length > MAX_REQUESTS_PER_WINDOW;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
