'use client';

import React, { useState, useEffect, useRef } from 'react';
import Map, { Source, Layer, NavigationControl } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MADISON_CENTER, MAP_STYLE } from '@/components/mapConstants';
import { fetchParcels, fetchBusStops, fetchBusRoutes } from '@/lib/fetchParcels';
import {
  parcelLayerStyle,
  parcelHighlightStyle,
  landlordHighlightStyle,
  landlordHighlightFillStyle,
  groceryHeatmapStyle,
  busStopStyle,
  busRouteStyle
} from '@/components/mapLayers';
import InfoPanel from '@/components/InfoPanel';
import MapHeader from '@/components/MapHeader';
import LeaseForm from '@/components/LeaseForm';
import { addReview } from '@/lib/reviews';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { useAuth } from '@/contexts/AuthContext';

export default function ParcelMap() {
  const { user } = useAuth();
  const [parcelData, setParcelData] = useState(null);
  const [busStopsData, setBusStopsData] = useState(null);
  const [busRoutesData, setBusRoutesData] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [highlightedAddresses, setHighlightedAddresses] = useState(null);
  const [showLeaseForm, setShowLeaseForm] = useState(false);
  const [leaseFormData, setLeaseFormData] = useState({
    address: '',
    bedrooms: '',
    bathrooms: '',
    rent: '',
    waterBill: '',
    electricityBill: '',
    gasBill: '',
    rating: 5,
    maintenanceTime: '',
    maintenanceQuality: '',
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groceryHeatmapFilter, setGroceryHeatmapFilter] = useState('none');
  const [landlordListOpen, setLandlordListOpen] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHighlightedAddresses(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLandlordListOpen(false);
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

    fetchBusStops()
      .then(data => {
        setBusStopsData(data);
      })
      .catch(err => {
        console.error('Failed to fetch bus stops:', err);
      });

    fetchBusRoutes()
      .then(data => {
        setBusRoutesData(data);
      })
      .catch(err => {
        console.error('Failed to fetch bus routes:', err);
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
            {groceryHeatmapFilter !== 'none' && <Layer {...groceryHeatmapStyle} />}
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

        {mapLoaded && busStopsData && (
          <Source id="bus-stops" type="geojson" data={busStopsData}>
            <Layer {...busStopStyle} />
          </Source>
        )}

        {mapLoaded && busRoutesData && (
          <Source id="bus-routes" type="geojson" data={busRoutesData}>
            <Layer {...busRouteStyle} />
          </Source>
        )}
      </Map>

      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-gray-600">Loading parcels...</div>
        </div>
      )}

      <InfoPanel
        key={selectedParcel?.properties?.Address || 'no-parcel'}
        parcel={selectedParcel}
        onClose={() => {
          setSelectedParcel(null);
          setHighlightedAddresses(null);
          setLandlordListOpen(false);
        }}
        onShowLandlordProperties={setHighlightedAddresses}
        onSelectAddress={(addr) => {
          flyToAddress(addr);
          setLandlordListOpen(false);
        }}
        parcelData={parcelData}
        showLandlordListOnly={landlordListOpen}
      />

      {!selectedParcel && !landlordListOpen && (
        <button
          onClick={() => {
            setSelectedParcel(null);
            setHighlightedAddresses(null);
            setLandlordListOpen(true);
          }}
          className="absolute top-4 right-4 z-10 bg-white px-4 py-2 rounded-lg shadow-md border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          View Landlords List
        </button>
      )}

      <MapHeader
        parcelData={parcelData}
        onSearchAddress={flyToAddress}
        onOpenLeaseForm={() => setShowLeaseForm(true)}
        groceryHeatmapFilter={groceryHeatmapFilter}
        setGroceryHeatmapFilter={setGroceryHeatmapFilter}
      />

      {showLeaseForm && (
        <LeaseForm 
          parcelData={parcelData} 
          onClose={() => setShowLeaseForm(false)} 
        />
      )}
    </div>
  );
}
