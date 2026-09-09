import { createServiceClient } from './supabase';

/**
 * Base URL of the app without any trailing slash.
 * Guards against double slashes when env value ends with '/'.
 */
export function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/+$/, '');
}

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

export function normalizeIdentity(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return Math.min(a.length, b.length) / Math.max(a.length, b.length);

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return 1 - previous[b.length] / Math.max(a.length, b.length);
}

/**
 * Generate registration number with format ELZ-YYMMDD-KXXX.
 * YYMMDD is the registration date; K stands for Kids; XXX is a sequential
 * number (001..quota) cumulative per event/activity.
 */
export async function generateNomorRegistrasi(
  table: 'event_registrations' | 'activity_registrations',
  foreignKey: 'event_id' | 'activity_id',
  id: number,
  quota: number | null
): Promise<string> {
  const supabase = createServiceClient();
  const now = new Date();
  const datePrefix = `ELZ-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-K`;

  const { count } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq(foreignKey, id);

  if (quota !== null && (count ?? 0) >= quota) {
    throw new Error('Kuota nomor registrasi sudah habis.');
  }

  const sequence = (count ?? 0) + 1;
  return datePrefix + String(sequence).padStart(3, '0');
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
 * Format time to WIB (HH:MM WIB, without seconds).
 */
export function formatTimeWib(time: string): string {
  return `${time.slice(0, 5)} WIB`;
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
  email?: string | null,
  name?: string | null,
  ip?: string | null,
): Promise<boolean> {
  const supabase = createServiceClient();
  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = email?.trim().toLowerCase() || '';
  const normalizedName = normalizeIdentity(name || '');

  const { data, error } = await supabase
    .from(table)
    .select('phone, email, name, registration_ip')
    .eq(foreignKey, id);

  if (error) throw error;

  return (data || []).some((registration) => {
    const existingEmail = String(registration.email || '').trim().toLowerCase();
    const existingName = normalizeIdentity(String(registration.name || ''));
    const sameIp = Boolean(ip && ip !== 'unknown' && registration.registration_ip && registration.registration_ip === ip);
    const similarName = normalizedName.length >= 5 && similarity(normalizedName, existingName) >= 0.9;
    const similarEmail = normalizedEmail.length >= 6 && similarity(normalizedEmail, existingEmail) >= 0.96;

    return (
      registration.phone === normalizedPhone ||
      sameIp ||
      similarName ||
      similarEmail
    );
  });
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
  if (!secretKey) {
    // Dev: skip if not configured. Production: fail closed so bot protection
    // cannot be silently disabled.
    return process.env.NODE_ENV !== 'production';
  }

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
