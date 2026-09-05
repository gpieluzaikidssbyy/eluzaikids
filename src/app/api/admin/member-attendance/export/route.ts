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

function formatDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

export async function GET(request: NextRequest) {
  const className = request.nextUrl.searchParams.get('class');
  const date = request.nextUrl.searchParams.get('date');
  if (!date) {
    return NextResponse.json({ message: 'Date is required.' }, { status: 400 });
  }

  const supabase = createServiceClient();
  let membersQuery = supabase
    .from('members')
    .select('id, name, class')
    .order('name');
  if (className) membersQuery = membersQuery.eq('class', className);

  const { data: members, error: membersError } = await membersQuery;
  if (membersError) return NextResponse.json({ message: membersError.message }, { status: 500 });

  const ids = (members || []).map((member) => member.id);
  const { data: attendance, error: attendanceError } = ids.length
    ? await supabase.from('attendances').select('member_id, is_present').in('member_id', ids).eq('attendance_date', date)
    : { data: [], error: null };
  if (attendanceError) return NextResponse.json({ message: attendanceError.message }, { status: 500 });

  const status = new Map((attendance || []).map((row) => [row.member_id, row.is_present]));
  const rows = (members || []).map((member, index) => ({
    no: index + 1,
    className: member.class,
    name: member.name,
    isPresent: status.get(member.id) === true,
  }));
  const title = className ? `Rekap Kehadiran ${className}` : 'Rekap Kehadiran';
  const filename = `${title} ${formatDate(date)}.xls`;
  const html = `
    <html><head><meta charset="UTF-8"></head><body>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(formatDate(date))}</p>
      <table border="1">
        <thead><tr>${className ? '' : '<th>Kelas</th>'}<th>No</th><th>Nama anak</th><th>Status kehadiran</th></tr></thead>
        <tbody>
          ${rows.map((row) => `<tr>${className ? '' : `<td>${escapeHtml(row.className)}</td>`}<td>${row.no}</td><td>${escapeHtml(row.name)}</td><td>${row.isPresent ? 'Hadir' : 'Tidak hadir'}</td></tr>`).join('')}
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
