import { NextRequest, NextResponse } from 'next/server';
import { getLandlords } from '@/lib/landlords';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const landlords = await getLandlords();
    return NextResponse.json(landlords);
  } catch (error) {
    console.error('Error fetching landlords:', error);
    return NextResponse.json({ error: 'Failed to fetch landlords' }, { status: 500 });
  }
}
