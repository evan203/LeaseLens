import { NextRequest, NextResponse } from 'next/server';
import { getNeighborhoodScore, getNeighborhoodByAddress, getAllNeighborhoods } from '@/lib/data/neighborhoodData';
import { mockListings } from '@/lib/data/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const address = searchParams.get('address');
  const all = searchParams.get('all');
  
  try {
    if (all === 'true') {
      return NextResponse.json({ data: getAllNeighborhoods(), source: 'calculated' });
    }
    
    if (lat && lon) {
      const score = await getNeighborhoodScore(parseFloat(lat), parseFloat(lon));
      return NextResponse.json({ data: score, source: 'calculated' });
    }
    
    if (address) {
      const listing = mockListings.find(l => l.address.toLowerCase().includes(address.toLowerCase()));
      if (listing) return NextResponse.json({ data: listing.neighborhood, source: 'mock' });
      const score = await getNeighborhoodByAddress(address);
      return NextResponse.json({ data: score, source: 'geocoding' });
    }
    
    return NextResponse.json({ data: mockListings[0]?.neighborhood, source: 'mock' });
  } catch (error) {
    console.error('Error in neighborhoods API:', error);
    return NextResponse.json({ data: mockListings[0]?.neighborhood, source: 'mock-fallback' });
  }
}
