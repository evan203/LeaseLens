/* component that handles the login state */

'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';

export default function TenantAuth() {
  const {
    ready,
    authenticated,
    user,
    login,
    logout
  } = usePrivy();

  // Disable interaction until Privy is ready
  if (!ready) {
    return null;
  }

  return (
    <div className="z-50 bg-white p-4 rounded-lg shadow-xl border border-gray-200">
      {!authenticated ? (
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-gray-800">Tenant Access</h3>
          <p className="text-xs text-gray-500 max-w-[200px]">
            Log in to view private maintenance stats or verify your lease anonymously.
          </p>
          <button
            onClick={login}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Log In / Sign Up
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-bold text-sm text-gray-800">Connected</span>
          </div>

          {/* Display the "Stealth" Wallet Address */}
          <div className="text-xs bg-gray-100 p-2 rounded break-all font-mono">
            {user?.wallet?.address}
          </div>

          <button
            onClick={logout}
            className="text-red-500 text-sm hover:underline self-start"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
