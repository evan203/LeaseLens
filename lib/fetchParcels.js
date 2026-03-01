export async function fetchParcels() {
  const response = await fetch('/renters.geojson');
  const data = await response.json();
  console.log('Loaded parcel data:', data);
  return data;
}
