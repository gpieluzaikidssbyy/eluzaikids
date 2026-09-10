import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createPublicClient();

  const { data: activity } = await supabase
    .from('activities')
    .select('id, title, description, image, drive_link, activity_date, start_time, location, map_embed_url, quota, email_enabled')
    .eq('id', params.id)
    .single();

  if (!activity) {
    return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
  }

  const { data: countData } = await supabase.rpc('count_registrations', { registrable_type: 'activity', registrable_id: activity.id });

  return NextResponse.json({
    ...activity,
    registrations_count: Number(countData) || 0,
  });
}
