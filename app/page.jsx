'use client';

import React, { useState, useEffect, useRef } from 'react';
import Map, { Source, Layer, NavigationControl } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import TenantAuth from './TenantAuth';

const MADISON_CENTER = {
  latitude: 43.0731,
  longitude: -89.3841,
  zoom: 13
};

const parcelLayerStyle = {
  id: 'parcel-layer',
  source: 'parcels',
  type: 'fill',
  paint: {
    'fill-color': '#6b7280',
    'fill-opacity': 0.3,
    'fill-outline-color': '#374151'
  }
};

const parcelHighlightStyle = {
  id: 'parcel-highlight',
  source: 'parcels',
  type: 'line',
  paint: {
    'line-color': '#2563eb',
    'line-width': 2
  }
};

const landlordHighlightStyle = {
  id: 'landlord-highlight',
  source: 'parcels',
  type: 'line',
  paint: {
    'line-color': '#dc2626',
    'line-width': 3
  }
};

const landlordHighlightFillStyle = {
  id: 'landlord-highlight-fill',
  source: 'parcels',
  type: 'fill',
  paint: {
    'fill-color': '#dc2626',
    'fill-opacity': 0.2
  }
};

async function fetchParcels() {
  const response = await fetch('/renters.geojson');
  const data = await response.json();
  console.log('Loaded parcel data:', data);
  return data;
}

