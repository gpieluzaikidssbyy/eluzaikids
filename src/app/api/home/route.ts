import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServiceClient();

  try {
    // Fetch schedules
    const { data: schedulesData } = await supabase
      .from('schedules')
      .select('*')
      .order('time');

    const visibleSchedules = schedulesData || [];

    // Group schedules by type for home display
    const scheduleTypes = ['Ibadah', 'Latihan'];
    const schedules = scheduleTypes.map((type) => {
      const matching = visibleSchedules
        .filter((s) => s.type === type && s.show_schedule !== false)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      const latest = matching[0] || null;

      return {
        type,
        schedule: latest
          ? {
              day: latest.day,
              time: latest.time,
              type: latest.type,
              description: latest.description,
              nextDate: getNextDate(latest.day),
            }
          : null,
      };
    });

    // Fetch upcoming events
    const { data: events } = await supabase
      .from('events')
      .select('*, event_registrations(count)')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(3);

    // Fetch recent activities
    const { data: activities } = await supabase
      .from('activities')
      .select('*, activity_registrations(count)')
      .order('activity_date', { ascending: false })
      .limit(3);

    // Fetch church info
    const { data: churchInfo } = await supabase
      .from('church_info')
      .select('*')
      .limit(1)
      .single();

    return NextResponse.json({
      schedules,
      events: (events || []).map((e) => ({
        ...e,
        registrations_count: e.event_registrations?.[0]?.count || 0,
      })),
      activities: (activities || []).map((a) => ({
        ...a,
        registrations_count: a.activity_registrations?.[0]?.count || 0,
      })),
      churchInfo,
    });
  } catch (error) {
    console.error('Home API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch home data' },
      { status: 500 }
    );
  }
}

function getNextDate(day: string): string {
  const days: Record<string, number> = {
    Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5, Sabtu: 6, Minggu: 0,
  };
  const target = days[day] ?? new Date().getDay();
  const today = new Date().getDay();
  const diff = (target - today + 7) % 7;
  const next = new Date();
  next.setDate(next.getDate() + diff);
  return next.toISOString();
}
