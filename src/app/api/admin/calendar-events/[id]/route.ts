import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();
  const body = await request.json();

  const title = (body.title || '').trim();
  if (!title) return NextResponse.json({ message: 'Judul wajib diisi.' }, { status: 400 });
  if (title.length > 255) return NextResponse.json({ message: 'Judul maksimal 255 karakter.' }, { status: 400 });

  const { data, error } = await supabase
    .from('calendar_events')
    .update({
      title,
      description: body.description?.trim() || null,
      event_date: body.event_date,
      start_time: body.start_time || null,
      updated_at: new Date().toISOString(),
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
  const { error } = await supabase.from('calendar_events').delete().eq('id', params.id);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Deleted' });
}