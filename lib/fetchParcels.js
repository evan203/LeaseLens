export async function fetchParcels() {
  const response = await fetch('/renters.geojson');
  const data = await response.json();
  console.log('Loaded parcel data:', data);
  return data;
}

export async function fetchAmenities() {
  const response = await fetch('/amenities.geojson');
  const data = await response.json();
  console.log('Loaded amenities data:', data);
  return data;
}

export async function fetchBusStops() {
  const response = await fetch('/Metro_Transit_Bus_Stops.geojson');
  const data = await response.json();
  console.log('Loaded bus stops data:', data);
  return data;
}

export async function fetchBusRoutes() {
  const response = await fetch('/Bus_Route.geojson');
  const data = await response.json();
  console.log('Loaded bus routes data:', data);
  return data;
}
