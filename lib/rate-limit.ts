// In-memory fallback is per serverless instance. For strict global limits use a shared Redis/KV store.
type Entry = { count: number; reset: number };
const buckets = new Map<string, Entry>();
export function rateLimit(
  key: string,
  limit: number,
  windowMs = 60_000,
  now = Date.now(),
) {
  let e = buckets.get(key);
  if (!e || e.reset <= now) {
    e = { count: 0, reset: now + windowMs };
    buckets.set(key, e);
  }
  e.count++;
  return {
    allowed: e.count <= limit,
    remaining: Math.max(0, limit - e.count),
    resetAt: e.reset,
  };
}
export function _clearRateLimitsForTests() {
  buckets.clear();
}
