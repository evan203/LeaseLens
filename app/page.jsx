'use client';

import React, { useState, useEffect, useRef } from 'react';
import Map, { Source, Layer, NavigationControl } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MADISON_CENTER, MAP_STYLE } from '@/components/mapConstants';
import { fetchParcels } from '@/lib/fetchParcels';
import {
  parcelLayerStyle,
  parcelHighlightStyle,
  landlordHighlightStyle,
  landlordHighlightFillStyle
} from '@/components/mapLayers';
import InfoPanel from '@/components/InfoPanel';
import MapHeader from '@/components/MapHeader';

export default function ParcelMap() {
  const [parcelData, setParcelData] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [highlightedAddresses, setHighlightedAddresses] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    setHighlightedAddresses(null);
  }, [selectedParcel]);

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
        mapStyle={MAP_STYLE}
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
              <div>
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
              </div>
            )}
          </Source>
        )}
      </Map>

      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-gray-600">Loading parcels...</div>
        </div>
      )}

      <InfoPanel
        parcel={selectedParcel}
        onClose={() => {
          setSelectedParcel(null);
          setHighlightedAddresses(null);
        }}
        onShowLandlordProperties={setHighlightedAddresses}
        onSelectAddress={flyToAddress}
        parcelData={parcelData}
      />

      {!loading && !selectedParcel && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg text-sm text-gray-600">
          Click on a parcel to view details
        </div>
      )}

      <MapHeader />
    </div>
  );
}
