import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServiceClient();

  const { data: churchInfo } = await supabase
    .from('church_info')
    .select('*')
    .limit(1)
    .single();

  return NextResponse.json(churchInfo || null);
}
