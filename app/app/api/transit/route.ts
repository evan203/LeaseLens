import { NextRequest, NextResponse } from 'next/server';
import { getTransitForLocation } from '@/lib/data/metroTransit';
import { mockListings } from '@/lib/data/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const address = searchParams.get('address');
  
  try {
    if (lat && lon) {
      const transitData = await getTransitForLocation(parseFloat(lat), parseFloat(lon));
      return NextResponse.json({ data: transitData, source: 'metro' });
    }
    
    if (address) {
      const listing = mockListings.find(l => l.address.toLowerCase().includes(address.toLowerCase()));
      if (listing) return NextResponse.json({ data: listing.transit, source: 'mock' });
    }
    
    return NextResponse.json({ 
      data: mockListings[0]?.transit || { score: 65, stops: [], busFrequency: 30 },
      source: 'mock' 
    });
  } catch (error) {
    console.error('Error in transit API:', error);
    return NextResponse.json({ data: { score: 65, stops: [], busFrequency: 30 }, source: 'mock-fallback' });
  }
}
