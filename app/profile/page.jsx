'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import Link from 'next/link';
import NavBar from '../components/NavBar';

const ProfilePage = () => {
  const { user, authenticated, ready } = usePrivy();
  const [reputationScore, setReputationScore] = useState(null);
  const [borrowerLoans, setBorrowerLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Partial contract ABI (only used functions)
  const contractABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_borrower",
          "type": "address"
        }
      ],
      "name": "getBorrowerScore",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_borrower",
          "type": "address"
        }
      ],
      "name": "getBorrowerLoans",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  // Trifecta contract address
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

  useEffect(() => {
    const fetchData = async () => {
      if (!authenticated || !ready || !user?.wallet?.address) {
        setLoading(false);
        return;
      }

      try {
        // Connect to provider and contract
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        
        // Get reputation score
        const score = await contract.getBorrowerScore(user.wallet.address);
        setReputationScore(Number(score));
        
        // Get user loans
        const loans = await contract.getBorrowerLoans(user.wallet.address);
        setBorrowerLoans(loans.map(loan => Number(loan)));
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Unable to retrieve your data. Please verify that you're connected to the correct network.");
        setLoading(false);
      }
    };

    fetchData();
  }, [authenticated, ready, user]);

  if (!ready) {
    return (
      <>
        <NavBar />
        <div className="container mx-auto p-6">Loading authentication...</div>
      </>
    );
  }

  if (!authenticated) {
    return (
      <>
        <NavBar />
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <p className="mb-4">Please connect your wallet to view your profile.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Ethereum Address</p>
              <p className="font-medium">{user?.wallet?.address}</p>
            </div>
            <div>
              <p className="text-gray-600">Reputation Score</p>
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <div className="flex items-center">
                  <span className="font-medium text-2xl">{reputationScore}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">My Loans</h2>
          {loading ? (
            <p>Loading loans...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : borrowerLoans.length === 0 ? (
            <p className="text-gray-500">You don't have any loans yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Loan ID</th>
                    <th className="py-2 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowerLoans.map((loanId) => (
                    <tr key={loanId} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{loanId}</td>
                      <td className="py-2 px-4 text-right">
                        <button className="text-blue-500 hover:text-blue-700 mr-2">
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage; 