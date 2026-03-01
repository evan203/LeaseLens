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

export const groceryWalkabilityStyle = {
  id: 'grocery-walkability',
  source: 'parcels',
  type: 'fill',
  paint: {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'dist_miles_grocery'],
      0, '#16a34a',
      0.25, '#4ade80',
      0.5, '#facc15',
      1, '#f97316',
      2, '#dc2626'
    ],
    'fill-opacity': 0.5
  }
};

export const pharmacyWalkabilityStyle = {
  id: 'pharmacy-walkability',
  source: 'parcels',
  type: 'fill',
  paint: {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'dist_miles_pharmacy'],
      0, '#2563eb',
      0.25, '#60a5fa',
      0.5, '#facc15',
      1, '#f97316',
      2, '#dc2626'
    ],
    'fill-opacity': 0.5
  }
};

export const gymWalkabilityStyle = {
  id: 'gym-walkability',
  source: 'parcels',
  type: 'fill',
  paint: {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'dist_miles_gym'],
      0, '#ea580c',
      0.25, '#fb923c',
      0.5, '#facc15',
      1, '#f97316',
      2, '#dc2626'
    ],
    'fill-opacity': 0.5
  }
};

export const groceryHeatmapStyle = {
  id: 'grocery-heatmap',
  source: 'parcels',
  type: 'heatmap',
  paint: {
    'heatmap-weight': [
      'interpolate',
      ['linear'],
      ['get', 'dist_miles_grocery'],
      0, 1,
      3, 0.3
    ],
    'heatmap-intensity': 1,
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(33,102,172,0)',
      0.2, 'rgb(103,169,207)',
      0.4, 'rgb(209,229,240)',
      0.6, 'rgb(253,219,199)',
      0.8, 'rgb(239,138,98)',
      1, 'rgb(178,24,43)'
    ],
    'heatmap-radius': 30,
    'heatmap-opacity': 0.7
  }
};

export const amenityLayerStyle = {
  grocery: {
    id: 'amenity-grocery',
    type: 'circle',
    paint: {
      'circle-radius': 8,
      'circle-color': '#16a34a',
      'circle-opacity': 0.7,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#166534'
    }
  },
  pharmacy: {
    id: 'amenity-pharmacy',
    type: 'circle',
    paint: {
      'circle-radius': 8,
      'circle-color': '#2563eb',
      'circle-opacity': 0.7,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#1e40af'
    }
  },
  gym: {
    id: 'amenity-gym',
    type: 'circle',
    paint: {
      'circle-radius': 8,
      'circle-color': '#ea580c',
      'circle-opacity': 0.7,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#9a3412'
    }
  }
};

export const amenityHighlightStyle = {
  id: 'amenity-highlight',
  type: 'circle',
  paint: {
    'circle-radius': 12,
    'circle-stroke-width': 3,
    'circle-stroke-color': '#ffffff'
  }
};

export const busStopStyle = {
  id: 'bus-stops',
  type: 'circle',
  paint: {
    'circle-radius': 4,
    'circle-color': '#f59e0b',
    'circle-opacity': 0.8,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#b45309'
  }
};

export const busRouteStyle = {
  id: 'bus-routes',
  type: 'line',
  paint: {
    'line-color': '#3b82f6',
    'line-width': 2,
    'line-opacity': 0.7
  }
};
