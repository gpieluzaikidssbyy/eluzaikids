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
    return NextResponse.json({ message: 'Event not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...event,
    registrations_count: event.event_registrations?.[0]?.count || 0,
  });
}
