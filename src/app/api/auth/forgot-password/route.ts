import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'node:crypto';
import { createServiceClient } from '@/lib/supabase';
import { sendPasswordResetEmail } from '@/lib/email';
import { appBaseUrl } from '@/lib/helpers';
import { RateLimiter } from '@/lib/rateLimit';
import { checkCsrf } from '@/lib/csrf';

// Prevent email-spam DoS: 3 requests per minute per IP+email, 10 per IP.
const emailLimiter = new RateLimiter(3, 60 * 1000);
const ipLimiter = new RateLimiter(10, 60 * 1000);

export async function POST(request: NextRequest) {
  if (!(await checkCsrf(request))) {
    return NextResponse.json(
      { message: 'Validasi CSRF gagal. Silakan refresh halaman dan coba lagi.' },
      { status: 403 }
    );
  }

  const { email } = await request.json();
  if (!email) return NextResponse.json({ message: 'Email wajib diisi.' }, { status: 422 });

  const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown')
    .split(',')[0]
    .trim();
  const normalizedEmail = String(email).trim().toLowerCase();

  if (!ipLimiter.check(ip) || !emailLimiter.check(`${ip}:${normalizedEmail}`)) {
    return NextResponse.json({ message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' }, { status: 429 });
  }

  const supabase = createServiceClient();
  const { data: user } = await supabase.from('users').select('id, email').eq('email', normalizedEmail).eq('is_admin', true).maybeSingle();

  if (user) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const { error } = await supabase
      .from('users')
      .update({ remember_token: tokenHash, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) throw error;

    const appUrl = appBaseUrl();
    if (!appUrl) throw new Error('NEXT_PUBLIC_APP_URL must be configured.');
    const parsedUrl = new URL(appUrl);
    if (process.env.NODE_ENV === 'production' && parsedUrl.protocol !== 'https:') {
      throw new Error('Password reset URL must use HTTPS in production.');
    }

    try {
      await sendPasswordResetEmail(user.email, `${appUrl}/admin/reset-password?token=${token}`);
    } catch (error) {
      console.error('Password reset email error:', error);
    }
  }

  return NextResponse.json({ message: 'Jika email terdaftar, instruksi reset password akan dikirim.' });
}
