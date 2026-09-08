import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { scheduleSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServiceClient();
  const { data } = await supabase.from('schedules').select('*').order('day').order('time');
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  // Validate with Zod schema to prevent mass assignment
  const validated = scheduleSchema.safeParse(body);
  if (!validated.success) {
    const errors: Record<string, string> = {};
    validated.error.issues.forEach((issue) => {
      errors[issue.path.join('.')] = issue.message;
    });
    return NextResponse.json({ errors, message: 'Validasi gagal.' }, { status: 422 });
  }

  const { data, error } = await supabase
    .from('schedules')
    .insert({
      day: validated.data.day,
      time: validated.data.time,
      type: validated.data.type,
      description: validated.data.description || null,
      show_schedule: validated.data.show_schedule,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}
