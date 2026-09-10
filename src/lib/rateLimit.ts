type Entry = { count: number; resetAt: number };

/**
 * In-memory sliding fixed-window rate limiter.
 * Bounded and self-pruning to avoid unbounded memory growth.
 * Note: one instance lives per serverless instance; for a hard, distributed
 * limit this must be backed by shared storage (e.g. Postgres/Redis).
 */
const MAX_ENTRIES = 10_000;

export class RateLimiter {
  private readonly map = new Map<string, Entry>();

  constructor(
    private readonly defaultMax: number,
    private readonly defaultWindowMs: number
  ) {}

  check(key: string, max: number = this.defaultMax, windowMs: number = this.defaultWindowMs): boolean {
    const now = Date.now();
    if (this.map.size >= MAX_ENTRIES) this.prune(now);

    const entry = this.map.get(key);

    if (!entry || now > entry.resetAt) {
      this.map.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (entry.count >= max) return false;

    entry.count++;
    return true;
  }

  prune(now = Date.now()): void {
    for (const [key, entry] of this.map) {
      if (now > entry.resetAt) this.map.delete(key);
    }
  }
}