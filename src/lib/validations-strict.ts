import { z } from 'zod';

/**
 * Strict event admin form validation schema for server-side use.
 * This provides stronger validation than the client-side schema.
 */
export const strictEventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Judul wajib diisi.')
    .max(255, 'Judul maksimal 255 karakter.')
    .regex(
      /^[^\s<>"']+$/,
      'Judul tidak boleh mengandung karakter tersembunyi atau simbol berbahaya.'
    ),
  tema: z
    .string()
    .trim()
    .max(255, 'Tema maksimal 255 karakter.')
    .optional()
    .nullable(),
  description: z
    .string()
    .trim()
    .max(5000, 'Deskripsi maksimal 5000 karakter.')
    .regex(/^[\s\S]*$/, 'Deskripsi tidak valid.')
    .optional()
    .nullable(),
  event_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal event tidak valid (YYYY-MM-DD).')
    .refine((date) => {
      const parsed = new Date(date + 'T00:00:00');
      return !isNaN(parsed.getTime()) && parsed.getFullYear() >= 2020 && parsed.getFullYear() <= 2030;
    }, 'Tanggal event tidak valid.'),
  open_gate: z
    .string()
    .trim()
    .max(10, 'Open gate maksimal 10 karakter.')
    .optional()
    .nullable(),
  start_time: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, 'Format waktu tidak valid (HH:MM).')
    .optional()
    .nullable(),
  location: z
    .string()
    .trim()
    .min(1, 'Lokasi wajib diisi.')
    .max(500, 'Lokasi maksimal 500 karakter.')
    .regex(/^[^\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+$/, 'Lokasi mengandung karakter tidak valid.')
    .optional()
    .nullable(),
  quota: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => {
      const num = Number(val);
      if (isNaN(num)) return null;
      if (num < 1 || num > 500) return null;
      return num;
    }),
  map_embed_url: z
    .string()
    .trim()
    .url('URL embed peta tidak valid.')
    .optional()
    .nullable(),
  drive_link: z
    .string()
    .trim()
    .url('Link Google Drive tidak valid.')
    .optional()
    .nullable(),
  registration_deadline: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Format batas pendaftaran tidak valid (YYYY-MM-DDTHH:MM).')
    .optional()
    .nullable(),
  email_enabled: z.boolean().optional().default(true),
});

/**
 * Strict activity admin form validation schema for server-side use.
 */
export const strictActivitySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Judul wajib diisi.')
    .max(255, 'Judul maksimal 255 karakter.')
    .regex(
      /^[^\s<>"']+$/,
      'Judul tidak boleh mengandung karakter tersembunyi atau simbol berbahaya.'
    ),
  description: z
    .string()
    .trim()
    .max(5000, 'Deskripsi maksimal 5000 karakter.')
    .optional()
    .nullable(),
  image: z.string().optional().nullable(),
  drive_link: z
    .string()
    .trim()
    .url('Link Google Drive tidak valid.')
    .optional()
    .nullable(),
  activity_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal kegiatan tidak valid (YYYY-MM-DD).')
    .optional()
    .nullable(),
  start_time: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, 'Format waktu tidak valid (HH:MM).')
    .optional()
    .nullable(),
  location: z
    .string()
    .trim()
    .max(500, 'Lokasi maksimal 500 karakter.')
    .regex(/^[^\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+$/, 'Lokasi mengandung karakter tidak valid.')
    .optional()
    .nullable(),
  map_embed_url: z
    .string()
    .trim()
    .url('URL embed peta tidak valid.')
    .optional()
    .nullable(),
  quota: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => {
      const num = Number(val);
      if (isNaN(num)) return null;
      if (num < 1) return null;
      return num;
    }),
  email_enabled: z.boolean().optional().default(true),
});
