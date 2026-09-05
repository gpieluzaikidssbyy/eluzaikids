import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type'); // 'event' or 'activity'
  const id = searchParams.get('id');
  const tab = searchParams.get('tab') || 'all';
  const search = searchParams.get('search') || '';

  if (!type || !id) {
    return NextResponse.json({ message: 'Missing type or id' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const table = type === 'event' ? 'event_registrations' : 'activity_registrations';
  const foreignKey = type === 'event' ? 'event_id' : 'activity_id';

  let query = supabase
    .from(table)
    .select('*')
    .eq(foreignKey, id)
    .order('registered_at', { ascending: false });

  if (tab === 'hadir') {
    query = query.eq('hadir', true);
  } else if (tab === 'belum_hadir') {
    query = query.eq('hadir', false);
  }

  if (search) {
    query = query.like('nomor_registrasi', `%${search}%`);
  }

  const { data: registrations } = await query;

  // Get totals
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
  const totalRegistrations = totalCount || 0;
  const totalHadirCount = hadirCount || 0;
  const totalBelumHadir = totalRegistrations - totalHadirCount;

  return NextResponse.json({
    registrations: registrations || [],
    totalHadir,
    totalRegistrations,
    totalHadirCount,
    totalBelumHadir,
  });
}
