'use client';

import Auth from './Auth';
import AddressAutocomplete from './AddressAutocomplete';
import { useAuth } from '@/contexts/AuthContext';

export default function MapHeader({ 
  parcelData, 
  onSearchAddress, 
  onOpenLeaseForm, 
  groceryHeatmapFilter, 
  setGroceryHeatmapFilter,
  pharmacyHeatmapFilter,
  setPharmacyHeatmapFilter,
  gymHeatmapFilter,
  setGymHeatmapFilter
}) {
{
  const { user, loading } = useAuth();

  return (
    <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 w-80">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
        <h1 className="font-bold text-xl text-gray-800">LeaseLens</h1>
      </div>
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
        <AddressAutocomplete
          parcelData={parcelData}
          onChange={onSearchAddress}
          placeholder="Search address..."
        />
      </div>
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grocery Walkability
          </label>
          <select
            value={groceryHeatmapFilter}
            onChange={(e) => setGroceryHeatmapFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="none">Off</option>
            <option value="walkability">Show on map</option>
            <option value="heatmap">Heatmap</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pharmacy Walkability
          </label>
          <select
            value={pharmacyHeatmapFilter}
            onChange={(e) => setPharmacyHeatmapFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="none">Off</option>
            <option value="walkability">Show on map</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gym Walkability
          </label>
          <select
            value={gymHeatmapFilter}
            onChange={(e) => setGymHeatmapFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="none">Off</option>
            <option value="walkability">Show on map</option>
          </select>
        </div>
      </div>
      <Auth />
      {user && !loading && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-left">
          <p className="text-sm text-gray-600 mb-3">Upload your data to help fellow renters!</p>
          <button
            onClick={onOpenLeaseForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
          >
            Add information about your lease
          </button>
        </div>
      )}
    </div>
  );
}
}
