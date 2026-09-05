import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServiceClient();

  const [events, activities, eventRegs, activityRegs, members] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('activities').select('*', { count: 'exact', head: true }),
    supabase.from('event_registrations').select('*', { count: 'exact', head: true }),
    supabase.from('activity_registrations').select('*', { count: 'exact', head: true }),
    supabase.from('members').select('*', { count: 'exact', head: true }),
  ]);

  return NextResponse.json({
    events: events.count || 0,
    activities: activities.count || 0,
    eventRegistrations: eventRegs.count || 0,
    activityRegistrations: activityRegs.count || 0,
    members: members.count || 0,
  });
}
