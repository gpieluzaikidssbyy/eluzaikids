import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createPublicClient();

  const { data: churchInfo } = await supabase
    .from('church_info')
    .select('*')
    .limit(1)
    .single();

  return NextResponse.json(churchInfo || null);
}
