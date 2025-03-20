import NavBar from "../components/NavBar";

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <NavBar />
      
      <div className="container mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-6 font-title">Generate Your Proof</h1>
        <p className="text-gray-600 mb-10">
          Connect your wallet and submit your data to generate a cryptographic proof of your creditworthiness.
        </p>
        
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 font-title">Data Submission</h2>
          
          <div className="mb-6">
            <label htmlFor="dataSource" className="block text-sm font-medium text-gray-700 mb-2">
              Data Source
            </label>
            <select
              id="dataSource"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="">Select a data source</option>
              <option value="bank">Bank Statement</option>
              <option value="credit">Credit History</option>
              <option value="defi">DeFi Transaction History</option>
              <option value="income">Income Verification</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-2">
              Timeframe
            </label>
            <select
              id="timeframe"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="">Select timeframe</option>
              <option value="3months">Last 3 months</option>
              <option value="6months">Last 6 months</option>
              <option value="1year">Last 1 year</option>
              <option value="2years">Last 2 years</option>
            </select>
          </div>
          
          <button className="w-full bg-black text-white rounded-full py-3 font-medium hover:bg-gray-800 transition">
            Generate ZK Proof
          </button>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            Your data will be processed securely in a Trusted Execution Environment.
            No personal information will be stored or shared.
          </p>
        </div>
      </div>
    </div>
  );
} 