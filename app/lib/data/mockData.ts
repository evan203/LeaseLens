import { Property, Landlord, PropertyListing } from '../../types';

export const mockLandlords: Landlord[] = [
  { id: 'l1', name: 'Joe Smith', properties: [], totalUnits: 45, portfolioValue: 8500000, rating: 3.2, evictionRate: 8.5, codeViolations: 12, avgMaintenanceScore: 2.8 },
  { id: 'l2', name: 'Badger Property Management', properties: [], totalUnits: 120, portfolioValue: 24000000, rating: 2.1, evictionRate: 15.2, codeViolations: 45, avgMaintenanceScore: 1.9 },
  { id: 'l3', name: 'Downtown Living LLC', properties: [], totalUnits: 28, portfolioValue: 5600000, rating: 4.5, evictionRate: 2.1, codeViolations: 3, avgMaintenanceScore: 4.2 },
  { id: 'l4', name: 'Capitol Properties', properties: [], totalUnits: 65, portfolioValue: 13000000, rating: 3.8, evictionRate: 4.5, codeViolations: 8, avgMaintenanceScore: 3.5 },
];

export const mockProperties: Property[] = [
  { id: 'p1', address: '123 State St, Madison, WI', parcelId: '2511-12345-000', owner: 'Downtown Living LLC', assessedValue: 350000, propertyType: 'Multi-Family', yearBuilt: 1920, latitude: 43.0731, longitude: -89.4012, zoning: 'C2' },
  { id: 'p2', address: '456 E Johnson St, Madison, WI', parcelId: '2511-23456-000', owner: 'Badger Property Management', assessedValue: 280000, propertyType: 'Multi-Family', yearBuilt: 1965, latitude: 43.0900, longitude: -89.3700, zoning: 'C1' },
  { id: 'p3', address: '789 Williamson St, Madison, WI', parcelId: '2511-34567-000', owner: 'Joe Smith', assessedValue: 425000, propertyType: 'Single Family', yearBuilt: 1905, latitude: 43.1000, longitude: -89.3850, zoning: 'R2' },
  { id: 'p4', address: '321 N Frances St, Madison, WI', parcelId: '2511-45678-000', owner: 'Capitol Properties', assessedValue: 520000, propertyType: 'Multi-Family', yearBuilt: 2015, latitude: 43.0769, longitude: -89.4125, zoning: 'C2' },
  { id: 'p5', address: '555 W Mifflin St, Madison, WI', parcelId: '2511-56789-000', owner: 'Downtown Living LLC', assessedValue: 380000, propertyType: 'Condo', yearBuilt: 2008, latitude: 43.0800, longitude: -89.3900, zoning: 'C3' },
];

export const mockListings: PropertyListing[] = mockProperties.map((property, index) => ({
  id: `listing-${index + 1}`,
  address: property.address,
  rent: 1200 + index * 150,
  bedrooms: (index % 3) + 1,
  bathrooms: 1,
  squareFeet: 600 + index * 200,
  available: index < 3,
  landlordId: mockLandlords.find(l => l.name === property.owner)?.id,
  property,
  neighborhood: {
    walkScore: [92, 78, 55, 35][index % 4],
    transitScore: [85, 70, 45, 25][index % 4],
    bikeScore: [88, 82, 70, 60][index % 4],
    amenities: { grocery: [95, 85, 60, 40][index % 4], parks: [90, 75, 85, 70][index % 4], schools: [80, 85, 70, 60][index % 4], restaurants: [98, 80, 50, 30][index % 4], transit: [85, 70, 45, 25][index % 4] },
  },
  transit: {
    score: [72, 58, 35, 20][index % 4],
    stops: [
      { id: '1', name: 'Capitol Square', distance: 0.2, routes: ['B', '2'], waitTime: 5 + index * 3 },
      { id: '2', name: 'State Street', distance: 0.3, routes: ['3'], waitTime: 8 + index * 2 },
    ],
    busFrequency: 30 + index * 10,
  },
  maintenanceScore: 2.5 + index * 0.5,
  landlordRating: 2.5 + index * 0.5,
  trueCost: 1200 + index * 150 + (index % 2) * 150,
  includedUtilities: index % 2 === 0 ? ['Water', 'Trash'] : [],
  fees: index % 2 === 0 ? [] : [{ name: 'Parking', amount: 50 }, { name: 'Pet', amount: 30 }],
}));

export function findLandlordByName(name: string): Landlord | undefined {
  return mockLandlords.find(l => l.name.toLowerCase().includes(name.toLowerCase()));
}

export function findPropertiesByLandlord(landlordName: string): Property[] {
  return mockProperties.filter(p => p.owner.toLowerCase().includes(landlordName.toLowerCase()));
}

export function getLandlordWithProperties(landlordId: string): Landlord | null {
  const landlord = mockLandlords.find(l => l.id === landlordId);
  if (!landlord) return null;
  const properties = mockProperties.filter(p => p.owner === landlord.name);
  return { ...landlord, properties };
}
