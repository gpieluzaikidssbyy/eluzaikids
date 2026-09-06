import { z } from 'zod';

/**
 * Registration form validation schema.
 * Matches StoreEventRegistrationRequest / StoreActivityRegistrationRequest from Laravel.
 */
export const registrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama pendaftar wajib diisi.')
    .max(255, 'Nama maksimal 255 karakter.')
    .regex(
      /^[\p{L}][\p{L}\s'.-]*$/u,
      'Nama hanya boleh berisi huruf (tanpa simbol atau emoji).'
    ),
  phone: z
    .string()
    .trim()
    .min(1, 'Nomor HP wajib diisi.')
    .regex(
      /^08[1-9][0-9]{7,10}$/,
      'Nomor HP hanya boleh berisi angka dengan format 08xxxxxxxx (contoh: 0812345678).'
    ),
  email: z
    .string()
    .trim()
    .min(1, 'Email wajib diisi.')
    .email('Format email tidak valid.')
    .refine(
      (value) => /@(gmail|email)\.com$/i.test(value),
      'Email harus menggunakan domain @gmail.com atau @email.com.'
    ),
  jumlah_hadir: z
    .coerce
    .number({ invalid_type_error: 'Jumlah yang hadir wajib diisi.' })
    .int()
    .min(1, 'Jumlah yang hadir minimal 1.')
    .max(8, 'Jumlah yang hadir maksimal 8.'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Anda harus menyetujui data digunakan untuk keperluan pendaftaran.' }),
  }),
  honeypot: z.string().max(0, 'Terdeteksi sebagai bot.').optional().or(z.literal('')),
  'g-recaptcha-response': z
    .string()
    .min(1, 'Verifikasi captcha wajib diselesaikan.'),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

/**
 * Event admin form validation schema.
 */
export const eventSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi.').max(255),
  description: z.string().optional().nullable(),
  event_date: z.string().min(1, 'Tanggal event wajib diisi.'),
  open_gate: z.string().optional().nullable(),
  start_time: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  quota: z.coerce.number().int().positive().optional().nullable(),
  image: z.string().optional().nullable(),
  map_embed_url: z.string().url('URL tidak valid.').optional().nullable(),
  drive_link: z.string().url('URL tidak valid.').optional().nullable(),
  registration_deadline: z.string().optional().nullable(),
});

export type EventFormData = z.infer<typeof eventSchema>;

/**
 * Activity admin form validation schema.
 */
export const activitySchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi.').max(255),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  drive_link: z.string().url('URL tidak valid.').optional().nullable(),
  activity_date: z.string().optional().nullable(),
  start_time: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  map_embed_url: z.string().url('URL tidak valid.').optional().nullable(),
  quota: z.coerce.number().int().positive().optional().nullable(),
});

export type ActivityFormData = z.infer<typeof activitySchema>;

/**
 * Schedule admin form validation schema.
 */
export const scheduleSchema = z.object({
  day: z.string().min(1, 'Hari wajib diisi.'),
  time: z.string().min(1, 'Jam wajib diisi.'),
  type: z.string().min(1, 'Tipe wajib diisi.'),
  description: z.string().optional().nullable(),
  show_schedule: z.coerce.boolean(),
});

export type ScheduleFormData = z.infer<typeof scheduleSchema>;

/**
 * Member admin form validation schema.
 */
export const memberSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi.').max(255),
  class: z.enum(['Baby', 'Samuel', 'Yosua', 'Musa'], {
    errorMap: () => ({ message: 'Kelas wajib dipilih.' }),
  }),
});

export type MemberFormData = z.infer<typeof memberSchema>;

/**
 * Church info form validation schema.
 */
export const churchInfoSchema = z.object({
  address: z.string().min(1, 'Alamat wajib diisi.'),
  map_embed_url: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email('Format email tidak valid.').optional().nullable(),
  instagram_url: z.string().url('URL tidak valid.').optional().nullable(),
  youtube_url: z.string().url('URL tidak valid.').optional().nullable(),
});

export type ChurchInfoFormData = z.infer<typeof churchInfoSchema>;

/**
 * PIN verification schema for QR scan.
 */
export const pinSchema = z.object({
  pin: z.string().length(6, 'PIN harus 6 digit.'),
});

export type PinFormData = z.infer<typeof pinSchema>;
