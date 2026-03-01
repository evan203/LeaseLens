'use client';

import React, { useState, useEffect } from 'react';

export default function InfoPanel({ parcel, onClose, onShowLandlordProperties, onSelectAddress, parcelData, showLandlordListOnly }) {
  const [activeTab, setActiveTab] = useState('parcel');
  const [selectedLandlord, setSelectedLandlord] = useState(null);
  const [landlordData, setLandlordData] = useState(null);
  const [loadingLandlordData, setLoadingLandlordData] = useState(false);

  useEffect(() => {
    if (!showLandlordListOnly) {
      onShowLandlordProperties?.(null);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab('parcel');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedLandlord(null);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLandlordData(null);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab('landlords');
    }
  }, [parcel, showLandlordListOnly, onShowLandlordProperties]);

  const currentTab = showLandlordListOnly ? 'landlords' : activeTab;
  const address = parcel?.properties.Address || 'N/A';
  const owner = parcel?.properties.ManagementGroup || 'N/A';
  const propertyUse = parcel?.properties.PropertyUse || 'N/A';

  useEffect(() => {
    const fetchLandlordData = (landlordName) => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingLandlordData(true);
      fetch(`/api/landlords?landlordName=${encodeURIComponent(landlordName)}`)
        .then(res => res.json())
        .then(data => {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setLandlordData(data);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setLoadingLandlordData(false);
        })
        .catch(err => {
          console.error('Error fetching landlord data:', err);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setLandlordData(null);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setLoadingLandlordData(false);
        });
    };

    if (selectedLandlord) {
      fetchLandlordData(selectedLandlord);
    } else if (owner && owner !== 'N/A' && !showLandlordListOnly) {
      fetchLandlordData(owner);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLandlordData(null);
    }
  }, [selectedLandlord, owner, showLandlordListOnly]);

  if (!parcel && !showLandlordListOnly) return null;
  const address = parcel.properties.Address || 'N/A';
  const owner = parcel.properties.ManagementGroup || 'N/A';
  const propertyUse = parcel.properties.PropertyUse || 'N/A';
  const distMilesGrocery = parcel.properties.dist_miles_grocery;
  const walkTimeMinsGrocery = parcel.properties.walk_time_mins_grocery;
  const nearestGrocery = parcel.properties.nearest_grocery;
  const hasGroceryData = distMilesGrocery !== undefined || walkTimeMinsGrocery !== undefined;

  const distMilesPharmacy = parcel.properties.dist_miles_pharmacy;
  const walkTimeMinsPharmacy = parcel.properties.walk_time_mins_pharmacy;
  const nearestPharmacy = parcel.properties.nearest_pharmacy;
  const hasPharmacyData = distMilesPharmacy !== undefined || walkTimeMinsPharmacy !== undefined;

  const distMilesGym = parcel.properties.dist_miles_gym;
  const walkTimeMinsGym = parcel.properties.walk_time_mins_gym;
  const nearestGym = parcel.properties.nearest_gym;
  const hasGymData = distMilesGym !== undefined || walkTimeMinsGym !== undefined;

  const distMilesCampus = parcel.properties.dist_miles_campus;
  const walkTimeMinsCampus = parcel.properties.walk_time_mins_campus;
  const hasCampusData = distMilesCampus !== undefined || walkTimeMinsCampus !== undefined;

  console.log('Parcel props:', parcel.properties);
  console.log('Grocery data:', { distMilesGrocery, walkTimeMinsGrocery, nearestGrocery, hasGroceryData });

  const landlordProperties = parcelData?.features
    .filter(f => f.properties.ManagementGroup === owner)
    .map(f => f.properties.Address) || [];

  const currentLandlord = {
    name: owner,
    properties: landlordProperties.length,
    avgRent: landlordData?.avgRent || 'NA',
    rating: landlordData?.avgRating || 'NA',
    totalUnits: landlordData?.totalUnits || 'NA',
    violations: landlordData?.violations || 'NA',
    lastInspection: landlordData?.lastInspection || 'NA',
    addresses: landlordProperties,
    rentData: landlordData?.rentData || 'NA',
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
    
    if (selectedLandlord === landlordName && landlordData) {
      return {
        name: landlordName,
        properties: addresses.length,
        avgRent: landlordData.avgRent,
        rating: landlordData.avgRating,
        totalUnits: landlordData.totalUnits,
        violations: landlordData.violations,
        lastInspection: landlordData.lastInspection,
        addresses,
        rentData: landlordData.rentData,
      };
    }
    
    return {
      name: landlordName,
      properties: addresses.length,
      avgRent: 'NA',
      rating: 'NA',
      totalUnits: 'NA',
      violations: 'NA',
      lastInspection: 'NA',
      addresses,
      rentData: 'NA',
    };
  };

  const renderParcelTab = () => (
    <div className="p-4 space-y-3">
      <div>
        <div className="text-xs text-gray-500 uppercase">Address</div>
        <div className="text-gray-900 font-medium">{address}</div>
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
        {hasGroceryData && (
          <div className="bg-green-50 p-3 rounded-md border border-green-200">
            <div className="text-xs text-green-700 uppercase font-medium mb-1">Nearest Grocery Store</div>
            {nearestGrocery && nearestGrocery != 'N/A' && <div className="text-sm font-medium text-gray-800">{nearestGrocery}</div>}
            <div className="flex gap-4 mt-2 text-sm">
              {distMilesGrocery != undefined && (
                <div>
                  <span className="text-gray-600">Distance: </span>
                  <span className="font-medium text-gray-900">{distMilesGrocery.toFixed(2)} miles</span>
                </div>
              )}
              {walkTimeMinsGrocery != undefined && (
                <div>
                  <span className="text-gray-600">Walking: </span>
                  <span className="font-medium text-gray-900">{walkTimeMinsGrocery} mins</span>
                </div>
              )}
            </div>
          </div>
        )}
        {hasPharmacyData && (
          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
            <div className="text-xs text-blue-700 uppercase font-medium mb-1">Nearest Pharmacy</div>
            {nearestPharmacy && nearestPharmacy != 'N/A' && <div className="text-sm font-medium text-gray-800">{nearestPharmacy}</div>}
            <div className="flex gap-4 mt-2 text-sm">
              {distMilesPharmacy != undefined && (
                <div>
                  <span className="text-gray-600">Distance: </span>
                  <span className="font-medium text-gray-900">{distMilesPharmacy.toFixed(2)} miles</span>
                </div>
              )}
              {walkTimeMinsPharmacy != undefined && (
                <div>
                  <span className="text-gray-600">Walking: </span>
                  <span className="font-medium text-gray-900">{walkTimeMinsPharmacy} mins</span>
                </div>
              )}
            </div>
          </div>
        )}
        {hasGymData && (
          <div className="bg-orange-50 p-3 rounded-md border border-orange-200">
            <div className="text-xs text-orange-700 uppercase font-medium mb-1">Nearest Gym</div>
            {nearestGym && nearestGym != 'N/A' && <div className="text-sm font-medium text-gray-800">{nearestGym}</div>}
            <div className="flex gap-4 mt-2 text-sm">
              {distMilesGym != undefined && (
                <div>
                  <span className="text-gray-600">Distance: </span>
                  <span className="font-medium text-gray-900">{distMilesGym.toFixed(2)} miles</span>
                </div>
              )}
              {walkTimeMinsGym != undefined && (
                <div>
                  <span className="text-gray-600">Walking: </span>
                  <span className="font-medium text-gray-900">{walkTimeMinsGym} mins</span>
                </div>
              )}
            </div>
          </div>
        )}
        {hasCampusData && (
          <div className="bg-purple-50 p-3 rounded-md border border-purple-200">
            <div className="text-xs text-purple-700 uppercase font-medium mb-1">Distance to Campus</div>
            <div className="flex gap-4 mt-2 text-sm">
              {distMilesCampus != undefined && (
                <div>
                  <span className="text-gray-600">Distance: </span>
                  <span className="font-medium text-gray-900">{distMilesCampus.toFixed(2)} miles</span>
                </div>
              )}
              {walkTimeMinsCampus != undefined && (
                <div>
                  <span className="text-gray-600">Walking: </span>
                  <span className="font-medium text-gray-900">{walkTimeMinsCampus} mins</span>
                </div>
              )}
            </div>
          </div>
        )}
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

  const formatValue = (value, prefix = '') => {
    if (value === 'NA' || value === null || value === undefined) return 'NA';
    return `${prefix}${value}`;
  };

  const renderLandlordsTab = () => {
    if (showLandlordListOnly) {
      if (selectedLandlord) {
        const landlord = getLandlordInfo(selectedLandlord);
        return (
          <div className="p-4 space-y-4">
            {loadingLandlordData && (
              <div className="text-sm text-gray-500 text-center py-2">Loading landlord data...</div>
            )}
            <div>
              <div className="text-xs text-gray-500 uppercase">Current Landlord</div>
              <div className="font-medium text-gray-800">{landlord.name}</div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                <div>Properties: <span className="text-gray-800 font-medium">{landlord.properties}</span></div>
                <div>Avg Rent: <span className="text-gray-800 font-medium">{formatValue(landlord.avgRent, '$')}</span></div>
                <div>Rating: <span className="text-gray-800 font-medium">{formatValue(landlord.rating)}/5</span></div>
                <div>Units: <span className="text-gray-800 font-medium">{formatValue(landlord.totalUnits)}</span></div>
                <div>Code Violations: <span className="text-gray-800 font-medium">{formatValue(landlord.violations)}</span></div>
                <div>Last Inspection: <span className="text-gray-800 font-medium">{formatValue(landlord.lastInspection)}</span></div>
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
        {loadingLandlordData && (
          <div className="text-sm text-gray-500 text-center py-2">Loading landlord data...</div>
        )}
        <div>
          <div className="text-xs text-gray-500 uppercase">Current Landlord</div>
          <div className="font-medium text-gray-800">{currentLandlord.name}</div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
            <div>Properties: <span className="text-gray-800 font-medium">{currentLandlord.properties}</span></div>
            <div>Avg Rent: <span className="text-gray-800 font-medium">{formatValue(currentLandlord.avgRent, '$')}</span></div>
            <div>Rating: <span className="text-gray-800 font-medium">{formatValue(currentLandlord.rating)}/5</span></div>
            <div>Units: <span className="text-gray-800 font-medium">{formatValue(currentLandlord.totalUnits)}</span></div>
            <div>Code Violations: <span className="text-gray-800 font-medium">{formatValue(currentLandlord.violations)}</span></div>
            <div>Last Inspection: <span className="text-gray-800 font-medium">{formatValue(currentLandlord.lastInspection)}</span></div>
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
