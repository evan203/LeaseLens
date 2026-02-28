export interface Property {
  id: string;
  address: string;
  parcelId: string;
  owner: string;
  ownerAddress?: string;
  assessedValue: number;
  propertyType: string;
  yearBuilt?: number;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  latitude: number;
  longitude: number;
  zoning?: string;
  lastSaleDate?: string;
  lastSalePrice?: number;
}

export interface Landlord {
  id: string;
  name: string;
  properties: Property[];
  totalUnits: number;
  portfolioValue: number;
  rating: number;
  evictionRate: number;
  codeViolations: number;
  avgMaintenanceScore: number;
}

export interface TransitStop {
  id: string;
  name: string;
  distance: number;
  routes: string[];
  waitTime: number;
}

export interface TransitData {
  score: number;
  stops: TransitStop[];
  busFrequency: number;
}

export interface NeighborhoodScore {
  walkScore: number;
  transitScore: number;
  bikeScore: number;
  amenities: {
    grocery: number;
    parks: number;
    schools: number;
    restaurants: number;
    transit: number;
  };
}

export interface PropertyListing {
  id: string;
  address: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  available: boolean;
  landlordId?: string;
  property: Property;
  neighborhood: NeighborhoodScore;
  transit: TransitData;
  maintenanceScore?: number;
  landlordRating?: number;
  trueCost: number;
  includedUtilities: string[];
  fees: { name: string; amount: number }[];
}

export interface MaintenanceStats {
  responseTime: number;
  qualityScore: number;
  serviceRating: number;
}

export interface LivingConditions {
  energyEfficiency: number;
  environmentalHealth: number;
  applianceLevel: number;
  internetQuality: number;
}

export interface RentInfo {
  postedRent: number;
  rentControl: boolean;
  fees: { name: string; amount: number }[];
  includedUtilities: string[];
  utilityEstimate: number;
  trueCost: number;
}
