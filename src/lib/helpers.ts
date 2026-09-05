import { createServiceClient } from './supabase';

/**
 * Normalize Indonesian phone number to consistent 62... format.
 * Matches RegistrationController::normalizePhone from Laravel.
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }

  if (digits.startsWith('62')) {
    return digits;
  }

  return digits;
}

/**
 * Generate registration number with format ELZ-YYMMDD-XXXX.
 * Sequential number is bounded by quota if set.
 */
export async function generateNomorRegistrasi(
  table: 'event_registrations' | 'activity_registrations',
  quota: number | null
): Promise<string> {
  const supabase = createServiceClient();
  const now = new Date();
  const datePrefix = `ELZ-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-`;

  const todayPrefix = `${datePrefix}%`;

  const { count } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .like('nomor_registrasi', todayPrefix);

  if (quota !== null && (count ?? 0) >= quota) {
    throw new Error('Kuota nomor registrasi untuk hari ini sudah habis.');
  }

  const sequence = (count ?? 0) + 1;
  return datePrefix + String(sequence).padStart(4, '0');
}

/**
 * Generate a random QR token.
 */
export function generateQrToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Format date to Indonesian locale.
 */
export function formatDateIndo(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format time to WIB.
 */
export function formatTimeWib(time: string): string {
  return `${time} WIB`;
}

/**
 * Check if registration is still open.
 * Default deadline is H-2 from event/activity date.
 */
export function isRegistrationOpen(
  eventDate: string,
  registrationDeadline?: string | null
): boolean {
  const deadline = registrationDeadline
    ? new Date(registrationDeadline)
    : new Date(new Date(eventDate).getTime() - 2 * 24 * 60 * 60 * 1000);

  return new Date() <= deadline;
}

/**
 * Calculate remaining quota.
 */
export function remainingQuota(
  quota: number | null,
  registered: number
): number | null {
  if (quota === null) return null;
  return Math.max(0, quota - registered);
}

/**
 * Get Google Maps search link from location text.
 */
export function getMapsLink(location: string | null): string | null {
  if (!location) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

/**
 * Check for duplicate registration.
 */
export async function duplicateExists(
  table: 'event_registrations' | 'activity_registrations',
  foreignKey: 'event_id' | 'activity_id',
  id: number,
  phone: string,
  email?: string | null
): Promise<boolean> {
  const supabase = createServiceClient();
  const normalizedPhone = normalizePhone(phone);

  let query = supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq(foreignKey, id)
    .eq('phone', normalizedPhone);

  if (email) {
    query = query.or(`email.eq.${email}`);
  }

  const { count } = await query;
  return (count ?? 0) > 0;
}

/**
 * Get week day names in Indonesian.
 */
export const WEEKDAYS = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
] as const;

/**
 * Schedule types.
 */
export const SCHEDULE_TYPES = ['Ibadah', 'Latihan'] as const;

/**
 * Member classes.
 */
export const MEMBER_CLASSES = ['Baby', 'Samuel', 'Yosua', 'Musa'] as const;

/**
 * WhatsApp link from phone number.
 */
export function getWhatsAppLink(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}`;
}

/**
 * Verify reCAPTCHA response with Google API.
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) return true; // Skip in dev if not configured

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
}
