import { TransitData, TransitStop } from '../types';

const SMSMYBUS_BASE = 'https://api.smsmybus.com/v1';

let apiKey: string | null = null;

export function setApiKey(key: string) {
  apiKey = key;
}

export async function getArrivals(stopId: string): Promise<TransitStop[]> {
  if (!apiKey) {
    console.warn('Metro Transit API key not set, using fallback');
    return getMockArrivals(stopId);
  }
  
  const url = `${SMSMYBUS_BASE}/getarrivals?key=${apiKey}&stopID=${stopId}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error('Transit API error:', data.error);
      return getMockArrivals(stopId);
    }
    
    return parseArrivalsResponse(data, stopId);
  } catch (error) {
    console.error('Error fetching transit arrivals:', error);
    return getMockArrivals(stopId);
  }
}

function parseArrivalsResponse(data: any, stopId: string): TransitStop[] {
  const stops: TransitStop[] = [];
  
  if (!data.stop?.route) return stops;
  
  const routes = Array.isArray(data.stop.route) 
    ? data.stop.route 
    : [data.stop.route];
  
  for (const route of routes) {
    if (route.prediction) {
      const predictions = Array.isArray(route.prediction) 
        ? route.prediction 
        : [route.prediction];
      
      for (const pred of predictions) {
        stops.push({
          id: stopId,
          name: data.stop.stopName || '',
          distance: 0,
          routes: [route.routeID],
          waitTime: parseInt(pred.minutes) || 0,
        });
      }
    }
  }
  
  return stops;
}

export async function getTransitForLocation(
  lat: number,
  lon: number,
  radius: number = 0.5
): Promise<TransitData> {
  const nearbyStops = await findNearbyStops(lat, lon, radius);
  
  if (nearbyStops.length === 0) {
    return getMockTransitData();
  }
  
  const allArrivals: TransitStop[] = [];
  for (const stop of nearbyStops.slice(0, 3)) {
    const arrivals = await getArrivals(stop.id);
    allArrivals.push(...arrivals);
  }
  
  const score = calculateTransitScore(nearbyStops.length, allArrivals);
  const busFrequency = calculateBusFrequency(allArrivals);
  
  return {
    score,
    stops: allArrivals.slice(0, 5),
    busFrequency,
  };
}

async function findNearbyStops(
  lat: number,
  lon: number,
  radius: number
): Promise<{ id: string; name: string; distance: number }[]> {
  const stops = getMadisonStops();
  const nearby = stops
    .map(stop => ({
      ...stop,
      distance: haversineDistance(lat, lon, stop.lat, stop.lon),
    }))
    .filter(stop => stop.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
  
  return nearby;
}

function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 3959;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function calculateTransitScore(stopCount: number, arrivals: TransitStop[]): number {
  if (stopCount === 0) return 0;
  
  const avgWaitTime = arrivals.length > 0
    ? arrivals.reduce((sum, a) => sum + a.waitTime, 0) / arrivals.length
    : 30;
  
  const stopScore = Math.min(stopCount * 20, 50);
  const waitScore = Math.max(50 - avgWaitTime, 0);
  
  return Math.min(stopScore + waitScore, 100);
}

function calculateBusFrequency(arrivals: TransitStop[]): number {
  if (arrivals.length === 0) return 0;
  
  const uniqueRoutes = new Set(arrivals.map(a => a.routes.join(',')).join(',').split(','));
  return uniqueRoutes.size * 15;
}

function getMockTransitData(): TransitData {
  return { score: 72, stops: getMockArrivals('mock'), busFrequency: 45 };
}

function getMockArrivals(stopId: string): TransitStop[] {
  return [
    { id: '1787', name: 'Capitol Square', distance: 0.2, routes: ['B', '2', '4'], waitTime: 5 },
    { id: '1788', name: 'State Street', distance: 0.3, routes: ['3', '6'], waitTime: 8 },
    { id: '1789', name: 'East Johnson', distance: 0.4, routes: ['A', '10'], waitTime: 12 },
  ];
}

function getMadisonStops() {
  return [
    { id: '1787', name: 'Capitol Square', lat: 43.0748, lon: -89.3842 },
    { id: '1788', name: 'State Street', lat: 43.0731, lon: -89.4012 },
    { id: '1789', name: 'East Johnson', lat: 43.0900, lon: -89.3700 },
    { id: '1790', name: 'Campus Dr', lat: 43.0769, lon: -89.4125 },
    { id: '1791', name: 'South Park St', lat: 43.0580, lon: -89.3890 },
  ];
}
