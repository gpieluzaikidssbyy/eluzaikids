import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { strictActivitySchema } from '@/lib/validations-strict';
import { requireAdmin } from '@/lib/guards';

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireAdmin();
  if (guard.denied) return guard.response;

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
  const guard = await requireAdmin();
  if (guard.denied) return guard.response;

  const supabase = createServiceClient();
  const body = await request.json();

  // Strict server-side validation with Zod
  const validated = strictActivitySchema.safeParse(body);
  if (!validated.success) {
    const errors: Record<string, string> = {};
    validated.error.issues.forEach((issue) => {
      errors[issue.path.join('.')] = issue.message;
    });
    return NextResponse.json({ errors, message: 'Validasi gagal: data tidak valid.' }, { status: 422 });
  }

  const { title, tema, description, image, drive_link, activity_date, start_time, location, map_embed_url, quota, email_enabled } = validated.data;

  // Required field checks (post-validation)
  if (!title || !description || !activity_date || !start_time || !location || !map_embed_url || !drive_link || quota === null || quota === undefined) {
    return NextResponse.json({ message: 'Semua field wajib diisi.' }, { status: 422 });
  }

  const { data, error } = await supabase
    .from('activities')
    .insert({
      title,
      tema: tema || null,
      description,
      image: image || null,
      drive_link,
      activity_date,
      start_time: start_time || null,
      location,
      map_embed_url,
      quota,
      email_enabled,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
