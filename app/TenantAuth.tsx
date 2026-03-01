/* component that handles the login state */

'use client';

import { usePrivy } from '@privy-io/react-auth';

export default function TenantAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) return null;

  // Helper to find the embedded wallet specifically
  const embeddedWallet = user?.linkedAccounts.find(
    (account) => account.type === 'wallet' && account.walletClientType === 'privy'
  );

  return (
    <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-lg shadow-xl">
      {!authenticated ? (
        <button onClick={login} className="bg-blue-600 text-white px-4 py-2 rounded">
          Log In
        </button>
      ) : (
        <div className="flex flex-col gap-2 text-sm">
          <div className="font-bold text-green-600">Logged In</div>

          {/* Debugging: Show us what accounts we have */}
          <div className="text-xs text-gray-500">
            Method: {user?.wallet ? 'Wallet Connected' : 'No Active Wallet'}
          </div>

          {/* Option A: The Active Wallet (if connected) */}
          {user?.wallet && (
            <div className="bg-gray-100 text-gray-500 p-2 rounded">
              <span className="font-semibold">Active:</span>
              <br />
              {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
            </div>
          )}

          {/* Option B: The Embedded Wallet (found in linked accounts) */}
          {embeddedWallet && !user?.wallet && (
            <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
              <span className="font-semibold">Embedded (Not Active):</span>
              <br />
              {/* @ts-ignore - TS might complain about address on generic LinkedAccount */}
              {embeddedWallet.address.slice(0, 6)}...
            </div>
          )}

          <button onClick={logout} className="text-red-500 underline text-xs">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
