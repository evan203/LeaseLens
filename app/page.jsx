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
  type: 'fill',
  paint: {
    'fill-color': '#6b7280',
    'fill-opacity': 0.3,
    'fill-outline-color': '#374151'
  }
};

const parcelHighlightStyle = {
  id: 'parcel-highlight',
  type: 'line',
  paint: {
    'line-color': '#2563eb',
    'line-width': 2
  }
};

async function fetchParcels() {
  const response = await fetch('/renters.geojson');
  const data = await response.json();
  console.log('Loaded parcel data:', data);
  return data;
}

function InfoPanel({ parcel, onClose }) {
  if (!parcel) return null;

  const address = parcel.properties.Address || 'N/A';
  const owner = [parcel.properties.OwnerName1, parcel.properties.OwnerName2].filter(Boolean).join(' ') || 'N/A';
  const propertyUse = parcel.properties.PropertyUse || 'N/A';

  const mockRentData = [
    { beds: 2, baths: 1, rent: 1200, water: 50, utilities: 100, date: '2024-01-15' },
    { beds: 3, baths: 2, rent: 1600, water: 75, utilities: 150, date: '2024-02-20' },
  ];

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
    </div>
  );
}

export default function ParcelMap() {
  const [parcelData, setParcelData] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
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
          </Source>
        )}
      </Map>

      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-gray-600">Loading parcels...</div>
        </div>
      )}

      <InfoPanel parcel={selectedParcel} onClose={() => setSelectedParcel(null)} />

      {!loading && !selectedParcel && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg text-sm text-gray-600">
          Click on a parcel to view details
        </div>
      )}

      {/* The Floating Auth Panel */}
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
        <div className="bg-white px-4 py-2 rounded-lg shadow-xl border border-gray-200">
          <h1 className="font-bold text-xl text-gray-1200">LeaseLens</h1>
        </div>
        <TenantAuth />
      </div>
    </div>
  );
}
