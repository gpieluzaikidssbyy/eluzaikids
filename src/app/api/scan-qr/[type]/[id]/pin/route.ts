import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createScanToken } from '@/lib/auth';

const attempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
  const key = `${ip}:${params.type}:${params.id}`;
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || now > current.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + 60_000 });
  } else if (current.count >= 10) {
    return NextResponse.json({ success: false, message: 'Terlalu banyak percobaan. Silakan coba lagi nanti.' }, { status: 429 });
  } else {
    current.count++;
  }

  const table = params.type === 'event' ? 'events' : params.type === 'activity' ? 'activities' : null;
  if (!table) {
    return NextResponse.json({ success: false, message: 'Event tidak ditemukan.' }, { status: 404 });
  }

  const { data, error } = await createServiceClient()
    .from(table)
    .select('scan_pin, scan_active, title')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, message: 'Event tidak ditemukan.' }, { status: 404 });
  }

  if (!data.scan_active) {
    return NextResponse.json({ success: false, message: 'Scan belum diaktifkan.', title: data.title }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const pin = body?.pin;
  if (typeof pin !== 'string' || !/^\d{6}$/.test(pin)) {
    return NextResponse.json({ success: false, message: 'PIN harus terdiri dari 6 angka.' }, { status: 400 });
  }

  if (typeof data.scan_pin !== 'string' || !/^\d{6}$/.test(data.scan_pin)) {
    return NextResponse.json({ success: false, message: 'PIN scan belum dikonfigurasi.' }, { status: 503 });
  }

  if (data.scan_pin !== pin) {
    return NextResponse.json({ success: false, message: 'PIN salah.', title: data.title }, { status: 401 });
  }

  return NextResponse.json({ success: true, title: data.title, scan_token: createScanToken(params.type as 'event' | 'activity', params.id) });
}
