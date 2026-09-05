import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { randomUUID } from 'node:crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
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
  const supabase = createServiceClient();
  const form = await request.formData();
  const title = String(form.get('title') || '').trim();
  const description = String(form.get('description') || '').trim();
  const eventDate = String(form.get('event_date') || '');
  const openGate = String(form.get('open_gate') || '');
  const startTime = String(form.get('start_time') || '');
  const location = String(form.get('location') || '').trim();
  const quotaValue = String(form.get('quota') || '');
  const mapEmbedUrl = String(form.get('map_embed_url') || '').trim();
  const driveLink = String(form.get('drive_link') || '').trim();
  const registrationDeadline = String(form.get('registration_deadline') || '');
  const poster = form.get('poster');

  if (!title || !description || !eventDate || !openGate || !startTime || !location || !quotaValue || !mapEmbedUrl || !driveLink || !registrationDeadline || !(poster instanceof File) || poster.size === 0) {
    return NextResponse.json({ message: 'Semua field wajib diisi, termasuk poster event.' }, { status: 422 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    return NextResponse.json({ message: 'Tanggal event tidak valid.' }, { status: 422 });
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(registrationDeadline)) {
    return NextResponse.json({ message: 'Batas pendaftaran tidak valid.' }, { status: 422 });
  }

  const quota = Number(quotaValue);
  if (!Number.isInteger(quota) || quota < 1 || quota > 500) {
    return NextResponse.json({ message: 'Kuota harus berupa angka bulat antara 1 sampai 500.' }, { status: 422 });
  }

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
      description,
      event_date: `${eventDate}T00:00:00+07:00`,
      open_gate: openGate,
      start_time: startTime,
      location,
      quota,
      image: publicUrl.publicUrl,
      map_embed_url: mapEmbedUrl,
      drive_link: driveLink,
      registration_deadline: `${registrationDeadline}:00+07:00`,
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
