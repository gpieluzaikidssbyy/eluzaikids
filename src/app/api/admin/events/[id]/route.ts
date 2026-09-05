import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();
  const { data: event } = await supabase
    .from('events')
    .select('*, event_registrations(count)')
    .eq('id', params.id)
    .single();

  if (!event) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...event,
    registrations_count: event.event_registrations?.[0]?.count || 0,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('events')
    .update({
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
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();
  const { error } = await supabase.from('events').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Deleted' });
}
