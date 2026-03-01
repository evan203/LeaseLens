'use client';

import React, { useState } from 'react';
import { addReview } from '@/lib/reviews';
import AddressAutocomplete from '@/components/AddressAutocomplete';

export default function LeaseForm({ parcelData, onClose }) {
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

  const handleLeaseSubmit = async (e) => {
    e.preventDefault();
    if (!leaseFormData.address) {
      alert('Please enter an address');
      return;
    }

    setIsSubmitting(true);
    try {
      await addReview(
        leaseFormData.address,
        'anonymous',
        leaseFormData.address,
        leaseFormData.rating,
        leaseFormData.comment,
        {
          bedrooms: leaseFormData.bedrooms ? parseInt(leaseFormData.bedrooms) : undefined,
          bathrooms: leaseFormData.bathrooms ? parseFloat(leaseFormData.bathrooms) : undefined,
          rent: leaseFormData.rent ? parseInt(leaseFormData.rent) : undefined,
          waterBill: leaseFormData.waterBill ? parseInt(leaseFormData.waterBill) : undefined,
          electricityBill: leaseFormData.electricityBill ? parseInt(leaseFormData.electricityBill) : undefined,
          gasBill: leaseFormData.gasBill ? parseInt(leaseFormData.gasBill) : undefined,
          maintenanceTime: leaseFormData.maintenanceTime || undefined,
          maintenanceQuality: leaseFormData.maintenanceQuality || undefined,
        }
      );

      onClose();
      setLeaseFormData({
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
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Submit Lease Information</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleLeaseSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Address
              </label>
              <AddressAutocomplete
                parcelData={parcelData}
                onChange={(addr) => setLeaseFormData({ ...leaseFormData, address: addr })}
                placeholder="123 Main St, Madison, WI"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Bedrooms
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                value={leaseFormData.bedrooms}
                onChange={(e) => setLeaseFormData({ ...leaseFormData, bedrooms: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="studio">Studio</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4 Bedrooms</option>
                <option value="5">5+ Bedrooms</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Bathrooms
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                value={leaseFormData.bathrooms}
                onChange={(e) => setLeaseFormData({ ...leaseFormData, bathrooms: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="1">1 Bathroom</option>
                <option value="2">2 Bathrooms</option>
                <option value="3">3 Bathrooms</option>
                <option value="4">4 Bathrooms</option>
                <option value="5">5+ Bathrooms</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rent
              </label>
              <input
                type="number"
                placeholder="1500"
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                value={leaseFormData.rent}
                onChange={(e) => setLeaseFormData({ ...leaseFormData, rent: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Monthly Water Bill (Say 0 if included in rent cost)
              </label>
              <input
                type="number"
                placeholder="100"
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                value={leaseFormData.waterBill}
                onChange={(e) => setLeaseFormData({ ...leaseFormData, waterBill: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Monthly Electricity Bill (Say 0 if included in rent cost)
              </label>
              <input
                type="number"
                placeholder="150"
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                value={leaseFormData.electricityBill}
                onChange={(e) => setLeaseFormData({ ...leaseFormData, electricityBill: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Monthly Gas Bill (Say 0 if included in rent cost)
              </label>
              <input
                type="number"
                placeholder="60"
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                value={leaseFormData.gasBill}
                onChange={(e) => setLeaseFormData({ ...leaseFormData, gasBill: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rate Your Landlord (1-10)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={leaseFormData.rating}
                  onChange={(e) => setLeaseFormData({ ...leaseFormData, rating: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-700 w-8">{leaseFormData.rating}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How long does it take for maintenance to come out after a request?
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                value={leaseFormData.maintenanceTime}
                onChange={(e) => setLeaseFormData({ ...leaseFormData, maintenanceTime: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="1">Within a day</option>
                <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="4">4 days</option>
                <option value="5">5+ days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What is the quality of the maintenance?
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                value={leaseFormData.maintenanceQuality}
                onChange={(e) => setLeaseFormData({ ...leaseFormData, maintenanceQuality: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="1">Terrible, did not fix anything.</option>
                <option value="2">Okay, felt like a band-aid fix.</option>
                <option value="3">Good, I am happy with the service.</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Any Questions/Comments
              </label>
              <textarea
                rows={3}
                placeholder="What's on your mind about your rent?"
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                value={leaseFormData.comment}
                onChange={(e) => setLeaseFormData({ ...leaseFormData, comment: e.target.value })}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
