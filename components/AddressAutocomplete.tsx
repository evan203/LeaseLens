'use client';

import { useState, useMemo } from 'react';

interface ParcelFeature {
  properties: {
    Address?: string;
    [key: string]: unknown;
  };
}

interface ParcelData {
  features: ParcelFeature[];
}

interface AddressAutocompleteProps {
  parcelData: ParcelData | null;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function AddressAutocomplete({ 
  parcelData, 
  value, 
  onChange, 
  placeholder = "Search address..." 
}: AddressAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');

  const addresses = useMemo(() => {
    if (!parcelData?.features) return [];
    return parcelData.features
      .map(f => f.properties.Address)
      .filter((addr): addr is string => Boolean(addr))
      .sort();
  }, [parcelData]);

  const suggestions = useMemo(() => {
    if (!inputValue || inputValue.length < 2) return [];
    const lower = inputValue.toLowerCase();
    return addresses.filter(addr => 
      addr.toLowerCase().includes(lower)
    ).slice(0, 8);
  }, [inputValue, addresses]);

  const handleSelect = (addr: string) => {
    setInputValue(addr);
    onChange?.(addr);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange?.(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((addr, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(addr)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {addr}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
