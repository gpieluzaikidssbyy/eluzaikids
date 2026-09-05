import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServiceClient();
  const { data: events } = await supabase
    .from('events')
    .select('*, event_registrations(count)')
    .order('event_date', { ascending: false });

  return NextResponse.json(
    (events || []).map((e) => ({
      ...e,
      registrations_count: e.event_registrations?.[0]?.count || 0,
    }))
  );
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('events')
    .insert({
      title: body.title,
      description: body.description || null,
      event_date: body.event_date,
      open_gate: body.open_gate || null,
      start_time: body.start_time || null,
      location: body.location || null,
      quota: body.quota || null,
      image: body.image || null,
      map_embed_url: body.map_embed_url || null,
      drive_link: body.drive_link || null,
      registration_deadline: body.registration_deadline || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
