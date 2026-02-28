import { Property } from '../types';

const ARCGIS_BASE = 'https://maps.cityofmadison.com/arcgis/rest/services/Public/OPEN_DATA/MapServer';

const PARCEL_LAYER_ID = '4';

export async function searchParcelsByAddress(address: string): Promise<Property[]> {
  const encodedAddress = encodeURIComponent(address);
  const url = `${ARCGIS_BASE}/${PARCEL_LAYER_ID}/query?where=UPPER(SITEADDR)%20LIKE%20UPPER('%25${encodedAddress}%25')&outFields=*&f=json&outSR=4326`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return [];
    }
    
    return data.features.map((feature: any) => parseParcelFeature(feature));
  } catch (error) {
    console.error('Error fetching parcels:', error);
    return [];
  }
}

export async function getParcelById(parcelId: string): Promise<Property | null> {
  const url = `${ARCGIS_BASE}/${PARCEL_LAYER_ID}/query?where=PARCELNO%3D'${parcelId}'&outFields=*&f=json&outSR=4326`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return null;
    }
    
    return parseParcelFeature(data.features[0]);
  } catch (error) {
    console.error('Error fetching parcel:', error);
    return null;
  }
}

export async function getParcelsInBounds(
  minLat: number,
  minLon: number,
  maxLat: number,
  maxLon: number
): Promise<Property[]> {
  const geometry = `${minLon},${minLat},${maxLon},${maxLat}`;
  const url = `${ARCGIS_BASE}/${PARCEL_LAYER_ID}/query?geometry=${geometry}&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&outFields=*&f=json&outSR=4326`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return [];
    }
    
    return data.features.map((feature: any) => parseParcelFeature(feature)).slice(0, 50);
  } catch (error) {
    console.error('Error fetching parcels in bounds:', error);
    return [];
  }
}

function parseParcelFeature(feature: any): Property {
  const attrs = feature.attributes;
  const geometry = feature.geometry;
  
  return {
    id: attrs.PARCELNO || attrs.OBJECTID,
    address: attrs.SITEADDR || '',
    parcelId: attrs.PARCELNO || '',
    owner: attrs.OWNER || '',
    ownerAddress: attrs.OWNERADD || '',
    assessedValue: attrs.ASSESSEDVAL || 0,
    propertyType: attrs.PROPERTYTYPE || '',
    yearBuilt: attrs.YEARBUILT,
    latitude: geometry?.y || 0,
    longitude: geometry?.x || 0,
    zoning: attrs.ZONING,
  };
}

export async function getOwnerProperties(ownerName: string): Promise<Property[]> {
  const encodedName = encodeURIComponent(ownerName);
  const url = `${ARCGIS_BASE}/${PARCEL_LAYER_ID}/query?where=UPPER(OWNER)%20LIKE%20UPPER('%25${encodedName}%25')&outFields=*&f=json&outSR=4326`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return [];
    }
    
    return data.features.map((feature: any) => parseParcelFeature(feature));
  } catch (error) {
    console.error('Error fetching owner properties:', error);
    return [];
  }
}