function InfoPanel({ parcel, onClose, onShowLandlordProperties, onSelectAddress, parcelData }) {
  if (!parcel) return null;

  const address = parcel.properties.Address || 'N/A';
  const owner = parcel.properties.ManagementGroup || 'N/A';
  const propertyUse = parcel.properties.PropertyUse || 'N/A';

  const [showLandlordDetails, setShowLandlordDetails] = useState(false);

  const mockRentData = [
    { beds: 2, baths: 1, rent: 1200, water: 50, utilities: 100, date: '2024-01-15' },
    { beds: 3, baths: 2, rent: 1600, water: 75, utilities: 150, date: '2024-02-20' },
  ];

  const landlordProperties = parcelData?.features
    .filter(f => f.properties.ManagementGroup === owner)
    .map(f => f.properties.Address) || [];

  const landlord = {
    name: owner,
    properties: landlordProperties.length,
    avgRent: 1450,
    rating: 4.2,
    totalUnits: 24,
    violations: 2,
    lastInspection: '2024-01-10',
    addresses: landlordProperties,
  };

  return (
    <div className="absolute right-4 top-4 w-100 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden max-h-[80vh] overflow-y-auto">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-semibold text-gray-800">Parcel Information</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <div className="text-xs text-gray-500 uppercase">Address</div>
          <div className="text-gray-900 font-medium">{address}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase">Owner</div>
          <div className="text-gray-900">{owner}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase">Property Type</div>
          <div className="text-gray-900">{propertyUse}</div>
        </div>
      </div>
      <div className="border-t border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-2">Reported Rent Data</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1 text-left">Beds/Baths</th>
              <th className="px-2 py-1 text-right">Rent</th>
              <th className="px-2 py-1 text-right">Water</th>
              <th className="px-2 py-1 text-right">Utils</th>
              <th className="px-2 py-1 text-right">Total</th>
              <th className="px-2 py-1 text-right">Reported</th>
            </tr>
          </thead>
          <tbody>
            {mockRentData.map((unit, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="px-2 py-1">{unit.beds}bd/{unit.baths}ba</td>
                <td className="px-2 py-1 text-right">${unit.rent}</td>
                <td className="px-2 py-1 text-right">${unit.water}</td>
                <td className="px-2 py-1 text-right">${unit.utilities}</td>
                <td className="px-2 py-1 text-right font-medium">${unit.rent + unit.water + unit.utilities}</td>
                <td className="px-2 py-1 text-right text-gray-500">{unit.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-200 p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-800">Landlord</h3>
          <button 
            onClick={() => {
              const newState = !showLandlordDetails;
              setShowLandlordDetails(newState);
              onShowLandlordProperties?.(newState ? landlord.addresses : null);
            }}
            className="text-xs text-blue-600 hover:underline"
          >
            {showLandlordDetails ? 'View Less' : 'View More'}
          </button>
        </div>
        <div className="text-sm">
          <div className="font-medium text-gray-800">{landlord.name}</div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
            <div>Properties: <span className="text-gray-800 font-medium">{landlord.properties}</span></div>
            <div>Avg Rent: <span className="text-gray-800 font-medium">${landlord.avgRent}</span></div>
            <div>Rating: <span className="text-gray-800 font-medium">{landlord.rating}/5</span></div>
            <div>Units: <span className="text-gray-800 font-medium">{landlord.totalUnits}</span></div>
          </div>
        </div>
        {showLandlordDetails && (
          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
            <div className="grid grid-cols-2 gap-2">
              <div>Code Violations: <span className="text-gray-800 font-medium">{landlord.violations}</span></div>
              <div>Last Inspection: <span className="text-gray-800 font-medium">{landlord.lastInspection}</span></div>
            </div>
            <div className="mt-3">
              <div className="font-medium text-gray-800 mb-1">Other Properties:</div>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {landlord.addresses.map((addr, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => onSelectAddress?.(addr)}
                    className="text-gray-600 truncate cursor-pointer hover:text-blue-600 hover:underline"
                  >
                    {addr}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ParcelMap() {
  const [parcelData, setParcelData] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [highlightedAddresses, setHighlightedAddresses] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchParcels()
      .then(data => {
        console.log('Parcel data:', data);
        if (data.error) {
          console.error('API Error:', data.error);
        }
        setParcelData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch parcels:', err);
        setLoading(false);
      });
  }, []);

  const handleMapClick = (event) => {
    if (!mapRef.current || !parcelData) return;

    const features = mapRef.current.queryRenderedFeatures(event.point, {
      layers: ['parcel-layer']
    });

    if (features.length > 0) {
      setSelectedParcel(features[0]);
    } else {
      setSelectedParcel(null);
    }
  };

  const flyToAddress = (address) => {
    if (!mapRef.current || !parcelData) return;
    
    const feature = parcelData.features.find(f => f.properties.Address === address);
    if (feature) {
      const [lng, lat] = feature.geometry.coordinates[0][0];
      mapRef.current.flyTo({ center: [lng, lat], zoom: 16 });
      setSelectedParcel(feature);
    }
  };

  const onMapLoad = () => {
    setMapLoaded(true);
  };

  return (
    <div className="relative w-full h-screen">
      <Map
        ref={mapRef}
        initialViewState={MADISON_CENTER}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        onClick={handleMapClick}
        onLoad={onMapLoad}
      >
        <NavigationControl position="bottom-left" />

        {mapLoaded && parcelData && (
          <Source id="parcels" type="geojson" data={parcelData}>
            <Layer {...parcelLayerStyle} />
            {selectedParcel && (
              <Layer
                {...parcelHighlightStyle}
                filter={['==', 'Address', selectedParcel.properties.Address]}
              />
            )}
            {highlightedAddresses && (
              <React.Fragment key={highlightedAddresses.join('-')}>
                <Layer
                  {...landlordHighlightFillStyle}
                  filter={['any', ...highlightedAddresses.map(addr => ['==', 'Address', addr])]}
                />
                <Layer
                  {...landlordHighlightStyle}
                  filter={selectedParcel 
                    ? ['all', 
                        ['any', ...highlightedAddresses.map(addr => ['==', 'Address', addr])],
                        ['!=', 'Address', selectedParcel.properties.Address]
                      ]
                    : ['any', ...highlightedAddresses.map(addr => ['==', 'Address', addr])]
                  }
                />
              </React.Fragment>
            )}
          </Source>
        )}
      </Map>

      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-gray-600">Loading parcels...</div>
        </div>
      )}

      <InfoPanel parcel={selectedParcel} onClose={() => setSelectedParcel(null)} onShowLandlordProperties={setHighlightedAddresses} onSelectAddress={flyToAddress} parcelData={parcelData} />

      {!loading && !selectedParcel && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg text-sm text-gray-600">
          Click on a parcel to view details
        </div>
      )}

      {/* The Floating Auth Panel */}
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 w-80">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
          <h1 className="font-bold text-xl text-gray-800">LeaseLens</h1>
        </div>
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
          <input 
            type="text" 
            placeholder="Search address..." 
            className="w-full text-sm px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        <TenantAuth />
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-left">
          <p className="text-sm text-gray-600 mb-3">Upload your data to help fellow renters!</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors text-sm">
            Add information about your lease
          </button>
        </div>
      </div>
    </div>
  );
}
