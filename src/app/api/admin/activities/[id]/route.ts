import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/guards';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard.denied) return guard.response;

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
  const guard = await requireAdmin();
  if (guard.denied) return guard.response;

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
      email_enabled: body.email_enabled !== false,
      show_activity: body.show_activity !== false,
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard.denied) return guard.response;

  const body = await request.json();
  const quota = body.quota;
  if (!Number.isInteger(quota) || quota < 1 || quota > 500) {
    return NextResponse.json({ message: 'Kuota harus berupa angka bulat antara 1 sampai 500.' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { count } = await supabase
    .from('activity_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('activity_id', params.id);

  if ((count || 0) > quota) {
    return NextResponse.json({ message: `Kuota tidak boleh lebih kecil dari ${count} pendaftar.` }, { status: 422 });
  }

  const { data, error } = await supabase
    .from('activities')
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
  const guard = await requireAdmin();
  if (guard.denied) return guard.response;

  const supabase = createServiceClient();
  const { error } = await supabase.from('activities').delete().eq('id', params.id);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Deleted' });
}
