import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { createServiceClient } from '@/lib/supabase';
import { createScanToken } from '@/lib/auth';
import { RateLimiter } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/ip';

const pinLimiter = new RateLimiter(10, 60 * 1000);

// Persistent per-event lockout (Postgres) so distributed brute force and
// cold starts cannot bypass it.
const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  const ip = getClientIp(request);
  const key = `${ip}:${params.type}:${params.id}`;
  if (!pinLimiter.check(key)) {
    return NextResponse.json({ success: false, message: 'Terlalu banyak percobaan. Silakan coba lagi nanti.' }, { status: 429 });
  }

  const table = params.type === 'event' ? 'events' : params.type === 'activity' ? 'activities' : null;
  if (!table) {
    return NextResponse.json({ success: false, message: 'Event tidak ditemukan.' }, { status: 404 });
  }

  const eventId = Number(params.id);
  if (!Number.isInteger(eventId) || eventId < 1) {
    return NextResponse.json({ success: false, message: 'Event tidak ditemukan.' }, { status: 404 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(table)
    .select('scan_pin, scan_active, title, pin_failed_attempts, pin_locked_until')
    .eq('id', eventId)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, message: 'Event tidak ditemukan.' }, { status: 404 });
  }

  if (!data.scan_active) {
    return NextResponse.json({ success: false, message: 'Scan belum diaktifkan.', title: data.title }, { status: 403 });
  }

  if (data.pin_locked_until && new Date(data.pin_locked_until).getTime() > Date.now()) {
    return NextResponse.json({ success: false, message: 'Terlalu banyak percobaan. Silakan coba lagi nanti.' }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const pin = body?.pin;
  if (typeof pin !== 'string' || !/^\d{6}$/.test(pin)) {
    return NextResponse.json({ success: false, message: 'PIN harus terdiri dari 6 angka.' }, { status: 400 });
  }

  if (typeof data.scan_pin !== 'string' || !/^\d{6}$/.test(data.scan_pin)) {
    return NextResponse.json({ success: false, message: 'PIN scan belum dikonfigurasi.' }, { status: 503 });
  }

  // Constant-time comparison to prevent timing enumeration.
  const expected = Buffer.from(data.scan_pin);
  const supplied = Buffer.from(pin);
  const pinMatches = expected.length === supplied.length && timingSafeEqual(expected, supplied);

  if (!pinMatches) {
    const attempts = (data.pin_failed_attempts ?? 0) + 1;
    const lock = attempts >= MAX_PIN_ATTEMPTS;
    await supabase
      .from(table)
      .update({
        pin_failed_attempts: lock ? 0 : attempts,
        pin_locked_until: lock ? new Date(Date.now() + LOCKOUT_MS).toISOString() : data.pin_locked_until,
      })
      .eq('id', eventId);
    return NextResponse.json({ success: false, message: 'PIN salah.' }, { status: 401 });
  }

  // Success: clear the failure counter (never leaks to clients).
  await supabase
    .from(table)
    .update({ pin_failed_attempts: 0, pin_locked_until: null })
    .eq('id', eventId);

  return NextResponse.json({ success: true, title: data.title, scan_token: createScanToken(params.type as 'event' | 'activity', String(eventId)) });
}
