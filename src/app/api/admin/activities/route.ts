import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServiceClient();
  const { data: activities } = await supabase
    .from('activities')
    .select('*, activity_registrations(count)')
    .order('activity_date', { ascending: false });

  return NextResponse.json(
    (activities || []).map((a) => ({
      ...a,
      registrations_count: a.activity_registrations?.[0]?.count || 0,
    }))
  );
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('activities')
    .insert({
      title: body.title,
      description: body.description || null,
      image: body.image || null,
      drive_link: body.drive_link || null,
      activity_date: body.activity_date || null,
      start_time: body.start_time || null,
      location: body.location || null,
      map_embed_url: body.map_embed_url || null,
      quota: body.quota || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
