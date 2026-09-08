-- Supabase schema for GPI Eluzai Kids
-- This matches all Laravel migrations

-- Users table (for admin auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified_at TIMESTAMP WITH TIME ZONE,
  password VARCHAR(255) NOT NULL,
  remember_token VARCHAR(100),
  is_admin BOOLEAN DEFAULT FALSE,
  username VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id BIGSERIAL PRIMARY KEY,
  day VARCHAR(255) NOT NULL,
  time TIME NOT NULL,
  type VARCHAR(255) NOT NULL,
  description TEXT,
  show_schedule BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedules_day_time ON schedules(day, time);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  tema VARCHAR(255),
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  open_gate TIME,
  start_time TIME,
  location VARCHAR(255),
  quota INTEGER,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  image VARCHAR(255),
  map_embed_url TEXT,
  drive_link VARCHAR(255),
  registration_deadline TIMESTAMP WITH TIME ZONE,
  scan_pin VARCHAR(6),
  scan_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);

-- Add 'tema' column for existing databases (idempotent migration)
ALTER TABLE events ADD COLUMN IF NOT EXISTS tema VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Event Registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  registration_ip VARCHAR(64),
  jumlah_hadir INTEGER DEFAULT 1,
  nomor_registrasi VARCHAR(50),
  qr_token VARCHAR(64),
  scanned_at TIMESTAMP WITH TIME ZONE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hadir BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_name ON event_registrations(name);
CREATE INDEX IF NOT EXISTS idx_event_registrations_phone ON event_registrations(phone);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations(email);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(255),
  drive_link VARCHAR(255),
  activity_date DATE,
  start_time TIME,
  location VARCHAR(255),
  map_embed_url TEXT,
  quota INTEGER,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  scan_pin VARCHAR(6),
  scan_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Registrations table
CREATE TABLE IF NOT EXISTS activity_registrations (
  id BIGSERIAL PRIMARY KEY,
  activity_id BIGINT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  registration_ip VARCHAR(64),
  jumlah_hadir INTEGER DEFAULT 1,
  nomor_registrasi VARCHAR(50),
  qr_token VARCHAR(64),
  scanned_at TIMESTAMP WITH TIME ZONE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hadir BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_registrations_activity_id ON activity_registrations(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_name ON activity_registrations(name);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_phone ON activity_registrations(phone);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_email ON activity_registrations(email);
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS registration_ip VARCHAR(64);
ALTER TABLE activity_registrations ADD COLUMN IF NOT EXISTS registration_ip VARCHAR(64);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Church Info table
CREATE TABLE IF NOT EXISTS church_info (
  id BIGSERIAL PRIMARY KEY,
  address TEXT NOT NULL,
  map_embed_url TEXT,
  phone VARCHAR(255),
  whatsapp VARCHAR(255),
  email VARCHAR(255),
  instagram_url VARCHAR(255),
  youtube_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  class VARCHAR(50) NOT NULL CHECK (class IN ('Baby', 'Samuel', 'Yosua', 'Musa')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_class ON members(class);

-- Attendances table
CREATE TABLE IF NOT EXISTS attendances (
  id BIGSERIAL PRIMARY KEY,
  member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  is_present BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances(attendance_date);

-- Calendar Events table (internal agenda — Rapat, Pertemuan, Doa Bersama, dsb.)
-- NOT shown publicly, only on /admin/calendar
CREATE TABLE IF NOT EXISTS calendar_events (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_event_date ON calendar_events(event_date);

-- Insert default church info
INSERT INTO church_info (address, map_embed_url, phone, whatsapp, email, instagram_url, youtube_url)
VALUES (
  'Jl. Contoh No. 123, Jakarta',
  '',
  '',
  '',
  '',
  '',
  ''
) ON CONFLICT DO NOTHING;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS public_events_read ON events;
CREATE POLICY public_events_read ON events FOR SELECT USING (true);
DROP POLICY IF EXISTS public_activities_read ON activities;
CREATE POLICY public_activities_read ON activities FOR SELECT USING (true);
DROP POLICY IF EXISTS public_schedules_read ON schedules;
CREATE POLICY public_schedules_read ON schedules FOR SELECT USING (show_schedule = true);
DROP POLICY IF EXISTS public_church_info_read ON church_info;
CREATE POLICY public_church_info_read ON church_info FOR SELECT USING (true);

REVOKE ALL ON users, schedules, events, event_registrations, activities,
  activity_registrations, church_info, members, attendances, calendar_events
  FROM anon, authenticated;
