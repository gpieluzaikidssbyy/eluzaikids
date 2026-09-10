import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const perPage = 9;

  // Public client + RLS: only the granted columns are readable, so a bug in
  // this route can never expose scan_pin / scan_active or PII.
  const supabase = createPublicClient();

  const { count } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .gte('event_date', new Date().toISOString());

  const { data: events } = await supabase
    .from('events')
    .select('id, title, tema, description, event_date, open_gate, start_time, location, quota, email_enabled, image, map_embed_url, drive_link, registration_deadline')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .range((page - 1) * perPage, page * perPage - 1);

  const counts = new Map<number, number>();
  for (const event of events || []) {
    const { data } = await supabase.rpc('count_registrations', { registrable_type: 'event', registrable_id: event.id });
    counts.set(event.id, Number(data) || 0);
  }

  return NextResponse.json({
    events: (events || []).map((e) => ({
      ...e,
      registrations_count: counts.get(e.id) || 0,
    })),
    total: count || 0,
    page,
    perPage,
    totalPages: Math.ceil((count || 0) / perPage),
  });
}
