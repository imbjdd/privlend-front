import NavBar from "../components/NavBar";

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <NavBar />
      
      <div className="container mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-6 font-title">Verify a Proof</h1>
        <p className="text-gray-600 mb-10">
          Verify a zero-knowledge proof to confirm a borrower's creditworthiness without accessing their private data.
        </p>
        
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 font-title">Proof Verification</h2>
          
          <div className="mb-6">
            <label htmlFor="proofId" className="block text-sm font-medium text-gray-700 mb-2">
              Proof ID or Borrower Address
            </label>
            <input
              type="text"
              id="proofId"
              placeholder="0x..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="criteria" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Criteria
            </label>
            <select
              id="criteria"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="">Select verification criteria</option>
              <option value="creditScore">Credit Score {`>`} 700</option>
              <option value="income">Monthly Income {`>`} $5,000</option>
              <option value="debtRatio">Debt-to-Income Ratio {`<`} 30%</option>
              <option value="history">Payment History {`>`} 95% on-time</option>
            </select>
          </div>
          
          <button className="w-full bg-black text-white rounded-full py-3 font-medium hover:bg-gray-800 transition">
            Verify Proof
          </button>
          
          <div className="mt-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="font-bold text-lg mb-2">Verification Results</h3>
            <p className="text-gray-600">
              Connect your wallet and submit a proof ID to see verification results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 