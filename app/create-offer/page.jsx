'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import NavBar from '../components/NavBar';
import { trifectaABI } from '../constants/contractABI';

const CreateOfferPage = () => {
  const { user, authenticated, ready } = usePrivy();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    amount: '',
    interestRate: '',
    duration: '',
    collateralRatio: '',
    minimumReputationScore: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Trifecta contract address
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!authenticated || !ready || !user?.wallet?.address) {
        throw new Error("Please connect your wallet first");
      }

      // Validate inputs
      const amount = parseFloat(formData.amount);
      const interestRate = parseFloat(formData.interestRate);
      const duration = parseInt(formData.duration);
      const collateralRatio = parseFloat(formData.collateralRatio);
      const minimumReputationScore = parseInt(formData.minimumReputationScore);

      if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");
      if (isNaN(interestRate) || interestRate <= 0) throw new Error("Invalid interest rate");
      if (isNaN(duration) || duration <= 0) throw new Error("Invalid duration");
      if (isNaN(collateralRatio) || collateralRatio <= 0) throw new Error("Invalid collateral ratio");
      if (isNaN(minimumReputationScore) || minimumReputationScore < 0) throw new Error("Invalid minimum reputation score");

      // Connect to provider and contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, trifectaABI, signer);
      
      // Convert values to contract format
      const amountWei = ethers.parseEther(amount.toString());
      const interestRateScaled = Math.floor(interestRate * 100); // Scale up by 100 for contract
      const durationSeconds = duration * 24 * 60 * 60; // Convert days to seconds
      const collateralRatioScaled = Math.floor(collateralRatio * 100); // Scale up by 100 for contract
      
      // Create the loan offer
      const tx = await contract.createLoanOffer(
        amountWei,
        interestRateScaled,
        durationSeconds,
        collateralRatioScaled,
        minimumReputationScore
      );
      
      await tx.wait();
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        router.push('/lender');
      }, 2000);
      
    } catch (err) {
      console.error("Error creating loan offer:", err);
      setError(err.message || "Failed to create loan offer. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-bold mb-4">Create Loan Offer</h1>
          <p className="mb-4">Please connect your wallet to create a loan offer.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Create Loan Offer</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                Loan Amount (ETH)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="interestRate">
                Interest Rate (%)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="interestRate"
                name="interestRate"
                type="number"
                step="0.01"
                placeholder="5.00"
                value={formData.interestRate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="duration">
                Duration (Days)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="duration"
                name="duration"
                type="number"
                placeholder="30"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="collateralRatio">
                Required Collateral Ratio (%)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="collateralRatio"
                name="collateralRatio"
                type="number"
                step="0.01"
                placeholder="150.00"
                value={formData.collateralRatio}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="minimumReputationScore">
                Minimum Reputation Score
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="minimumReputationScore"
                name="minimumReputationScore"
                type="number"
                placeholder="50"
                value={formData.minimumReputationScore}
                onChange={handleChange}
                required
              />
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                Loan offer created successfully! Redirecting...
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Loan Offer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateOfferPage; 