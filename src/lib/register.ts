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
import { checkCsrf } from '@/lib/csrf';
import { RateLimiter } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/ip';

const registrationLimiter = new RateLimiter(10, 60 * 1000);

export interface RegistrationConfig {
  entityTable: 'events' | 'activities';
  registrationTable: 'event_registrations' | 'activity_registrations';
  idColumn: 'event_id' | 'activity_id';
  typeParam: 'event' | 'activity';
  typeLabel: 'Event' | 'Activity';
  dateField: 'event_date' | 'activity_date';
  notFoundMessage: string;
  quotaFullMessage: string;
  duplicateMessage: string;
  hasEventExtras: boolean;
}

export async function handleRegistration(request: NextRequest, config: RegistrationConfig) {
  if (!(await checkCsrf(request))) {
    return NextResponse.json(
      { message: 'Validasi CSRF gagal. Silakan refresh halaman dan coba lagi.' },
      { status: 403 }
    );
  }

  const ip = getClientIp(request);

  if (!registrationLimiter.check(ip)) {
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

    const { name, phone, email, jumlah_hadir, honeypot, id: entityId, 'g-recaptcha-response': recaptchaToken } = result.data;

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

    const { data: entity } = await supabase
      .from(config.entityTable)
      .select('*')
      .eq('id', entityId)
      .single();

    if (!entity) {
      return NextResponse.json({ message: config.notFoundMessage }, { status: 404 });
    }

    if (!isRegistrationOpen(entity[config.dateField], config.hasEventExtras ? entity.registration_deadline : null)) {
      return NextResponse.json({ message: 'Pendaftaran sudah ditutup.' }, { status: 403 });
    }

    const { count: registeredCount } = await supabase
      .from(config.registrationTable)
      .select('*', { count: 'exact', head: true })
      .eq(config.idColumn, entityId);

    if (entity.quota && (registeredCount ?? 0) >= entity.quota) {
      return NextResponse.json({ message: config.quotaFullMessage }, { status: 403 });
    }

    const normalizedPhone = normalizePhone(phone);
    const isDuplicate = await duplicateExists(
      config.registrationTable,
      config.idColumn,
      entityId,
      normalizedPhone,
      email,
      name,
      ip
    );

    if (isDuplicate) {
      return NextResponse.json(
        { errors: { phone: config.duplicateMessage } },
        { status: 422 }
      );
    }

    const nomorRegistrasi = await generateNomorRegistrasi(config.typeParam, entityId);
    const qrToken = generateQrToken();
    const qrData = `${nomorRegistrasi}.${qrToken}`;

    const { data: registration, error: insertError } = await supabase
      .from(config.registrationTable)
      .insert({
        [config.idColumn]: entityId,
        name,
        phone: normalizedPhone,
        email,
        registration_ip: ip,
        jumlah_hadir,
        nomor_registrasi: nomorRegistrasi,
        qr_token: qrToken,
        registered_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Registration insert error:', insertError.message ?? insertError.code ?? 'unknown error');
      return NextResponse.json({ message: 'Gagal menyimpan pendaftaran.' }, { status: 500 });
    }

    const qrUrl = `${appBaseUrl()}/api/scan-qr/${config.typeParam}/${entityId}/qr/${registration.id}?access=${encodeURIComponent(qrToken)}`;
    const mapsLink = getMapsLink(entity.location);

    if (entity.email_enabled !== false) {
      await sendConfirmationEmail(name, normalizedPhone, email, {
        type: config.typeLabel,
        phone: normalizedPhone,
        email,
        nomor_registrasi: nomorRegistrasi,
        jumlah_hadir,
        qr_data: qrData,
        qr_url: qrUrl,
        title: entity.title,
        tema: config.hasEventExtras ? entity.tema || null : null,
        date: entity[config.dateField],
        open_gate: config.hasEventExtras ? entity.open_gate : null,
        time: entity.start_time,
        location: entity.location,
        maps_link: mapsLink,
        registered_at: registration.registered_at,
      });
    }

    return NextResponse.json({
      message: 'Pendaftaran berhasil!',
      email_enabled: entity.email_enabled !== false,
      qr_url: qrUrl,
      nomor_registrasi: nomorRegistrasi,
    });
  } catch (error) {
    console.error('Registration error:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat memproses pendaftaran.' },
      { status: 500 }
    );
  }
}