import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyScanToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const { type, id } = params;
    const body = await request.json();
    const { qr_data, scan_token } = body;

    if (!qr_data) {
      return NextResponse.json(
        { success: false, message: 'QR data tidak valid.' },
        { status: 400 }
      );
    }
    if (!verifyScanToken(scan_token, type, id)) {
      return NextResponse.json({ success: false, message: 'Sesi scan tidak valid atau sudah kedaluwarsa.' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const table = type === 'event' ? 'event_registrations' : 'activity_registrations';
    const foreignKey = type === 'event' ? 'event_id' : 'activity_id';

    // Check if scan is active
    const { data: registrable } = await supabase
      .from(type === 'event' ? 'events' : 'activities')
      .select('scan_active')
      .eq('id', id)
      .single();

    if (!registrable?.scan_active) {
      return NextResponse.json(
        { success: false, message: 'Scan sudah ditutup.' },
        { status: 403 }
      );
    }

    let registration = null;
    const parts = String(qr_data).trim().split('.');

    if (parts.length === 2) {
      // QR Code format: nomor_registrasi.qr_token
      const [nomorRegistrasi, token] = parts;
      const { data } = await supabase
        .from(table)
        .select('*')
        .eq(foreignKey, id)
        .eq('nomor_registrasi', nomorRegistrasi)
        .eq('qr_token', token)
        .single();
      registration = data;

      if (!registration) {
        // QR token did not match — it may have been consumed by an earlier scan.
        const { data: byNomor } = await supabase
          .from(table)
          .select('*')
          .eq(foreignKey, id)
          .eq('nomor_registrasi', nomorRegistrasi)
          .single();
        if (byNomor?.hadir) {
          return NextResponse.json({
            success: false,
            message: 'QR sudah digunakan. Peserta sudah tercatat hadir.',
            name: byNomor.name,
            jumlah_hadir: byNomor.jumlah_hadir,
          });
        }
        if (byNomor) {
          return NextResponse.json(
            { success: false, message: 'QR sudah tidak berlaku.' },
            { status: 410 }
          );
        }
      }
    } else {
      // Manual input requires the full registration number to prevent enumeration.
      const nomorRegistrasi = String(qr_data).trim().slice(0, 50);
      const { data: matches } = await supabase
        .from(table)
        .select('*')
        .eq(foreignKey, id)
        .eq('nomor_registrasi', nomorRegistrasi)
        .limit(2);
      registration = matches?.length === 1 ? matches[0] : null;
    }

    if (!registration) {
      return NextResponse.json(
        { success: false, message: 'Data pendaftaran tidak ditemukan.' },
        { status: 404 }
      );
    }

    if (registration.hadir) {
      return NextResponse.json({
        success: false,
        message: 'Sudah tercatat hadir.',
        name: registration.name,
        jumlah_hadir: registration.jumlah_hadir,
      });
    }

    // Mark as present and consume the QR token so the QR cannot be reused
    const { error } = await supabase
      .from(table)
      .update({ hadir: true, scanned_at: new Date().toISOString(), qr_token: null })
      .eq('id', registration.id)
      .eq('hadir', false);

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { success: false, message: 'Gagal memperbarui data.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Berhasil!',
      name: registration.name,
      jumlah_hadir: registration.jumlah_hadir,
    });
  } catch (error) {
    console.error('Scan verify error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan.' },
      { status: 500 }
    );
  }
}
