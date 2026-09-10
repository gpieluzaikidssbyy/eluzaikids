import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/guards';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin();
  if (guard.denied) return guard.response;

  const supabase = createServiceClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('members')
    .update({ name: body.name, class: body.class })
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
  const guard = await requireAdmin();
  if (guard.denied) return guard.response;

  const supabase = createServiceClient();
  const { error } = await supabase.from('members').delete().eq('id', params.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Deleted' });
}
