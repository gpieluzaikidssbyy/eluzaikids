import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const className = request.nextUrl.searchParams.get('class');
  const date = request.nextUrl.searchParams.get('date');
  if (!className || !date) return NextResponse.json({ message: 'Class and date are required.' }, { status: 400 });

  const supabase = createServiceClient();
  const { data: members, error: membersError } = await supabase.from('members').select('id, name, class').eq('class', className).order('name');
  if (membersError) return NextResponse.json({ message: membersError.message }, { status: 500 });
  const ids = (members || []).map((member) => member.id);
  const { data: attendance, error: attendanceError } = ids.length
    ? await supabase.from('attendances').select('member_id, is_present').in('member_id', ids).eq('attendance_date', date)
    : { data: [], error: null };
  if (attendanceError) return NextResponse.json({ message: attendanceError.message }, { status: 500 });

  const status = new Map((attendance || []).map((row) => [row.member_id, row.is_present]));
  return NextResponse.json({ members: (members || []).map((member) => ({ ...member, is_present: status.get(member.id) === true })) });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.member_id || !body.attendance_date || typeof body.is_present !== 'boolean') {
    return NextResponse.json({ message: 'Invalid attendance data.' }, { status: 400 });
  }

  const { data, error } = await createServiceClient().from('attendances').upsert({
    member_id: body.member_id,
    attendance_date: body.attendance_date,
    is_present: body.is_present,
  }, { onConflict: 'member_id,attendance_date' }).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}
