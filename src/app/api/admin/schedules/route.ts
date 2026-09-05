import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServiceClient();
  const { data } = await supabase.from('schedules').select('*').order('day').order('time');
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('schedules')
    .insert({
      day: body.day,
      time: body.time,
      type: body.type,
      description: body.description || null,
      show_schedule: body.show_schedule ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}
