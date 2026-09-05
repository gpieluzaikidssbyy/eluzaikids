import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('activities')
    .select('*, activity_registrations(count)')
    .eq('id', params.id)
    .single();

  if (!data) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  return NextResponse.json({
    ...data,
    registrations_count: data.activity_registrations?.[0]?.count || 0,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('activities')
    .update({
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
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();
  const { error } = await supabase.from('activities').delete().eq('id', params.id);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Deleted' });
}
