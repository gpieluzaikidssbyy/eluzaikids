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
  formatDateIndo,
  appBaseUrl,
} from '@/lib/helpers';
import { sendConfirmationEmail } from '@/lib/email';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // Rate limiting
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // Validate input
    const result = registrationSchema.safeParse(body);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path.join('.');
        errors[field] = issue.message;
      });
      return NextResponse.json({ errors }, { status: 422 });
    }

    const { name, phone, email, jumlah_hadir, honeypot, 'g-recaptcha-response': recaptchaToken } = result.data;

    // Honeypot check
    if (honeypot) {
      return NextResponse.json({ message: 'Pendaftaran berhasil.' });
    }

    // reCAPTCHA verification
    const captchaValid = await verifyRecaptcha(recaptchaToken);
    if (!captchaValid) {
      return NextResponse.json(
        { errors: { 'g-recaptcha-response': 'Verifikasi captcha gagal.' } },
        { status: 422 }
      );
    }

    const supabase = createServiceClient();
    const eventId = body.id;

    // Fetch event
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (!event) {
      return NextResponse.json({ message: 'Event tidak ditemukan.' }, { status: 404 });
    }

    // Check registration deadline
    if (!isRegistrationOpen(event.event_date, event.registration_deadline)) {
      return NextResponse.json({ message: 'Pendaftaran sudah ditutup.' }, { status: 403 });
    }

    // Check quota
    const { count: registeredCount } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    if (event.quota && (registeredCount ?? 0) >= event.quota) {
      return NextResponse.json({ message: 'Kuota pendaftaran untuk event ini sudah penuh.' }, { status: 403 });
    }

    // Check duplicate
    const normalizedPhone = normalizePhone(phone);
    const isDuplicate = await duplicateExists(
      'event_registrations',
      'event_id',
      eventId,
      normalizedPhone,
      email
    );

    if (isDuplicate) {
      return NextResponse.json(
        { errors: { phone: 'Nomor HP atau email ini sudah terdaftar untuk event tersebut.' } },
        { status: 422 }
      );
    }

    // Generate registration number and QR token
    const nomorRegistrasi = await generateNomorRegistrasi('event_registrations', 'event_id', eventId, event.quota);
    const qrToken = generateQrToken();
    const qrData = `${nomorRegistrasi}.${qrToken}`;

    // Create registration
    const { data: registration, error: insertError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
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

    // Send confirmation email
    const qrUrl = `${appBaseUrl()}/api/scan-qr/event/${eventId}/qr/${registration.id}`;
    const mapsLink = getMapsLink(event.location);

    await sendConfirmationEmail(name, normalizedPhone, email, {
      type: 'Event',
      phone: normalizedPhone,
      email,
      nomor_registrasi: nomorRegistrasi,
      jumlah_hadir,
      qr_data: qrData,
      qr_url: qrUrl,
      title: event.title,
      date: event.event_date,
      open_gate: event.open_gate,
      time: event.start_time,
      location: event.location,
      maps_link: mapsLink,
      registered_at: registration.registered_at,
    });

    return NextResponse.json({
      message: 'Pendaftaran berhasil!',
      qr_url: qrUrl,
      nomor_registrasi: nomorRegistrasi,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat memproses pendaftaran.' },
      { status: 500 }
    );
  }
}
