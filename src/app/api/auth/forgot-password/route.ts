import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'node:crypto';
import { createServiceClient } from '@/lib/supabase';
import { sendPasswordResetEmail } from '@/lib/email';
import { appBaseUrl } from '@/lib/helpers';

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ message: 'Email wajib diisi.' }, { status: 422 });

  const normalizedEmail = String(email).trim().toLowerCase();
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
    await sendPasswordResetEmail(user.email, `${appUrl}/admin/reset-password?token=${token}`);
  }

  return NextResponse.json({ message: 'Jika email terdaftar, instruksi reset password akan dikirim.' });
}
