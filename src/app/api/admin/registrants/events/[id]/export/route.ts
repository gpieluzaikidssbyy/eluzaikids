import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim();
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();

  const { data: event } = await supabase
    .from('events')
    .select('id, title, tema')
    .eq('id', params.id)
    .single();

  if (!event) {
    return NextResponse.json({ message: 'Event tidak ditemukan.' }, { status: 404 });
  }

  const { data: registrations } = await supabase
    .from('event_registrations')
    .select('name, phone, email, jumlah_hadir, nomor_registrasi, registered_at')
    .eq('event_id', params.id)
    .order('registered_at', { ascending: false });

  const rows = (registrations || []).map((r, index) => ({
    no: index + 1,
    nomorRegistrasi: r.nomor_registrasi,
    name: r.name,
    phone: r.phone,
    email: r.email || '-',
    jumlahHadir: r.jumlah_hadir,
  }));

  const title = `Rekap Data Pendaftar #${event.title}${event.tema ? ` - ${event.tema}` : ''}`;
  const filename = `${safeFilename(title)}.xls`;
  const html = `
    <html><head><meta charset="UTF-8"></head><body>
      <h2>${escapeHtml(title)}</h2>
      <table border="1">
        <thead><tr><th>No</th><th>No. Registrasi</th><th>Nama lengkap</th><th>No. HP</th><th>Email</th><th>Jumlah hadir</th></tr></thead>
        <tbody>
          ${rows.map((row) => `<tr><td>${row.no}</td><td>${escapeHtml(row.nomorRegistrasi)}</td><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.phone)}</td><td>${escapeHtml(row.email)}</td><td>${row.jumlahHadir}</td></tr>`).join('')}
        </tbody>
      </table>
    </body></html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
