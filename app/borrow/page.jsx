'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import Link from 'next/link';
import NavBar from '../components/NavBar';
import { trifectaABI } from '../constants/contractABI';

const BorrowPage = () => {
  const { user, authenticated, ready } = usePrivy();
  const [loanOffers, setLoanOffers] = useState([]);
  const [reputationScore, setReputationScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proofHash, setProofHash] = useState('');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [requestingOffer, setRequestingOffer] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState(null);

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
        
        // Get reputation score
        const score = await contract.getBorrowerScore(user.wallet.address);
        setReputationScore(Number(score));
        
        // Get active loan offers (Note: This is a simplified approach)
        // In a real application, you would need to track all offers by iterating over events or indices
        const offerCount = 20; // Assuming there are at most 20 offers for simplicity
        const activeOffers = [];
        
        for (let i = 1; i <= offerCount; i++) {
          try {
            const offerDetails = await contract.getLoanOfferDetails(i);
            
            // Only show active offers
            if (offerDetails && offerDetails.active) {
              activeOffers.push({
                offerId: i,
                lender: offerDetails.lender,
                amount: ethers.formatEther(offerDetails.amount),
                interestRate: Number(offerDetails.interestRate) / 100, // Assuming stored as percentage * 100
                duration: Number(offerDetails.duration) / (24 * 60 * 60), // Convert seconds to days
                requiredCollateralRatio: Number(offerDetails.requiredCollateralRatio) / 100, // Assuming stored as percentage * 100
                minimumReputationScore: Number(offerDetails.minimumReputationScore),
                canRequest: Number(score) >= Number(offerDetails.minimumReputationScore)
              });
            }
          } catch (err) {
            // Skip non-existent offers
            console.error(`Error fetching offer ${i}:`, err);
            // If we get several consecutive errors, we've likely hit the end of offers
            if (i > 5 && activeOffers.length === 0) break;
          }
        }
        
        setLoanOffers(activeOffers);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Unable to retrieve loan offers. Please verify that you're connected to the correct network.");
        setLoading(false);
      }
    };

    fetchData();
  }, [authenticated, ready, user]);

  const handleRequestLoan = async (offerId) => {
    setProcessingRequest(true);
    setRequestSuccess(false);
    setRequestError(null);

    try {
      if (!authenticated || !ready) {
        throw new Error("Please connect your wallet first");
      }

      // Validate inputs
      if (!proofHash || proofHash.trim() === '') {
        throw new Error("Please enter a proof hash");
      }

      const collateral = parseFloat(collateralAmount);
      if (isNaN(collateral) || collateral <= 0) {
        throw new Error("Please enter a valid collateral amount");
      }

      // Format proof hash to bytes32 if needed
      let formattedProofHash = proofHash;
      if (!proofHash.startsWith('0x')) {
        formattedProofHash = '0x' + proofHash;
      }
      
      // Ensure it's the right length for bytes32
      if (formattedProofHash.length !== 66) { // '0x' + 64 hex chars
        throw new Error("Proof hash must be a valid 32-byte hex string");
      }

      // Connect to provider and contract with signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, trifectaABI, signer);
      
      // Convert collateral to wei
      const collateralWei = ethers.parseEther(collateral.toString());
      
      // Request the loan
      const tx = await contract.requestLoan(offerId, formattedProofHash, { value: collateralWei });
      await tx.wait();
      
      setRequestSuccess(true);
      setProofHash('');
      setCollateralAmount('');
      setRequestingOffer(null);
      
      // Reset after a delay
      setTimeout(() => {
        setRequestSuccess(false);
      }, 5000);
      
    } catch (err) {
      console.error("Error requesting loan:", err);
      setRequestError(err.message || "Failed to request loan. Please try again.");
    } finally {
      setProcessingRequest(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Function to calculate required collateral based on loan amount and ratio
  const calculateRequiredCollateral = (loanAmount, ratio) => {
    return (parseFloat(loanAmount) * ratio / 100).toFixed(4);
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
          <h1 className="text-2xl font-bold mb-4">Borrow</h1>
          <p className="mb-4">Please connect your wallet to view available loan offers.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Borrow</h1>
          <Link href="/borrow/requests" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
            My Requests
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Information</h2>
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
                  <Link href="/generate" className="ml-4 text-blue-500 hover:text-blue-700 text-sm">
                    Need a higher score?
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {requestSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">Your loan request has been submitted successfully.</span>
          </div>
        )}

        {/* Available Loan Offers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Available Loan Offers</h2>
          {loading ? (
            <p>Loading offers...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : loanOffers.length === 0 ? (
            <p className="text-gray-500">No loan offers available right now.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Offer ID</th>
                    <th className="py-2 px-4 text-left">Lender</th>
                    <th className="py-2 px-4 text-left">Amount</th>
                    <th className="py-2 px-4 text-left">Interest Rate</th>
                    <th className="py-2 px-4 text-left">Duration (Days)</th>
                    <th className="py-2 px-4 text-left">Collateral Required</th>
                    <th className="py-2 px-4 text-left">Min. Score</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loanOffers.map((offer) => (
                    <tr key={offer.offerId} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{offer.offerId}</td>
                      <td className="py-2 px-4">{formatAddress(offer.lender)}</td>
                      <td className="py-2 px-4">{offer.amount} ETH</td>
                      <td className="py-2 px-4">{offer.interestRate.toFixed(2)}%</td>
                      <td className="py-2 px-4">{offer.duration}</td>
                      <td className="py-2 px-4">{offer.requiredCollateralRatio.toFixed(2)}%</td>
                      <td className="py-2 px-4">{offer.minimumReputationScore}</td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => setRequestingOffer(offer)}
                          disabled={!offer.canRequest}
                          className={`px-3 py-1 rounded 
                            ${offer.canRequest 
                              ? 'bg-blue-500 hover:bg-blue-700 text-white' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        >
                          {offer.canRequest ? 'Request Loan' : 'Score Too Low'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Loan Request Modal */}
        {requestingOffer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Request Loan</h3>
                <button onClick={() => setRequestingOffer(null)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-2">Offer Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Amount:</p>
                    <p className="font-medium">{requestingOffer.amount} ETH</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Interest Rate:</p>
                    <p className="font-medium">{requestingOffer.interestRate.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Duration:</p>
                    <p className="font-medium">{requestingOffer.duration} days</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Collateral Ratio:</p>
                    <p className="font-medium">{requestingOffer.requiredCollateralRatio.toFixed(2)}%</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
                  <p>
                    <span className="font-medium">Required Collateral: </span>
                    {calculateRequiredCollateral(requestingOffer.amount, requestingOffer.requiredCollateralRatio)} ETH 
                    <span className="text-gray-500"> (minimum)</span>
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="proofHash">
                  ZK Proof Hash
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="proofHash"
                  type="text"
                  placeholder="Enter your ZK proof hash"
                  value={proofHash}
                  onChange={(e) => setProofHash(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Generate your proof <Link href="/generate" className="text-blue-500 hover:text-blue-700">here</Link>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="collateralAmount">
                  Collateral Amount (ETH)
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="collateralAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={collateralAmount}
                  onChange={(e) => setCollateralAmount(e.target.value)}
                />
              </div>

              {requestError && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                  {requestError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                  onClick={() => setRequestingOffer(null)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => handleRequestLoan(requestingOffer.offerId)}
                  disabled={processingRequest}
                >
                  {processingRequest ? 'Processing...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BorrowPage; 