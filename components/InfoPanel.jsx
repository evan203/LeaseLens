'use client';

import React, { useState, useEffect } from 'react';

const MAINTENANCE_TIME_LABELS = {
  1: 'Within a day',
  3: 'Within a few days',
  5: 'Within a week',
  14: 'Within a few weeks',
  30: 'Within a month',
  60: 'Longer than a month',
};

export default function InfoPanel({ parcel, onClose, onShowLandlordProperties, onSelectAddress, parcelData }) {
  const [showLandlordDetails, setShowLandlordDetails] = useState(false);
  const [landlordMetrics, setLandlordMetrics] = useState(null);

  const landlordId = parcel?.properties?.ManagementGroup;

  useEffect(() => {
    if (!landlordId) {
      return;
    }

    fetch(`/api/landlords`)
      .then(res => res.json())
      .then(landlords => {
        const found = landlords.find(l => l.id === landlordId);
        if (found) {
          setLandlordMetrics(found);
        }
      })
      .catch(err => {
        console.error('Error fetching landlord metrics:', err);
      });
  }, [landlordId]);

  if (!parcel) return null;

  const address = parcel.properties.Address || 'N/A';
  const owner = parcel.properties.ManagementGroup || 'N/A';
  const propertyUse = parcel.properties.PropertyUse || 'N/A';

  const landlordProperties = parcelData?.features
    .filter(f => f.properties.ManagementGroup === owner)
    .map(f => f.properties.Address) || [];

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
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-800">Landlord</h3>
          {landlordMetrics && (
            <button
              onClick={() => {
                const newState = !showLandlordDetails;
                setShowLandlordDetails(newState);
                onShowLandlordProperties?.(newState ? landlordProperties : null);
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              {showLandlordDetails ? 'View Less' : 'View More'}
            </button>
          )}
        </div>
        <div className="text-sm">
          <div className="font-medium text-gray-800">{owner}</div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
            <div>Properties: <span className="text-gray-800 font-medium">{landlordProperties.length}</span></div>
            {landlordMetrics ? (
              <>
                <div>Rating: <span className="text-gray-800 font-medium">{landlordMetrics.averageRating?.toFixed(1)}/10</span></div>
                <div>Reviews: <span className="text-gray-800 font-medium">{landlordMetrics.reviewCount}</span></div>
              </>
            ) : (
              <div className="col-span-2">0 reviews</div>
            )}
          </div>
        </div>
        {showLandlordDetails && landlordMetrics && (
          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
            <div className="grid grid-cols-2 gap-2">
              {landlordMetrics.averageMaintenanceTime > 0 && (
                <div>Avg Maintenance Time: <span className="text-gray-800 font-medium">{MAINTENANCE_TIME_LABELS[landlordMetrics.averageMaintenanceTime] || `${Math.round(landlordMetrics.averageMaintenanceTime)} days`}</span></div>
              )}
            </div>
            <div className="mt-3">
              <div className="font-medium text-gray-800 mb-1">Other Properties:</div>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {landlordProperties.map((addr, idx) => (
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
