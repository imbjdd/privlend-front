'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import Link from 'next/link';
import NavBar from '../../components/NavBar';
import { trifectaABI } from '../../constants/contractABI';

const LoanRequestsPage = () => {
  const { user, authenticated, ready } = usePrivy();
  const [borrowerLoans, setBorrowerLoans] = useState([]);
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
        
        // Get user loans
        const loans = await contract.getBorrowerLoans(user.wallet.address);
        const loanIds = loans.map(loan => Number(loan));
        setBorrowerLoans(loanIds);
        
        // Fetch details for each loan
        const loanDetailsMap = {};
        for (const loanId of loanIds) {
          try {
            const details = await contract.getLoanDetails(loanId);
            loanDetailsMap[loanId] = {
              lender: details.lender,
              amount: ethers.formatEther(details.amount),
              interestRate: Number(details.interestRate) / 100,
              duration: Number(details.duration) / (24 * 60 * 60), // Convert seconds to days
              startTime: new Date(Number(details.startTime) * 1000).toLocaleDateString(),
              endTime: new Date(Number(details.endTime) * 1000).toLocaleDateString(),
              collateralAmount: ethers.formatEther(details.collateralAmount),
              status: getLoanStatusText(Number(details.status)),
              statusCode: Number(details.status),
              reputationScoreSnapshot: Number(details.reputationScoreSnapshot),
              amountRepaid: ethers.formatEther(details.amountRepaid),
              nextPaymentDue: Number(details.nextPaymentDue) > 0 
                ? new Date(Number(details.nextPaymentDue) * 1000).toLocaleDateString() 
                : 'N/A',
              remainingAmount: ethers.formatEther(
                details.amount - details.amountRepaid
              )
            };
          } catch (err) {
            console.error(`Error fetching loan details for ID ${loanId}:`, err);
          }
        }
        setLoanDetails(loanDetailsMap);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Unable to retrieve your loans. Please verify that you're connected to the correct network.");
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

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
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
          <h1 className="text-2xl font-bold mb-4">My Loan Requests</h1>
          <p className="mb-4">Please connect your wallet to view your loan requests.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Loan Requests</h1>
          <Link href="/borrow" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
            Browse Loan Offers
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Loans</h2>
          {loading ? (
            <p>Loading loans...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : borrowerLoans.length === 0 ? (
            <div>
              <p className="text-gray-500 mb-4">You don't have any loans yet.</p>
              <Link href="/borrow" className="text-blue-500 hover:text-blue-700">
                Browse available loan offers
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Loan ID</th>
                    <th className="py-2 px-4 text-left">Lender</th>
                    <th className="py-2 px-4 text-left">Amount</th>
                    <th className="py-2 px-4 text-left">Interest</th>
                    <th className="py-2 px-4 text-left">Collateral</th>
                    <th className="py-2 px-4 text-left">Status</th>
                    <th className="py-2 px-4 text-left">Next Payment</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowerLoans.map((loanId) => {
                    const details = loanDetails[loanId] || {};
                    return (
                      <tr key={loanId} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{loanId}</td>
                        <td className="py-2 px-4">
                          {details.lender ? formatAddress(details.lender) : '-'}
                        </td>
                        <td className="py-2 px-4">{details.amount || '-'} ETH</td>
                        <td className="py-2 px-4">{details.interestRate?.toFixed(2) || '-'}%</td>
                        <td className="py-2 px-4">{details.collateralAmount || '-'} ETH</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs 
                            ${details.status === 'Active' ? 'bg-green-100 text-green-800' : 
                              details.status === 'Repaid' ? 'bg-blue-100 text-blue-800' :
                              details.status === 'Defaulted' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                            {details.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-2 px-4">{details.nextPaymentDue || '-'}</td>
                        <td className="py-2 px-4">
                          <Link href={`/loan/${loanId}`} className="text-blue-500 hover:text-blue-700">
                            Details
                          </Link>
                          {details.statusCode === 0 && (
                            <span className="ml-2 text-yellow-500">Awaiting Approval</span>
                          )}
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

export default LoanRequestsPage; 