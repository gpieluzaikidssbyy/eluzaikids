import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { randomUUID } from 'node:crypto';
import { strictEventSchema } from '@/lib/validations-strict';
import { requireAdmin } from '@/lib/guards';

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireAdmin();
  if (guard.denied) return guard.response;

  const supabase = createServiceClient();
  const { data: events } = await supabase
    .from('events')
    .select('*, event_registrations(count)')
    .order('event_date', { ascending: false });

  return NextResponse.json(
    (events || []).map((e) => ({
      ...e,
      registrations_count: e.event_registrations?.[0]?.count || 0,
    }))
  );
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.denied) return guard.response;

  const supabase = createServiceClient();
  const form = await request.formData();

  // Collect form data into a plain object for Zod validation
  const formDataObj = {
    title: String(form.get('title') || ''),
    tema: String(form.get('tema') || ''),
    description: String(form.get('description') || ''),
    event_date: String(form.get('event_date') || ''),
    open_gate: String(form.get('open_gate') || ''),
    start_time: String(form.get('start_time') || ''),
    location: String(form.get('location') || ''),
    quota: String(form.get('quota') || ''),
    map_embed_url: String(form.get('map_embed_url') || ''),
    drive_link: String(form.get('drive_link') || ''),
    registration_deadline: String(form.get('registration_deadline') || ''),
    email_enabled: form.get('email_enabled') === 'on',
  };

  // Strict server-side validation with Zod
  const validated = strictEventSchema.safeParse(formDataObj);
  if (!validated.success) {
    const errors: Record<string, string> = {};
    validated.error.issues.forEach((issue) => {
      errors[issue.path.join('.')] = issue.message;
    });
    return NextResponse.json({ errors, message: 'Validasi gagal: data tidak valid.' }, { status: 422 });
  }

  const { title, tema, description, event_date, open_gate, start_time, location, quota, map_embed_url, drive_link, registration_deadline, email_enabled } = validated.data;

  // Required field checks (post-validation)
  if (!title || !description || !event_date || !open_gate || !start_time || !location || !registration_deadline) {
    return NextResponse.json({ message: 'Semua field wajib diisi.' }, { status: 422 });
  }

  const poster = form.get('poster');
  if (!(poster instanceof File) || poster.size === 0) {
    return NextResponse.json({ message: 'Poster event wajib diunggah.' }, { status: 422 });
  }

  // File validation
  const extension = poster.name.toLowerCase().split('.').pop();
  const allowedExtensions = ['jpg', 'png', 'webp'];
  if (!extension || !allowedExtensions.includes(extension) || poster.size > 2 * 1024 * 1024) {
    return NextResponse.json({ message: 'Poster harus berformat .jpg, .png, atau .webp dan berukuran maksimal 2 MB.' }, { status: 422 });
  }

  const dimensions = await getImageDimensions(await poster.arrayBuffer(), extension);
  if (!dimensions || dimensions.width * 5 !== dimensions.height * 4) {
    return NextResponse.json({ message: 'Rasio poster harus 4:5.' }, { status: 422 });
  }

  const bucket = 'event-posters';
  await supabase.storage.createBucket(bucket, { public: true }).catch(() => undefined);
  const path = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, poster, {
    contentType: poster.type || `image/${extension === 'jpg' ? 'jpeg' : extension}`,
    upsert: false,
  });
  if (uploadError) return NextResponse.json({ message: `Gagal mengunggah poster: ${uploadError.message}` }, { status: 500 });
  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path);

  const { data, error } = await supabase
    .from('events')
    .insert({
      title,
      tema: tema || null,
      description,
      event_date: `${event_date}T00:00:00+07:00`,
      open_gate: open_gate,
      start_time: start_time || null,
      location,
      quota: quota || null,
      image: publicUrl.publicUrl,
      map_embed_url: map_embed_url || null,
      drive_link: drive_link || null,
      registration_deadline: `${registration_deadline}:00+07:00`,
      email_enabled,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

async function getImageDimensions(buffer: ArrayBuffer, extension: string) {
  const bytes = new Uint8Array(buffer);
  if (extension === 'png' && bytes.length >= 24) {
    return { width: readUint32(bytes, 16), height: readUint32(bytes, 20) };
  }
  if ((extension === 'jpg' || extension === 'jpeg') && bytes.length > 4) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset++; continue; }
      const marker = bytes[offset + 1];
      const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
      if (marker >= 0xc0 && marker <= 0xc3) {
        return { width: (bytes[offset + 7] << 8) | bytes[offset + 8], height: (bytes[offset + 5] << 8) | bytes[offset + 6] };
      }
      offset += 2 + length;
    }
  }
  if (extension === 'webp' && bytes.length >= 30 && readAscii(bytes, 0, 4) === 'RIFF' && readAscii(bytes, 8, 4) === 'WEBP') {
    const chunk = readAscii(bytes, 12, 4);
    if (chunk === 'VP8X') return { width: 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16), height: 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16) };
  }
  return null;
}

function readUint32(bytes: Uint8Array, offset: number) {
  return bytes[offset] * 0x1000000 + ((bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]);
}

function readAscii(bytes: Uint8Array, offset: number, length: number) {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}
