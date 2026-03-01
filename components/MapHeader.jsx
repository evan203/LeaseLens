'use client';

import React from 'react';
import Auth from './Auth';

export default function MapHeader() {
  return (
    <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 w-80">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
        <h1 className="font-bold text-xl text-gray-800">LeaseLens</h1>
      </div>
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Search address..."
          className="w-full text-sm px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
        />
      </div>
      <Auth />
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-left">
        <p className="text-sm text-gray-600 mb-3">Upload your data to help fellow renters!</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors text-sm">
          Add information about your lease
        </button>
      </div>
    </div>
  );
}
