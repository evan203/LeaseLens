'use client';

import React, { useState } from 'react';

const mockRentData = [
  { beds: 2, baths: 1, rent: 1200, water: 50, utilities: 100, date: '2024-01-15' },
  { beds: 3, baths: 2, rent: 1600, water: 75, utilities: 150, date: '2024-02-20' },
];

export default function InfoPanel({ parcel, onClose, onShowLandlordProperties, onSelectAddress, parcelData }) {
  const [showLandlordDetails, setShowLandlordDetails] = useState(false);

  if (!parcel) return null;

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
