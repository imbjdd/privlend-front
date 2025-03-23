'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useParams, useRouter } from 'next/navigation';
import NavBar from '../../components/NavBar';
import { trifectaABI } from '../../constants/contractABI';

const LoanDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, authenticated, ready } = usePrivy();
  
  const [loanDetails, setLoanDetails] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Get loan ID from params
  const loanId = params?.id;

  // Trifecta contract address
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

  useEffect(() => {
    const fetchLoanDetails = async () => {
      if (!authenticated || !ready || !loanId) {
        setLoading(false);
        return;
      }

      try {
        // Connect to provider and contract
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, trifectaABI, provider);
        
        // Get loan details
        const details = await contract.getLoanDetails(loanId);
        
        // Format loan details
        const formattedDetails = {
          loanId: Number(details.loanId),
          borrower: details.borrower,
          lender: details.lender,
          amount: ethers.formatEther(details.amount),
          interestRate: Number(details.interestRate) / 100, // Assuming stored as percentage * 100
          duration: Number(details.duration) / (24 * 60 * 60), // Convert seconds to days
          startTime: new Date(Number(details.startTime) * 1000),
          endTime: new Date(Number(details.endTime) * 1000),
          collateralAmount: ethers.formatEther(details.collateralAmount),
          status: getLoanStatusText(Number(details.status)),
          statusCode: Number(details.status),
          reputationScoreSnapshot: Number(details.reputationScoreSnapshot),
          amountRepaid: ethers.formatEther(details.amountRepaid),
          nextPaymentDue: new Date(Number(details.nextPaymentDue) * 1000),
          paymentInterval: Number(details.paymentInterval) / (24 * 60 * 60), // Convert seconds to days
          remainingAmount: ethers.formatEther(
            details.amount - details.amountRepaid
          )
        };
        
        setLoanDetails(formattedDetails);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching loan details:", err);
        setError("Unable to retrieve loan details. Please verify that you're connected to the correct network.");
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [authenticated, ready, loanId]);

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

  const handlePaymentAmountChange = (e) => {
    setPaymentAmount(e.target.value);
  };

  const handleMakePayment = async () => {
    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      if (!authenticated || !ready) {
        throw new Error("Please connect your wallet first");
      }

      // Validate input
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Please enter a valid payment amount");
      }

      // Connect to provider and contract with signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, trifectaABI, signer);
      
      // Convert amount to wei
      const amountWei = ethers.parseEther(amount.toString());
      
      // Make payment
      const tx = await contract.makePayment(loanId, { value: amountWei });
      await tx.wait();
      
      setSuccess("Payment made successfully!");
      setPaymentAmount('');
      
      // Refresh loan details
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      console.error("Error making payment:", err);
      setError(err.message || "Failed to make payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckDefault = async () => {
    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      if (!authenticated || !ready) {
        throw new Error("Please connect your wallet first");
      }

      // Check if user is the lender
      if (user.wallet.address.toLowerCase() !== loanDetails.lender.toLowerCase()) {
        throw new Error("Only the lender can check for default");
      }

      // Connect to provider and contract with signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, trifectaABI, signer);
      
      // Check for default
      const tx = await contract.checkLoanDefault(loanId);
      await tx.wait();
      
      setSuccess("Loan default check completed successfully!");
      
      // Refresh loan details
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      console.error("Error checking loan default:", err);
      setError(err.message || "Failed to check loan default. Please try again.");
    } finally {
      setProcessing(false);
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
          <h1 className="text-2xl font-bold mb-4">Loan Details</h1>
          <p className="mb-4">Please connect your wallet to view loan details.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Loan Details #{loanId}</h1>
          <button 
            onClick={() => router.back()} 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Back
          </button>
        </div>
        
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p>Loading loan details...</p>
          </div>
        ) : error && !loanDetails ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p className="text-red-500">{error}</p>
          </div>
        ) : loanDetails ? (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Loan Information</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs 
                        ${loanDetails.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          loanDetails.status === 'Repaid' ? 'bg-blue-100 text-blue-800' :
                          loanDetails.status === 'Defaulted' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                        {loanDetails.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600">Loan Amount</p>
                      <p className="font-medium">{loanDetails.amount} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Interest Rate</p>
                      <p className="font-medium">{loanDetails.interestRate.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-medium">{loanDetails.duration} days</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Collateral Amount</p>
                      <p className="font-medium">{loanDetails.collateralAmount} ETH</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">Repayment Information</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600">Amount Repaid</p>
                      <p className="font-medium">{loanDetails.amountRepaid} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Remaining Amount</p>
                      <p className="font-medium">{loanDetails.remainingAmount} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Start Date</p>
                      <p className="font-medium">{loanDetails.startTime.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">End Date</p>
                      <p className="font-medium">{loanDetails.endTime.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Next Payment Due</p>
                      <p className="font-medium">{loanDetails.nextPaymentDue.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Borrower Information</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600">Borrower Address</p>
                      <p className="font-medium">{loanDetails.borrower}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Reputation Score (at loan creation)</p>
                      <p className="font-medium">{loanDetails.reputationScoreSnapshot}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">Lender Information</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600">Lender Address</p>
                      <p className="font-medium">{loanDetails.lender}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Section */}
            {loanDetails.statusCode === 1 && ( // Active loans only
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Loan Actions</h2>
                
                {error && (
                  <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                    {success}
                  </div>
                )}
                
                {/* Show make payment for borrower */}
                {user.wallet.address.toLowerCase() === loanDetails.borrower.toLowerCase() && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Make a Payment</h3>
                    <div className="flex flex-col md:flex-row gap-4">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Amount in ETH"
                        value={paymentAmount}
                        onChange={handlePaymentAmountChange}
                        className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                      <button
                        onClick={handleMakePayment}
                        disabled={processing}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        {processing ? 'Processing...' : 'Make Payment'}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Show check default for lender */}
                {user.wallet.address.toLowerCase() === loanDetails.lender.toLowerCase() && (
                  <div>
                    <h3 className="font-medium mb-2">Lender Actions</h3>
                    <button
                      onClick={handleCheckDefault}
                      disabled={processing}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      {processing ? 'Processing...' : 'Check for Default'}
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                      This will check if the loan is in default based on missed payments and liquidate collateral if necessary.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p>Loan not found or you do not have permission to view it.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default LoanDetailsPage; 