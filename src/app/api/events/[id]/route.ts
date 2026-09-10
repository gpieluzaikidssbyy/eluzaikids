import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createPublicClient();

  const { data: event } = await supabase
    .from('events')
    .select('id, title, tema, description, event_date, open_gate, start_time, location, quota, email_enabled, image, map_embed_url, drive_link, registration_deadline')
    .eq('id', params.id)
    .single();

  if (!event) {
    return NextResponse.json({ message: 'Event not found' }, { status: 404 });
  }

  const { data: countData } = await supabase.rpc('count_registrations', { registrable_type: 'event', registrable_id: event.id });

  return NextResponse.json({
    ...event,
    registrations_count: Number(countData) || 0,
  });
}
