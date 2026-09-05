import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, any> = {};

  // Test 1: Supabase connection
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.from('church_info').select('*').limit(1);

    if (error) {
      results.supabase = { status: 'error', message: error.message, code: error.code };
    } else {
      results.supabase = { status: 'ok', message: 'Connected successfully', rows: data?.length || 0 };
    }
  } catch (e: any) {
    results.supabase = { status: 'error', message: e.message };
  }

  // Test 2: reCAPTCHA config
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  const recaptchaSite = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (recaptchaSecret && recaptchaSite) {
    results.recaptcha = {
      status: 'configured',
      siteKeyLength: recaptchaSite.length,
      secretKeyLength: recaptchaSecret.length,
      siteKeyPrefix: recaptchaSite.substring(0, 8) + '...',
    };
  } else {
    results.recaptcha = {
      status: 'not_configured',
      hasSiteKey: !!recaptchaSite,
      hasSecretKey: !!recaptchaSecret,
    };
  }

  // Test 3: Try to list tables by querying each one
  const tables = ['events', 'activities', 'event_registrations', 'activity_registrations', 'members', 'schedules', 'church_info'];
  const tableStatus: Record<string, any> = {};

  try {
    const supabase = createServiceClient();
    for (const table of tables) {
      try {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        tableStatus[table] = error ? { exists: false, error: error.message } : { exists: true, count: count || 0 };
      } catch {
        tableStatus[table] = { exists: false, error: 'Table not found' };
      }
    }
    results.tables = tableStatus;
  } catch (e: any) {
    results.tables = { error: e.message };
  }

  return NextResponse.json(results, { status: 200 });
}
