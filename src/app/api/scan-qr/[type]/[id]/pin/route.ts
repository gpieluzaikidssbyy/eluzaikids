import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  const { pin } = await request.json();
  const table = params.type === 'event' ? 'events' : params.type === 'activity' ? 'activities' : null;

  if (!table || (String(pin || '') && !/^\d{6}$/.test(String(pin)))) {
    return NextResponse.json({ success: false, message: 'PIN harus terdiri dari 6 angka.' }, { status: 400 });
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
    return NextResponse.json({ success: false, message: 'Scan belum diaktifkan.' }, { status: 403 });
  }

  if (data.scan_pin !== pin) {
    return NextResponse.json({ success: false, message: 'PIN salah.', title: data.title }, { status: 401 });
  }

  return NextResponse.json({ success: true, title: data.title });
}
