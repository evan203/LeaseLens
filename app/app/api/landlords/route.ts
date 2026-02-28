import { NextRequest, NextResponse } from 'next/server';
import { getOwnerProperties } from '@/lib/data/madisonParcels';
import { mockLandlords, findLandlordByName, getLandlordWithProperties, mockListings } from '@/lib/data/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const name = searchParams.get('name');
  const id = searchParams.get('id');
  const listings = searchParams.get('listings');
  
  try {
    if (id) {
      const landlord = getLandlordWithProperties(id);
      if (landlord) return NextResponse.json({ data: landlord, source: 'mock' });
      return NextResponse.json({ data: null, error: 'Landlord not found' }, { status: 404 });
    }
    
    if (name) {
      const landlord = findLandlordByName(name);
      if (landlord) return NextResponse.json({ data: landlord, source: 'mock' });
      
      const properties = await getOwnerProperties(name);
      if (properties.length > 0) {
        const uniqueOwners = [...new Set(properties.map(p => p.owner))];
        return NextResponse.json({ 
          data: uniqueOwners.map(owner => ({
            id: owner.replace(/\s+/g, '-').toLowerCase(),
            name: owner,
            properties: properties.filter(p => p.owner === owner),
            totalUnits: properties.filter(p => p.owner === owner).length,
          })),
          source: 'arcgis' 
        });
      }
      return NextResponse.json({ data: null, error: 'No landlords found' }, { status: 404 });
    }
    
    if (listings === 'true') {
      return NextResponse.json({ data: mockListings, source: 'mock' });
    }
    
    return NextResponse.json({ data: mockLandlords, source: 'mock' });
  } catch (error) {
    console.error('Error in landlords API:', error);
    return NextResponse.json({ data: mockLandlords, source: 'mock-fallback' });
  }
}
