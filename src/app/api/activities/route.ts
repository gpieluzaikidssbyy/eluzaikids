import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const perPage = 9;

  // Public client + RLS: only granted columns are readable.
  const supabase = createPublicClient();

  // Count on a granted column (anon has column-level grants, so `select('*')`
  // would be denied and the count would silently be 0 -> no pagination).
  const { count } = await supabase
    .from('activities')
    .select('id', { count: 'exact', head: true });

  const { data: activities } = await supabase
    .from('activities')
    .select('id, title, description, image, drive_link, activity_date, start_time, location, map_embed_url, quota, email_enabled')
    .order('activity_date', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  const counts = new Map<number, number>();
  for (const activity of activities || []) {
    const { data } = await supabase.rpc('count_registrations', { registrable_type: 'activity', registrable_id: activity.id });
    counts.set(activity.id, Number(data) || 0);
  }

  return NextResponse.json({
    activities: (activities || []).map((a) => ({
      ...a,
      registrations_count: counts.get(a.id) || 0,
    })),
    total: count || 0,
    page,
    perPage,
    totalPages: Math.ceil((count || 0) / perPage),
  });
}
