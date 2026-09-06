import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string; id: string; registrationId: string } }
) {
  try {
    const { type, registrationId } = params;
    const table = type === 'event' ? 'event_registrations' : 'activity_registrations';

    const supabase = createServiceClient();

    const { data: registration } = await supabase
      .from(table)
      .select('nomor_registrasi, qr_token')
      .eq('id', registrationId)
      .single();

    if (!registration) {
      return NextResponse.json({ message: 'Registration not found' }, { status: 404 });
    }

    if (!registration.qr_token) {
      return NextResponse.json({ message: 'QR sudah tidak berlaku.' }, { status: 410 });
    }

    const qrData = `${registration.nomor_registrasi}.${registration.qr_token}`;

    const pngBuffer = await QRCode.toBuffer(qrData, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
      },
    });
  } catch (error) {
    console.error('QR image error:', error);
    return NextResponse.json({ message: 'Failed to generate QR' }, { status: 500 });
  }
}
