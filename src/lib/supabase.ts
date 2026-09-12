import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Fetch wrapper that always bypasses the Next.js Data Cache.
 * Without this, supabase-js GET requests can be cached by Next even in
 * `force-dynamic` routes, serving stale rows after admin CRUD changes.
 */
const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: 'no-store' });

/**
 * Public client: anon key + RLS policies.
 * Only for public data and unauthenticated flows (events, activities,
 * schedule, church info). Never use for admin/mutating operations.
 */
export function createPublicClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { fetch: noStoreFetch },
  });
}

/**
 * Server-side Supabase client with service role key.
 * Service role bypasses RLS, so use it ONLY in authenticated admin flows
 * and internal auth helpers — never on public endpoints.
 */
export function createServiceClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: { fetch: noStoreFetch },
    }
  );
}
