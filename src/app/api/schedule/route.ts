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

  const updatedAt = visibleSchedules
    .filter((item) => item.updated_at)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]?.updated_at || null;

  return NextResponse.json({ schedule, updatedAt });
}
