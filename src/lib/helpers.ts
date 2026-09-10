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

function normalizeIdentity(value: string): string {
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
 * The sequence comes from an atomic, server-side counter (SECURITY DEFINER
 * function next_registration_seq) so two concurrent requests can never get
 * the same number, and quota is enforced when the counter is allocated.
 */
export async function generateNomorRegistrasi(
  type: 'event' | 'activity',
  id: number
): Promise<string> {
  const supabase = createServiceClient();
  const now = new Date();
  const datePrefix = `ELZ-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-K`;

  const { data, error } = await supabase.rpc('next_registration_seq', {
    registrable_type: type,
    registrable_id: id,
  });

  if (error) {
    if (/quota exceeded/i.test(error.message)) {
      throw new Error('Kuota nomor registrasi sudah habis.');
    }
    throw error;
  }

  const sequence = Number(data);
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error('Gagal membuat nomor registrasi.');
  }

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
 * Member classes.
 */
export const MEMBER_CLASSES = ['Baby', 'Samuel', 'Yosua', 'Musa'] as const;

/**
 * Month names in Indonesian.
 */
export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

/**
 * Day names in Indonesian ordered from Sunday, matching Date#getDay().
 */
export const DAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

/**
 * Shared Tailwind style tokens per member class.
 * The three member admin pages each use a subset of these keys.
 */
export const CLASS_STYLES: Record<
  string,
  { active: string; badge: string; bar: string; gradient: string; hover: string; icon: string }
> = {
  Baby: {
    active: 'border-pink-400 bg-pink-50 dark:bg-pink-950/30',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300',
    bar: 'from-pink-400 to-rose-500',
    gradient: 'from-pink-500 to-rose-600',
    hover: 'hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/30',
    icon: 'bg-pink-100 text-pink-600 dark:bg-pink-950/40',
  },
  Samuel: {
    active: 'border-sky-400 bg-sky-50 dark:bg-sky-950/30',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
    bar: 'from-sky-400 to-blue-500',
    gradient: 'from-sky-500 to-blue-600',
    hover: 'hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30',
    icon: 'bg-sky-100 text-sky-600 dark:bg-sky-950/40',
  },
  Yosua: {
    active: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    bar: 'from-emerald-400 to-teal-500',
    gradient: 'from-emerald-500 to-teal-600',
    hover: 'hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40',
  },
  Musa: {
    active: 'border-violet-400 bg-violet-50 dark:bg-violet-950/30',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    bar: 'from-violet-400 to-purple-500',
    gradient: 'from-violet-500 to-purple-600',
    hover: 'hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30',
    icon: 'bg-violet-100 text-violet-600 dark:bg-violet-950/40',
  },
};

/**
 * Build initials from a display name (max 2 letters, uppercase).
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
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
