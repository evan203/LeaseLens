const fs = require('fs');

const API_URL = 'https://maps.cityofmadison.com/arcgis/rest/services/Planning/Zoning/MapServer/3/query';
const OUT_FILE = './public/madison_parcels.json';

const FIELDS = 'OwnerName1,OwnerName2,Address,PropertyUse,Zoning1';
const BATCH_SIZE = 1000;

async function fetchParcels(offset = 0) {
  const url = `${API_URL}?where=1%3D1&outFields=${FIELDS}&returnGeometry=true&f=json&outSR=4326&resultRecordCount=${BATCH_SIZE}&resultOffset=${offset}`;
  
  console.log(`Fetching offset ${offset}...`);
  
  const response = await fetch(url);
  const data = await response.json();
  
  return data;
}

async function downloadAllParcels() {
  let allFeatures = [];
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const data = await fetchParcels(offset);
    
    if (!data.features || data.features.length === 0) {
      hasMore = false;
      break;
    }
    
    for (const f of data.features) {
      allFeatures.push({
        type: 'Feature',
        properties: f.attributes,
        geometry: {
          type: 'Polygon',
          coordinates: f.geometry.rings
        }
      });
    }
    
    console.log(`  Got ${data.features.length} features, total: ${allFeatures.length}`);
    
    if (data.features.length < BATCH_SIZE) {
      hasMore = false;
    } else {
      offset += BATCH_SIZE;
    }
  }
  
  const geojson = {
    type: 'FeatureCollection',
    features: allFeatures
  };
  
  console.log(`Total features: ${allFeatures.length}`);
  
  fs.writeFileSync(OUT_FILE, JSON.stringify(geojson, null, 2));
  console.log(`Saved to ${OUT_FILE}`);
}

downloadAllParcels().catch(console.error);
