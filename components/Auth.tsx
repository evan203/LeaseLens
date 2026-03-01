'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function NavBar() {
  const { user, signOutUser, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
      {user ? (
        <>
          <span className="text-sm text-gray-600">{user.email}</span>
          <button
            onClick={() => signOutUser()}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign Up
          </Link>
        </>
      )}
    </div>
  );
}
