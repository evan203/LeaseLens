'use client';

import React, { useState, useEffect } from 'react';

const mockRentData = [
  { beds: 2, baths: 1, rent: 1200, water: 50, utilities: 100, date: '2024-01-15' },
  { beds: 3, baths: 2, rent: 1600, water: 75, utilities: 150, date: '2024-02-20' },
];

export default function InfoPanel({ parcel, onClose, onShowLandlordProperties, onSelectAddress, parcelData, showLandlordListOnly }) {
  const [activeTab, setActiveTab] = useState('parcel');
  const [selectedLandlord, setSelectedLandlord] = useState(null);

  useEffect(() => {
    if (!showLandlordListOnly) {
      onShowLandlordProperties?.(null);
      setActiveTab('parcel');
      setSelectedLandlord(null);
    } else {
      setActiveTab('landlords');
    }
  }, [parcel, showLandlordListOnly]);

  const currentTab = showLandlordListOnly ? 'landlords' : activeTab;

  if (!parcel && !showLandlordListOnly) return null;

  const address = parcel?.properties.Address || 'N/A';
  const owner = parcel?.properties.ManagementGroup || 'N/A';
  const propertyUse = parcel?.properties.PropertyUse || 'N/A';

  const landlordProperties = parcelData?.features
    .filter(f => f.properties.ManagementGroup === owner)
    .map(f => f.properties.Address) || [];

  const currentLandlord = {
    name: owner,
    properties: landlordProperties.length,
    avgRent: 1450,
    rating: 4.2,
    totalUnits: 24,
    violations: 2,
    lastInspection: '2024-01-10',
    addresses: landlordProperties,
  };

  const landlordMap = new Map();
  parcelData?.features.forEach(f => {
    const o = f.properties.ManagementGroup;
    if (o && o !== 'N/A') {
      if (!landlordMap.has(o)) {
        landlordMap.set(o, { name: o, count: 0 });
      }
      landlordMap.get(o).count += 1;
    }
  });
  const allLandlords = Array.from(landlordMap.values()).sort((a, b) => b.count - a.count);

  const handleViewMore = () => {
    if (showLandlordListOnly) return;
    const otherAddresses = currentLandlord.addresses.filter(addr => addr !== address);
    onShowLandlordProperties?.(otherAddresses);
    setActiveTab('landlords');
  };

  const handleSelectLandlord = (landlordName) => {
    const addresses = parcelData?.features
      .filter(f => f.properties.ManagementGroup === landlordName)
      .map(f => f.properties.Address) || [];
    onShowLandlordProperties?.(addresses);
    setSelectedLandlord(landlordName);
  };

  const getLandlordInfo = (landlordName) => {
    const addresses = parcelData?.features
      .filter(f => f.properties.ManagementGroup === landlordName)
      .map(f => f.properties.Address) || [];
    return {
      name: landlordName,
      properties: addresses.length,
      avgRent: 1450,
      rating: 4.2,
      totalUnits: 24,
      violations: 2,
      lastInspection: '2024-01-10',
      addresses,
    };
  };

  const renderParcelTab = () => (
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
      <button
        onClick={handleViewMore}
        className="w-full mt-2 text-xs text-blue-600 hover:underline"
      >
        View Landlord Info
      </button>
    </div>
  );

  const renderLandlordsTab = () => {
    if (showLandlordListOnly) {
      if (selectedLandlord) {
        const landlord = getLandlordInfo(selectedLandlord);
        return (
          <div className="p-4 space-y-4">
            <div>
              <div className="text-xs text-gray-500 uppercase">Current Landlord</div>
              <div className="font-medium text-gray-800">{landlord.name}</div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                <div>Properties: <span className="text-gray-800 font-medium">{landlord.properties}</span></div>
                <div>Avg Rent: <span className="text-gray-800 font-medium">${landlord.avgRent}</span></div>
                <div>Rating: <span className="text-gray-800 font-medium">{landlord.rating}/5</span></div>
                <div>Units: <span className="text-gray-800 font-medium">{landlord.totalUnits}</span></div>
                <div>Code Violations: <span className="text-gray-800 font-medium">{landlord.violations}</span></div>
                <div>Last Inspection: <span className="text-gray-800 font-medium">{landlord.lastInspection}</span></div>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase mb-2">Properties by This Landlord</div>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {landlord.addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectAddress?.(addr)}
                    className="text-sm text-gray-600 truncate cursor-pointer hover:text-blue-600 hover:underline"
                  >
                    {addr}
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => setSelectedLandlord(null)}
                className="text-sm text-blue-600 hover:underline mb-2"
              >
                ← Back to all landlords
              </button>
              <div className="text-xs text-gray-500 uppercase mb-2">All Landlords</div>
              <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                {allLandlords.map((l, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectLandlord(l.name)}
                    className={`p-2 border rounded cursor-pointer text-sm ${
                      l.name === selectedLandlord ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-800">{l.name}</div>
                    <div className="text-xs text-gray-500">{l.count} properties</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="p-4">
          <div className="text-sm text-gray-600 mb-4">Click a landlord to highlight their properties</div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {allLandlords.map((l, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectLandlord(l.name)}
                className="p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
              >
                <div className="font-medium text-gray-800">{l.name}</div>
                <div className="text-xs text-gray-500">{l.count} properties</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 space-y-4">
        <div>
          <div className="text-xs text-gray-500 uppercase">Current Landlord</div>
          <div className="font-medium text-gray-800">{currentLandlord.name}</div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
            <div>Properties: <span className="text-gray-800 font-medium">{currentLandlord.properties}</span></div>
            <div>Avg Rent: <span className="text-gray-800 font-medium">${currentLandlord.avgRent}</span></div>
            <div>Rating: <span className="text-gray-800 font-medium">{currentLandlord.rating}/5</span></div>
            <div>Units: <span className="text-gray-800 font-medium">{currentLandlord.totalUnits}</span></div>
            <div>Code Violations: <span className="text-gray-800 font-medium">{currentLandlord.violations}</span></div>
            <div>Last Inspection: <span className="text-gray-800 font-medium">{currentLandlord.lastInspection}</span></div>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase mb-2">Other Properties by This Landlord</div>
          <div className="max-h-24 overflow-y-auto space-y-1">
            {currentLandlord.addresses.filter(addr => addr !== address).map((addr, idx) => (
              <div
                key={idx}
                onClick={() => onSelectAddress?.(addr)}
                className="text-sm text-gray-600 truncate cursor-pointer hover:text-blue-600 hover:underline"
              >
                {addr}
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <div className="text-xs text-gray-500 uppercase mb-2">All Landlords</div>
          <div className="space-y-2 max-h-[30vh] overflow-y-auto">
            {allLandlords.map((l, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectLandlord(l.name)}
                className={`p-2 border rounded cursor-pointer text-sm ${
                  l.name === currentLandlord.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-800">{l.name}</div>
                <div className="text-xs text-gray-500">{l.count} properties</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute right-4 top-4 w-100 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden max-h-[80vh] overflow-y-auto">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setActiveTab('parcel');
              onShowLandlordProperties?.(null);
            }}
            className={`font-semibold text-sm ${currentTab === 'parcel' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Parcel
          </button>
          <button
            onClick={handleViewMore}
            className={`font-semibold text-sm ${currentTab === 'landlords' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Landlords
          </button>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {currentTab === 'parcel' ? renderParcelTab() : renderLandlordsTab()}
    </div>
  );
}
