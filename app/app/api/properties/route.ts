import { NextRequest, NextResponse } from 'next/server';
import { searchParcelsByAddress, getParcelById, getParcelsInBounds } from '@/lib/data/madisonParcels';
import { mockProperties } from '@/lib/data/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const address = searchParams.get('address');
  const id = searchParams.get('id');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const bounds = searchParams.get('bounds');
  
  try {
    if (id) {
      const property = await getParcelById(id);
      if (property) return NextResponse.json({ data: property, source: 'arcgis' });
      return NextResponse.json({ data: null, error: 'Property not found' }, { status: 404 });
    }
    
    if (address) {
      const properties = await searchParcelsByAddress(address);
      if (properties.length > 0) return NextResponse.json({ data: properties, source: 'arcgis' });
      const mockResults = mockProperties.filter(p => p.address.toLowerCase().includes(address.toLowerCase()));
      return NextResponse.json({ data: mockResults, source: 'mock' });
    }
    
    if (lat && lon && bounds) {
      const [minLat, minLon, maxLat, maxLon] = bounds.split(',').map(Number);
      const properties = await getParcelsInBounds(minLat, minLon, maxLat, maxLon);
      if (properties.length > 0) return NextResponse.json({ data: properties, source: 'arcgis' });
      return NextResponse.json({ data: mockProperties.slice(0, 10), source: 'mock' });
    }
    
    return NextResponse.json({ data: mockProperties, source: 'mock' });
  } catch (error) {
    console.error('Error in properties API:', error);
    return NextResponse.json({ data: mockProperties, source: 'mock-fallback' });
  }
}
