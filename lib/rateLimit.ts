const hits = new Map<string, number[]>();

/**
 * Sliding-window limiter kept in memory. On serverless each instance has its
 * own map, so this is best-effort protection, not a hard guarantee.
 * The limit is generous because a cooperative meeting or a mobile carrier (CGNAT)
 * can put many real farmers behind one IP; bots are stopped by the honeypot.
 * Returns true when the request is allowed.
 */
export function checkRateLimit(key: string, limit = 20, windowMs = 10 * 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  // Keep memory bounded on a long-lived instance.
  if (hits.size > 5000) {
    for (const [k, ts] of hits) if (ts.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return true;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}
