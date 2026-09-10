/**
 * Extract the client IP from a request.
 * Prefer `x-real-ip` (set by the hosting proxy, cannot be spoofed) over
 * `x-forwarded-for`, which consists of values appended by each hop and is
 * user controlled when there is no trusted proxy in front.
 */
export function getClientIp(request: Request): string {
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  return 'unknown';
}