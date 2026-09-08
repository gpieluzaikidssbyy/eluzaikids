import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  const title = (body.title || '').trim();
  if (!title) return NextResponse.json({ message: 'Judul wajib diisi.' }, { status: 400 });
  if (title.length > 255) return NextResponse.json({ message: 'Judul maksimal 255 karakter.' }, { status: 400 });
  if (!body.event_date) return NextResponse.json({ message: 'Tanggal wajib diisi.' }, { status: 400 });

  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      title,
      description: body.description?.trim() || null,
      event_date: body.event_date,
      start_time: body.start_time || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}