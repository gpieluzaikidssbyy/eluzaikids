import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { registrationSchema } from '@/lib/validations';
import {
  normalizePhone,
  generateNomorRegistrasi,
  generateQrToken,
  isRegistrationOpen,
  duplicateExists,
  verifyRecaptcha,
  getMapsLink,
  appBaseUrl,
} from '@/lib/helpers';
import { sendConfirmationEmail } from '@/lib/email';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    const result = registrationSchema.safeParse(body);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path.join('.')] = issue.message;
      });
      return NextResponse.json({ errors }, { status: 422 });
    }

    const { name, phone, email, jumlah_hadir, honeypot, 'g-recaptcha-response': recaptchaToken } = result.data;

    if (honeypot) {
      return NextResponse.json({ message: 'Pendaftaran berhasil.' });
    }

    const captchaValid = await verifyRecaptcha(recaptchaToken);
    if (!captchaValid) {
      return NextResponse.json(
        { errors: { 'g-recaptcha-response': 'Verifikasi captcha gagal.' } },
        { status: 422 }
      );
    }

    const supabase = createServiceClient();
    const activityId = body.id;

    const { data: activity } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityId)
      .single();

    if (!activity) {
      return NextResponse.json({ message: 'Kegiatan tidak ditemukan.' }, { status: 404 });
    }

    if (!isRegistrationOpen(activity.activity_date, null)) {
      return NextResponse.json({ message: 'Pendaftaran sudah ditutup.' }, { status: 403 });
    }

    const { count: registeredCount } = await supabase
      .from('activity_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('activity_id', activityId);

    if (activity.quota && (registeredCount ?? 0) >= activity.quota) {
      return NextResponse.json({ message: 'Kuota pendaftaran untuk kegiatan ini sudah penuh.' }, { status: 403 });
    }

    const normalizedPhone = normalizePhone(phone);
    const isDuplicate = await duplicateExists('activity_registrations', 'activity_id', activityId, normalizedPhone, email);

    if (isDuplicate) {
      return NextResponse.json(
        { errors: { phone: 'Nomor HP atau email ini sudah terdaftar untuk kegiatan tersebut.' } },
        { status: 422 }
      );
    }

    const nomorRegistrasi = await generateNomorRegistrasi('activity_registrations', activity.quota);
    const qrToken = generateQrToken();
    const qrData = `${nomorRegistrasi}.${qrToken}`;

    const { data: registration, error: insertError } = await supabase
      .from('activity_registrations')
      .insert({
        activity_id: activityId,
        name,
        phone: normalizedPhone,
        email,
        jumlah_hadir,
        nomor_registrasi: nomorRegistrasi,
        qr_token: qrToken,
        registered_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Registration insert error:', insertError);
      return NextResponse.json({ message: 'Gagal menyimpan pendaftaran.' }, { status: 500 });
    }

    const qrUrl = `${appBaseUrl()}/api/scan-qr/activity/${activityId}/qr/${registration.id}`;
    const mapsLink = getMapsLink(activity.location);

    await sendConfirmationEmail(name, normalizedPhone, email, {
      type: 'Activity',
      phone: normalizedPhone,
      email,
      nomor_registrasi: nomorRegistrasi,
      jumlah_hadir,
      qr_data: qrData,
      qr_url: qrUrl,
      title: activity.title,
      date: activity.activity_date,
      open_gate: null,
      time: activity.start_time,
      location: activity.location,
      maps_link: mapsLink,
      registered_at: registration.registered_at,
    });

    return NextResponse.json({ message: 'Pendaftaran berhasil!' });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat memproses pendaftaran.' },
      { status: 500 }
    );
  }
}
