'use client';

import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';

const NavBar = () => {
  const { login, authenticated, logout } = usePrivy();

  return (
    <nav className="container mx-auto flex items-center justify-between p-4 text-black">
      <div className="flex items-center space-x-6">
        <Link href="/" className="text-xl font-bold">
          PrivLend
        </Link>
        {authenticated && (
          <>
            <Link href="/generate" className="hover:text-gray-300">
              Borrow 
            </Link>
            <Link href="/verify" className="hover:text-gray-300">
              Verify
            </Link>
            <Link href="/profile" className="hover:text-gray-300">
              Profile
            </Link>
          </>
        )}
      </div>
      <div>
        {!authenticated ? (
          <button
            onClick={login}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Connect Wallet
          </button>
        ) : (
          <button
            onClick={logout}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Disconnect
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar; 