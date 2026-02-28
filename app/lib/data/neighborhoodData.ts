import { NeighborhoodScore } from '../../types';

const MADISON_CENTER = { lat: 43.0731, lon: -89.4012 };

export async function getNeighborhoodScore(
  lat: number,
  lon: number
): Promise<NeighborhoodScore> {
  const distance = haversineDistance(lat, lon, MADISON_CENTER.lat, MADISON_CENTER.lon);
  
  if (distance < 0.5) {
    return {
      walkScore: 92,
      transitScore: 85,
      bikeScore: 88,
      amenities: { grocery: 95, parks: 90, schools: 80, restaurants: 98, transit: 85 },
    };
  }
  
  if (distance < 1.5) {
    return {
      walkScore: 78,
      transitScore: 70,
      bikeScore: 82,
      amenities: { grocery: 85, parks: 75, schools: 85, restaurants: 80, transit: 70 },
    };
  }
  
  if (distance < 3) {
    return {
      walkScore: 55,
      transitScore: 45,
      bikeScore: 70,
      amenities: { grocery: 60, parks: 85, schools: 70, restaurants: 50, transit: 45 },
    };
  }
  
  return {
    walkScore: 35,
    transitScore: 25,
    bikeScore: 60,
    amenities: { grocery: 40, parks: 70, schools: 60, restaurants: 30, transit: 25 },
  };
}

export async function getNeighborhoodByAddress(address: string): Promise<NeighborhoodScore> {
  const coords = await geocodeAddress(address);
  if (coords) {
    return getNeighborhoodScore(coords.lat, coords.lon);
  }
  return getNeighborhoodScore(MADISON_CENTER.lat, MADISON_CENTER.lon);
}

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  const encodedAddress = encodeURIComponent(`${address}, Madison, WI`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`;
  
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'LeaseLens/1.0' } });
    const data = await response.json();
    
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  return null;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function getAllNeighborhoods(): NeighborhoodScore[] {
  return [
    { walkScore: 92, transitScore: 85, bikeScore: 88, amenities: { grocery: 95, parks: 90, schools: 80, restaurants: 98, transit: 85 } },
    { walkScore: 78, transitScore: 70, bikeScore: 82, amenities: { grocery: 85, parks: 75, schools: 85, restaurants: 80, transit: 70 } },
    { walkScore: 55, transitScore: 45, bikeScore: 70, amenities: { grocery: 60, parks: 85, schools: 70, restaurants: 50, transit: 45 } },
    { walkScore: 35, transitScore: 25, bikeScore: 60, amenities: { grocery: 40, parks: 70, schools: 60, restaurants: 30, transit: 25 } },
  ];
}
