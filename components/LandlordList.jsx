'use client';

import React from 'react';

export default function LandlordList({ parcelData, onClose, onSelectLandlord }) {
  const landlordMap = new Map();

  parcelData?.features.forEach(f => {
    const owner = f.properties.ManagementGroup;
    if (owner && owner !== 'N/A') {
      if (!landlordMap.has(owner)) {
        landlordMap.set(owner, {
          name: owner,
          addresses: [],
          properties: 0,
        });
      }
      const data = landlordMap.get(owner);
      data.addresses.push(f.properties.Address);
      data.properties += 1;
    }
  });

  const landlords = Array.from(landlordMap.values()).sort((a, b) => b.properties - a.properties);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Landlords List</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="space-y-2">
          {landlords.map((landlord, idx) => (
            <div
              key={idx}
              onClick={() => onSelectLandlord?.(landlord)}
              className="p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
            >
              <div className="font-medium text-gray-800">{landlord.name}</div>
              <div className="text-sm text-gray-500">{landlord.properties} properties</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
