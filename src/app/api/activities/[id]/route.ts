import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();

  const { data: activity } = await supabase
    .from('activities')
    .select('*, activity_registrations(count)')
    .eq('id', params.id)
    .single();

  if (!activity) {
    return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...activity,
    registrations_count: activity.activity_registrations?.[0]?.count || 0,
  });
}
