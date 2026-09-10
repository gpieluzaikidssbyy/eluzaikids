import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Public status probe for the scan page. Exposes only whether scanning is
 * active and the public title; the PIN itself is only ever checked via POST
 * /pin. No rate limit here so a normal page load never burns the PIN budget.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  const table = params.type === 'event' ? 'events' : params.type === 'activity' ? 'activities' : null;
  if (!table) {
    return NextResponse.json({ success: false, message: 'Event tidak ditemukan.' }, { status: 404 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ success: false, message: 'Event tidak ditemukan.' }, { status: 404 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(table)
    .select('scan_active, title')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, message: 'Event tidak ditemukan.' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    scan_active: data.scan_active === true,
    title: data.title,
  });
}