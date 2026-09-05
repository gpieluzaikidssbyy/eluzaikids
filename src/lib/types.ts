/**
 * Database types matching Supabase schema.
 * These types mirror the Laravel models.
 */

export interface Schedule {
  id: number;
  day: string;
  time: string;
  type: string;
  description: string | null;
  show_schedule: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  open_gate: string | null;
  start_time: string | null;
  location: string | null;
  quota: number | null;
  image: string | null;
  map_embed_url: string | null;
  drive_link: string | null;
  registration_deadline: string | null;
  scan_pin: string | null;
  scan_active: boolean;
  created_at: string;
  updated_at: string;
  registrations_count?: number;
}

export interface Activity {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  drive_link: string | null;
  activity_date: string | null;
  start_time: string | null;
  location: string | null;
  map_embed_url: string | null;
  quota: number | null;
  scan_pin: string | null;
  scan_active: boolean;
  created_at: string;
  updated_at: string;
  registrations_count?: number;
}

export interface EventRegistration {
  id: number;
  event_id: number;
  name: string;
  phone: string;
  email: string | null;
  jumlah_hadir: number;
  nomor_registrasi: string;
  qr_token: string;
  scanned_at: string | null;
  registered_at: string;
  hadir: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityRegistration {
  id: number;
  activity_id: number;
  name: string;
  phone: string;
  email: string | null;
  jumlah_hadir: number;
  nomor_registrasi: string;
  qr_token: string;
  scanned_at: string | null;
  registered_at: string;
  hadir: boolean;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: number;
  name: string;
  class: 'Baby' | 'Samuel' | 'Yosua' | 'Musa';
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: number;
  member_id: number;
  attendance_date: string;
  is_present: boolean;
  created_at: string;
  updated_at: string;
  member?: Member;
}

export interface ChurchInfo {
  id: number;
  address: string;
  map_embed_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  username: string | null;
}
