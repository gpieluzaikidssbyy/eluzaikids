import { createServiceClient } from '@/lib/supabase';
import type { Activity, ChurchInfo, Event } from '@/lib/types';

export interface ScheduleSlot {
  type: string;
  schedule: {
    day: string;
    time: string;
    type: string;
    description: string | null;
    nextDate: string;
  } | null;
}

export interface HomeData {
  schedules: ScheduleSlot[];
  events: (Event & { registrations_count: number })[];
  activities: (Activity & { registrations_count: number })[];
  churchInfo: ChurchInfo | null;
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

export async function fetchHomeData(): Promise<HomeData> {
  const supabase = createServiceClient();

  const { data: schedulesData } = await supabase
    .from('schedules')
    .select('*')
    .order('time');

  const visibleSchedules = schedulesData || [];

  const scheduleTypes = ['Ibadah', 'Latihan'];
  const schedules: ScheduleSlot[] = scheduleTypes.map((type) => {
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

  const { data: events } = await supabase
    .from('events')
    .select('*, event_registrations(count)')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(3);

  const { data: activities } = await supabase
    .from('activities')
    .select('*, activity_registrations(count)')
    .order('activity_date', { ascending: false })
    .limit(3);

  const { data: churchInfo } = await supabase
    .from('church_info')
    .select('*')
    .limit(1)
    .single();

  return {
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
  };
}