import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const WEEKDAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export async function GET() {
  const supabase = createServiceClient();

  const { data: schedules } = await supabase
    .from('schedules')
    .select('*')
    .order('time');

  const visibleSchedules = (schedules || []).filter((s) => s.show_schedule !== false);

  const schedule = WEEKDAYS.filter((day) => visibleSchedules.some((s) => s.day === day)).map((day) => ({
    day,
    schedules: visibleSchedules.filter((s) => s.day === day),
  }));

  return NextResponse.json({ schedule });
}
