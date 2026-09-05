import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const { type, id } = params;
    const body = await request.json();
    const { qr_data } = body;

    if (!qr_data) {
      return NextResponse.json(
        { success: false, message: 'QR data tidak valid.' },
        { status: 400 }
      );
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
    const parts = qr_data.split('.');

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
    } else {
      // Manual input: just registration number
      const { data } = await supabase
        .from(table)
        .select('*')
        .eq(foreignKey, id)
        .like('nomor_registrasi', `%${qr_data}%`)
        .single();
      registration = data;
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

    // Mark as present
    const { error } = await supabase
      .from(table)
      .update({ hadir: true, scanned_at: new Date().toISOString() })
      .eq('id', registration.id);

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
