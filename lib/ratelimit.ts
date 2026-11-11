/* Tiny in-memory limiter for the public forms. It resets when the server
   restarts, which is fine for a single Hostinger Node process. */
const hits = new Map<string, number[]>();

export function tooMany(key: string, max = 6, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter(t => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) { for (const [k, v] of hits) if (!v.some(t => now - t < windowMs)) hits.delete(k); }
  return recent.length > max;
}

export function clientIp(req: Request): string {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}
