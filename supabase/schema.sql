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
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;

-- Sessions table (server-side revocable admin sessions).
-- Only the SHA-256 hash of the cookie token is stored; the raw token is
-- never persisted. Row removal/pruning is done lazily by the app, so keep
-- the FK with ON DELETE CASCADE so deleting a user revokes all sessions.
CREATE TABLE IF NOT EXISTS sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

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
  pin_failed_attempts INTEGER NOT NULL DEFAULT 0,
  pin_locked_until TIMESTAMP WITH TIME ZONE,
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
  verified_manually BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_name ON event_registrations(name);
CREATE INDEX IF NOT EXISTS idx_event_registrations_phone ON event_registrations(phone);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations(email);

-- Guarantees registration numbers are unique per event (prevents duplicate
-- numbers from concurrent requests even if the app-level counter is raced).
-- PostgreSQL has no "ADD CONSTRAINT IF NOT EXISTS", so guard with pg_constraint.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_event_registrations_nomor'
      AND conrelid = 'event_registrations'::regclass
  ) THEN
    ALTER TABLE event_registrations ADD CONSTRAINT uq_event_registrations_nomor UNIQUE (event_id, nomor_registrasi);
  END IF;
END $$;

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
  pin_failed_attempts INTEGER NOT NULL DEFAULT 0,
  pin_locked_until TIMESTAMP WITH TIME ZONE,
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
  verified_manually BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_registrations_activity_id ON activity_registrations(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_name ON activity_registrations(name);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_phone ON activity_registrations(phone);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_email ON activity_registrations(email);

-- Unique registration numbers per activity (see events above).
-- Guarantees registration numbers are unique per activity (see above).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_activity_registrations_nomor'
      AND conrelid = 'activity_registrations'::regclass
  ) THEN
    ALTER TABLE activity_registrations ADD CONSTRAINT uq_activity_registrations_nomor UNIQUE (activity_id, nomor_registrasi);
  END IF;
END $$;
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

-- Only the app server (service_role) may touch everything else; the anon/RLS
-- layers get read access to strictly public content below.
REVOKE ALL ON users, sessions, schedules, events, event_registrations, activities,
  activity_registrations, church_info, members, attendances, calendar_events
  FROM anon, authenticated;

-- ===========================================================================
-- PUBLIC READ SCOPE (anon role, RLS enforced)
-- ---------------------------------------------------------------------------
-- Events/Activities: column-level grants deliberately EXCLUDE scan_pin,
-- scan_active and the PIN lockout columns, so a public endpoint can never
-- leak them even if it accidentally selects `*`. Registration counts are
-- exposed only through the SECURITY DEFINER function below (no PII).
-- ===========================================================================
GRANT SELECT (id, title, tema, description, event_date, open_gate, start_time, location, quota, email_enabled, image, map_embed_url, drive_link, registration_deadline, created_at, updated_at) ON events TO anon;
GRANT SELECT (id, title, description, image, drive_link, activity_date, start_time, location, map_embed_url, quota, email_enabled, created_at, updated_at) ON activities TO anon;
GRANT SELECT (id, day, time, type, description, show_schedule, created_at, updated_at) ON schedules TO anon;
GRANT SELECT (id, address, map_embed_url, phone, whatsapp, email, instagram_url, youtube_url, created_at, updated_at) ON church_info TO anon;

-- Registration count without exposing any registration data.
CREATE OR REPLACE FUNCTION public.count_registrations(registrable_type text, registrable_id bigint)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN registrable_type = 'event' THEN
      (SELECT COUNT(*) FROM event_registrations WHERE event_id = registrable_id)
    WHEN registrable_type = 'activity' THEN
      (SELECT COUNT(*) FROM activity_registrations WHERE activity_id = registrable_id)
    ELSE 0
  END;
$$;

GRANT EXECUTE ON FUNCTION public.count_registrations(text, bigint) TO anon;

-- ===========================================================================
-- ATOMIC SEQUENCE FOR REGISTRATION NUMBERS
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER + atomic UPSERT means concurrent requests can never be
-- issued the same sequence, and quota is enforced server-side at allocation.
-- ===========================================================================
CREATE TABLE IF NOT EXISTS registration_counters (
  registrable_type TEXT NOT NULL CHECK (registrable_type IN ('event', 'activity')),
  registrable_id BIGINT NOT NULL,
  last_seq BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (registrable_type, registrable_id)
);

CREATE OR REPLACE FUNCTION public.next_registration_seq(registrable_type text, registrable_id bigint)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seq bigint;
  v_quota bigint;
BEGIN
  IF registrable_type = 'event' THEN
    SELECT quota INTO v_quota FROM events WHERE id = registrable_id;
  ELSIF registrable_type = 'activity' THEN
    SELECT quota INTO v_quota FROM activities WHERE id = registrable_id;
  ELSE
    RAISE EXCEPTION 'invalid type';
  END IF;

  INSERT INTO registration_counters (registrable_type, registrable_id, last_seq)
  VALUES (registrable_type, registrable_id, 1)
  ON CONFLICT (registrable_type, registrable_id)
  DO UPDATE SET last_seq = registration_counters.last_seq + 1
  RETURNING last_seq INTO v_seq;

  IF v_quota IS NOT NULL AND v_seq > v_quota THEN
    RAISE EXCEPTION 'quota exceeded';
  END IF;

  RETURN v_seq;
END;
$$;

GRANT EXECUTE ON FUNCTION public.next_registration_seq(text, bigint) TO service_role;
