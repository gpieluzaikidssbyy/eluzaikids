import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('schedules')
    .update({
      day: body.day,
      time: body.time,
      type: body.type,
      description: body.description || null,
      show_schedule: body.show_schedule ?? true,
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();
  const { error } = await supabase.from('schedules').delete().eq('id', params.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Deleted' });
}
