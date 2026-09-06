import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { randomBytes } from 'node:crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, type, id, registrationId } = body;

  const supabase = createServiceClient();
  const table = type === 'event' ? 'event_registrations' : 'activity_registrations';
  const foreignKey = type === 'event' ? 'event_id' : 'activity_id';

  if (action === 'toggle-hadir') {
    // Toggle hadir status
    const { data: reg } = await supabase
      .from(table)
      .select('hadir')
      .eq('id', registrationId)
      .single();

    if (!reg) {
      return NextResponse.json({ message: 'Registration not found' }, { status: 404 });
    }

    // Marking present consumes the QR token (QR expires);
    // unmarking issues a fresh token so a new valid QR can be generated.
    const { error } = await supabase
      .from(table)
      .update({
        hadir: !reg.hadir,
        scanned_at: !reg.hadir ? new Date().toISOString() : null,
        qr_token: !reg.hadir ? null : randomBytes(16).toString('hex'),
      })
      .eq('id', registrationId);

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });

    // Get updated totals
    const { count: totalCount } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq(foreignKey, id);

    const { count: hadirCount } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq(foreignKey, id)
      .eq('hadir', true);

    const { data: hadirSum } = await supabase
      .from(table)
      .select('jumlah_hadir')
      .eq(foreignKey, id)
      .eq('hadir', true);

    const totalHadir = (hadirSum || []).reduce((sum, r) => sum + (r.jumlah_hadir || 0), 0);

    return NextResponse.json({
      hadir: !reg.hadir,
      totalHadir,
      totalRegistrations: totalCount || 0,
      totalHadirCount: hadirCount || 0,
      totalBelumHadir: (totalCount || 0) - (hadirCount || 0),
    });
  }

  if (action === 'quick-mark') {
    const { code } = body;
    if (!code) {
      return NextResponse.json({ message: 'Code required' }, { status: 400 });
    }

    const { data: reg } = await supabase
      .from(table)
      .select('*')
      .eq(foreignKey, id)
      .like('nomor_registrasi', `%${code}%`)
      .single();

    if (!reg) {
      return NextResponse.json({ success: false, message: 'Nomor registrasi tidak ditemukan.' });
    }

    if (reg.hadir) {
      return NextResponse.json({
        success: false,
        message: `${reg.name} sudah tercatat hadir.`,
        name: reg.name,
        nomor_registrasi: reg.nomor_registrasi,
      });
    }

    await supabase
      .from(table)
      .update({ hadir: true, scanned_at: new Date().toISOString(), qr_token: null })
      .eq('id', reg.id);

    return NextResponse.json({ success: true, message: 'Berhasil!', name: reg.name });
  }

  if (action === 'toggle-scan') {
    const eventTable = type === 'event' ? 'events' : 'activities';
    const { data: ev } = await supabase
      .from(eventTable)
      .select('scan_active')
      .eq('id', id)
      .single();

    await supabase
      .from(eventTable)
      .update({ scan_active: !ev?.scan_active })
      .eq('id', id);

    return NextResponse.json({ scan_active: !ev?.scan_active });
  }

  if (action === 'update-scan-pin') {
    const eventTable = type === 'event' ? 'events' : 'activities';
    await supabase
      .from(eventTable)
      .update({ scan_pin: body.scan_pin })
      .eq('id', id);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
}
