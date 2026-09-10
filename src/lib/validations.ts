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
  id: z.coerce
    .number({ invalid_type_error: 'Data registrasi tidak valid.' })
    .int('Data registrasi tidak valid.')
    .positive('Data registrasi tidak valid.'),
  'g-recaptcha-response': z
    .string()
    .min(1, 'Verifikasi captcha wajib diselesaikan.'),
});

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
