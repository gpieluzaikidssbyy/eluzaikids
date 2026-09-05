import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServiceClient();
  const { data } = await supabase.from('church_info').select('*').limit(1).single();
  return NextResponse.json(data || null);
}

export async function PUT(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  // Upsert: update existing or insert new
  const { data: existing } = await supabase.from('church_info').select('id').limit(1).single();

  if (existing) {
    const { data, error } = await supabase
      .from('church_info')
      .update({
        address: body.address,
        map_embed_url: body.map_embed_url || null,
        phone: body.phone || null,
        whatsapp: body.whatsapp || null,
        email: body.email || null,
        instagram_url: body.instagram_url || null,
        youtube_url: body.youtube_url || null,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json(data);
  } else {
    const { data, error } = await supabase
      .from('church_info')
      .insert({
        address: body.address,
        map_embed_url: body.map_embed_url || null,
        phone: body.phone || null,
        whatsapp: body.whatsapp || null,
        email: body.email || null,
        instagram_url: body.instagram_url || null,
        youtube_url: body.youtube_url || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json(data);
  }
}
