'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import Link from 'next/link';
import NavBar from '../components/NavBar';
import { trifectaABI } from '../constants/contractABI';

const LenderPage = () => {
  const { user, authenticated, ready } = usePrivy();
  const [lenderOffers, setLenderOffers] = useState([]);
  const [lenderLoans, setLenderLoans] = useState([]);
  const [offerDetails, setOfferDetails] = useState({});
  const [loanDetails, setLoanDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const contract = new ethers.Contract(contractAddress, trifectaABI, provider);
        
        // Get lender offers
        const offers = await contract.getLenderOffers(user.wallet.address);
        const offerIds = offers.map(offer => Number(offer));
        setLenderOffers(offerIds);
        
        // Get lender loans
        const loans = await contract.getLenderLoans(user.wallet.address);
        const loanIds = loans.map(loan => Number(loan));
        setLenderLoans(loanIds);
        
        // Fetch details for each offer
        const offerDetailsMap = {};
        for (const offerId of offerIds) {
          try {
            const details = await contract.getLoanOfferDetails(offerId);
            offerDetailsMap[offerId] = {
              lender: details.lender,
              amount: ethers.formatEther(details.amount),
              interestRate: Number(details.interestRate) / 100, // Assuming interest rate is stored as percentage * 100
              duration: Number(details.duration) / (24 * 60 * 60), // Convert seconds to days
              requiredCollateralRatio: Number(details.requiredCollateralRatio) / 100, // Assuming ratio is stored as percentage * 100
              minimumReputationScore: Number(details.minimumReputationScore),
              active: details.active
            };
          } catch (err) {
            console.error(`Error fetching offer details for ID ${offerId}:`, err);
          }
        }
        setOfferDetails(offerDetailsMap);
        
        // Fetch details for each loan
        const loanDetailsMap = {};
        for (const loanId of loanIds) {
          try {
            const details = await contract.getLoanDetails(loanId);
            loanDetailsMap[loanId] = {
              borrower: details.borrower,
              amount: ethers.formatEther(details.amount),
              interestRate: Number(details.interestRate) / 100,
              duration: Number(details.duration) / (24 * 60 * 60), // Convert seconds to days
              startTime: new Date(Number(details.startTime) * 1000).toLocaleDateString(),
              endTime: new Date(Number(details.endTime) * 1000).toLocaleDateString(),
              collateralAmount: ethers.formatEther(details.collateralAmount),
              status: getLoanStatusText(Number(details.status)),
              reputationScoreSnapshot: Number(details.reputationScoreSnapshot),
              amountRepaid: ethers.formatEther(details.amountRepaid),
              nextPaymentDue: new Date(Number(details.nextPaymentDue) * 1000).toLocaleDateString()
            };
          } catch (err) {
            console.error(`Error fetching loan details for ID ${loanId}:`, err);
          }
        }
        setLoanDetails(loanDetailsMap);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Unable to retrieve your data. Please verify that you're connected to the correct network.");
        setLoading(false);
      }
    };

    fetchData();
  }, [authenticated, ready, user]);

  // Helper function to convert loan status number to text
  const getLoanStatusText = (statusCode) => {
    const statusMap = {
      0: 'Pending',
      1: 'Active',
      2: 'Repaid',
      3: 'Defaulted'
    };
    return statusMap[statusCode] || 'Unknown';
  };

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
          <h1 className="text-2xl font-bold mb-4">Lender Dashboard</h1>
          <p className="mb-4">Please connect your wallet to view your lender dashboard.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Lender Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div>
            <p className="text-gray-600">Ethereum Address</p>
            <p className="font-medium">{user?.wallet?.address}</p>
          </div>
        </div>

        {/* Loan Offers Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Loan Offers</h2>
            <Link href="/create-offer" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
              Create New Offer
            </Link>
          </div>
          
          {loading ? (
            <p>Loading offers...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : lenderOffers.length === 0 ? (
            <p className="text-gray-500">You haven't created any loan offers yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Offer ID</th>
                    <th className="py-2 px-4 text-left">Amount</th>
                    <th className="py-2 px-4 text-left">Interest Rate</th>
                    <th className="py-2 px-4 text-left">Duration (Days)</th>
                    <th className="py-2 px-4 text-left">Collateral Ratio</th>
                    <th className="py-2 px-4 text-left">Min. Reputation</th>
                    <th className="py-2 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lenderOffers.map((offerId) => {
                    const details = offerDetails[offerId] || {};
                    return (
                      <tr key={offerId} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{offerId}</td>
                        <td className="py-2 px-4">{details.amount || '-'} ETH</td>
                        <td className="py-2 px-4">{details.interestRate?.toFixed(2) || '-'}%</td>
                        <td className="py-2 px-4">{details.duration || '-'}</td>
                        <td className="py-2 px-4">{details.requiredCollateralRatio?.toFixed(2) || '-'}%</td>
                        <td className="py-2 px-4">{details.minimumReputationScore || '-'}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${details.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {details.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Loans Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Active Loans</h2>
          {loading ? (
            <p>Loading loans...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : lenderLoans.length === 0 ? (
            <p className="text-gray-500">You don't have any active loans.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Loan ID</th>
                    <th className="py-2 px-4 text-left">Borrower</th>
                    <th className="py-2 px-4 text-left">Amount</th>
                    <th className="py-2 px-4 text-left">Interest</th>
                    <th className="py-2 px-4 text-left">Collateral</th>
                    <th className="py-2 px-4 text-left">Repaid</th>
                    <th className="py-2 px-4 text-left">Next Payment</th>
                    <th className="py-2 px-4 text-left">Status</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lenderLoans.map((loanId) => {
                    const details = loanDetails[loanId] || {};
                    return (
                      <tr key={loanId} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{loanId}</td>
                        <td className="py-2 px-4">
                          {details.borrower ? 
                            `${details.borrower.substring(0, 6)}...${details.borrower.substring(details.borrower.length - 4)}` : 
                            '-'}
                        </td>
                        <td className="py-2 px-4">{details.amount || '-'} ETH</td>
                        <td className="py-2 px-4">{details.interestRate?.toFixed(2) || '-'}%</td>
                        <td className="py-2 px-4">{details.collateralAmount || '-'} ETH</td>
                        <td className="py-2 px-4">{details.amountRepaid || '-'} ETH</td>
                        <td className="py-2 px-4">{details.nextPaymentDue || '-'}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs 
                            ${details.status === 'Active' ? 'bg-green-100 text-green-800' : 
                              details.status === 'Repaid' ? 'bg-blue-100 text-blue-800' :
                              details.status === 'Defaulted' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                            {details.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <Link href={`/loan/${loanId}`} className="text-blue-500 hover:text-blue-700">
                            Details
                          </Link>
                          {details.status === 'Active' && 
                            <button className="ml-2 text-red-500 hover:text-red-700">
                              Check Default
                            </button>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LenderPage; 