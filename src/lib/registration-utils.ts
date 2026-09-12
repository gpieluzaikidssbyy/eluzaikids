import { createServiceClient } from './supabase';

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
 * Normalize Indonesian phone number to consistent 62... format.
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
