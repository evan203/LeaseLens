export const parcelLayerStyle = {
  id: 'parcel-layer',
  source: 'parcels',
  type: 'fill',
  paint: {
    'fill-color': '#6b7280',
    'fill-opacity': 0.3,
    'fill-outline-color': '#374151'
  }
};

export const parcelHighlightStyle = {
  id: 'parcel-highlight',
  source: 'parcels',
  type: 'line',
  paint: {
    'line-color': '#2563eb',
    'line-width': 2
  }
};

export const landlordHighlightStyle = {
  id: 'landlord-highlight',
  source: 'parcels',
  type: 'line',
  paint: {
    'line-color': '#dc2626',
    'line-width': 3
  }
};

export const landlordHighlightFillStyle = {
  id: 'landlord-highlight-fill',
  source: 'parcels',
  type: 'fill',
  paint: {
    'fill-color': '#dc2626',
    'fill-opacity': 0.2
  }
};
