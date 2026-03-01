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
