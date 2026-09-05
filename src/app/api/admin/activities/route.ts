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

  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();
  const activityDate = String(body.activity_date || '');
  const startTime = String(body.start_time || '');
  const location = String(body.location || '').trim();
  const mapEmbedUrl = String(body.map_embed_url || '').trim();
  const driveLink = String(body.drive_link || '').trim();
  const quotaValue = body.quota;

  if (!title || !description || !activityDate || !startTime || !location || !mapEmbedUrl || !driveLink || quotaValue === null || quotaValue === undefined || quotaValue === '') {
    return NextResponse.json({ message: 'Semua field wajib diisi.' }, { status: 422 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(activityDate)) {
    return NextResponse.json({ message: 'Tanggal activity tidak valid.' }, { status: 422 });
  }
  const quota = Number(quotaValue);
  if (!Number.isInteger(quota) || quota < 1) {
    return NextResponse.json({ message: 'Kuota harus berupa angka bulat minimal 1.' }, { status: 422 });
  }

  const { data, error } = await supabase
    .from('activities')
    .insert({
      title,
      description,
      image: body.image || null,
      drive_link: driveLink,
      activity_date: activityDate,
      start_time: startTime,
      location,
      map_embed_url: mapEmbedUrl,
      quota,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
