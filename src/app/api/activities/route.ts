import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const perPage = 9;

  const supabase = createServiceClient();

  const { count } = await supabase
    .from('activities')
    .select('*', { count: 'exact', head: true });

  const { data: activities } = await supabase
    .from('activities')
    .select('*, activity_registrations(count)')
    .order('activity_date', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  return NextResponse.json({
    activities: (activities || []).map((a) => ({
      ...a,
      registrations_count: a.activity_registrations?.[0]?.count || 0,
    })),
    total: count || 0,
    page,
    perPage,
    totalPages: Math.ceil((count || 0) / perPage),
  });
}
