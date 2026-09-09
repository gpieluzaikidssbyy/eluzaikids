import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';
import { checkCsrf } from '@/lib/csrf';

export async function POST(request: NextRequest) {
  if (!(await checkCsrf(request))) {
    return NextResponse.json(
      { message: 'Validasi CSRF gagal. Silakan refresh halaman dan coba lagi.' },
      { status: 403 }
    );
  }

  clearSessionCookie();
  return NextResponse.json({ success: true });
}
