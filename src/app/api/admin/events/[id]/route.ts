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
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...event,
    registrations_count: event.event_registrations?.[0]?.count || 0,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();
  const body = await request.json();
  const quota = body.quota === null || body.quota === undefined || body.quota === '' ? null : Number(body.quota);
  const eventDate = String(body.event_date || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    return NextResponse.json({ message: 'Tanggal event tidak valid.' }, { status: 422 });
  }
  if (quota !== null && (!Number.isInteger(quota) || quota < 1 || quota > 500)) {
    return NextResponse.json({ message: 'Kuota harus berupa angka bulat antara 1 sampai 500.' }, { status: 422 });
  }

  const { data, error } = await supabase
    .from('events')
    .update({
      title: body.title,
      description: body.description || null,
      event_date: `${eventDate}T00:00:00+07:00`,
      open_gate: body.open_gate || null,
      start_time: body.start_time || null,
      location: body.location || null,
      quota,
      image: body.image || null,
      map_embed_url: body.map_embed_url || null,
      drive_link: body.drive_link || null,
      registration_deadline: body.registration_deadline || null,
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const quota = body.quota;
  if (!Number.isInteger(quota) || quota < 1 || quota > 500) {
    return NextResponse.json({ message: 'Kuota harus berupa angka bulat antara 1 sampai 500.' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { count } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', params.id);

  if ((count || 0) > quota) {
    return NextResponse.json({ message: `Kuota tidak boleh lebih kecil dari ${count} pendaftar.` }, { status: 422 });
  }

  const { data, error } = await supabase
    .from('events')
    .update({ quota })
    .eq('id', params.id)
    .select('id, quota')
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();
  const { error } = await supabase.from('events').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Deleted' });
}
