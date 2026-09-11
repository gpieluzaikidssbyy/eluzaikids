import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/guards';
import { safeFilename } from '@/lib/sanitize';
import { buildXlsxBuffer, xlsxResponse } from '@/lib/xlsx';

export const dynamic = 'force-dynamic';

function formatDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.denied) return guard.response;

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
    className: member.class,
    no: index + 1,
    name: member.name,
    isPresent: status.get(member.id) === true ? 'Hadir' : 'Tidak hadir',
  }));

  const columns = className
    ? [
        { header: 'No', key: 'no', width: 6 },
        { header: 'Nama anak', key: 'name', width: 32 },
        { header: 'Status kehadiran', key: 'isPresent', width: 18 },
      ]
    : [
        { header: 'Kelas', key: 'className', width: 16 },
        { header: 'No', key: 'no', width: 6 },
        { header: 'Nama anak', key: 'name', width: 32 },
        { header: 'Status kehadiran', key: 'isPresent', width: 18 },
      ];

  const buffer = await buildXlsxBuffer('Rekap Kehadiran', columns, rows);

  const title = className ? `Rekap Kehadiran ${className}` : 'Rekap Kehadiran';
  const dateLabel = formatDate(date);
  return xlsxResponse(buffer, `${safeFilename(title)} ${safeFilename(dateLabel)}.xlsx`);
}