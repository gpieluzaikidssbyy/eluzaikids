import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { memberSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServiceClient();
  const { data } = await supabase.from('members').select('id, name, class, created_at').order('class').order('name');
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  // Validate with Zod schema to prevent mass assignment
  const validated = memberSchema.safeParse(body);
  if (!validated.success) {
    const errors: Record<string, string> = {};
    validated.error.issues.forEach((issue) => {
      errors[issue.path.join('.')] = issue.message;
    });
    return NextResponse.json({ errors, message: 'Validasi gagal.' }, { status: 422 });
  }

  const { data, error } = await supabase
    .from('members')
    .insert({ name: validated.data.name, class: validated.data.class })
    .select()
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}
