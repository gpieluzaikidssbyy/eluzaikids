import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const perPage = 9;

  const supabase = createServiceClient();

  const { count } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .gte('event_date', new Date().toISOString());

  const { data: events } = await supabase
    .from('events')
    .select('*, event_registrations(count)')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .range((page - 1) * perPage, page * perPage - 1);

  return NextResponse.json({
    events: (events || []).map((e) => ({
      ...e,
      registrations_count: e.event_registrations?.[0]?.count || 0,
    })),
    total: count || 0,
    page,
    perPage,
    totalPages: Math.ceil((count || 0) / perPage),
  });
}
