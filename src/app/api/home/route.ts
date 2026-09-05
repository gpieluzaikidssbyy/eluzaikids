import { NextResponse } from 'next/server';
import { fetchHomeData } from '@/lib/home-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchHomeData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Home API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch home data' },
      { status: 500 }
    );
  }
}