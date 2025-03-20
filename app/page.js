import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation Bar */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-title font-bold text-xl">PrivLend</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-black hover:text-lime-500 text-sm font-medium">Home</a>
          <a href="#" className="text-black hover:text-lime-500 text-sm font-medium">Generate</a>
          <a href="#" className="text-black hover:text-lime-500 text-sm font-medium">Verify</a>
        </div>
        <button className="bg-black text-white rounded-full px-6 py-2 text-sm font-medium hover:bg-gray-800 transition">
          Sign In
        </button>
      </nav>

      {/* Hero Section with decorative elements */}
      <div className="container mx-auto px-6 py-20 relative min-h-[75vh] flex items-center">
        <div className="max-w-3xl relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight flex flex-col gap-4">
            <span className="font-title">Protect Your Data.</span>
            <span className="bg-indigo-100 px-3 py-1 rounded-lg w-fit">Unlock Your Credit.</span>
          </h1>
          <p className="text-gray-600 mb-10 text-lg">
          DeFi lending requires credit scores, but users want privacy. Without a way to privately verify creditworthiness, undercollateralized loans remain a challenge.
          </p>
          <button className="bg-black text-white rounded-full px-8 py-4 text-sm font-medium hover:bg-gray-800 transition">
            Generate Your Proof Now
          </button>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <p className="text-xl md:text-2xl text-center max-w-3xl mx-auto text-gray-700">
            Undercollateralized lending in DeFi is challenging—how can you prove your creditworthiness without exposing your financial data?
          </p>
        </div>
      </div>

      {/* Solution Section */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold mb-12 text-center font-title">🚀 Our Solution</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="mb-4 flex items-center">
              <div className="w-10 h-10 bg-black flex items-center justify-center rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" fill="white"/>
                </svg>
              </div>
              <h3 className="font-bold text-xl ml-3 font-title">Secured by TEE</h3>
            </div>
            <p className="text-gray-600">Your data is processed in a protected environment.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="mb-4 flex items-center">
              <div className="w-10 h-10 bg-black flex items-center justify-center rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" fill="white"/>
                </svg>
              </div>
              <h3 className="font-bold text-xl ml-3 font-title">ZK Proofs</h3>
            </div>
            <p className="text-gray-600">Prove your credit score without revealing any personal information.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="mb-4 flex items-center">
              <div className="w-10 h-10 bg-black flex items-center justify-center rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" fill="white"/>
                </svg>
              </div>
              <h3 className="font-bold text-xl ml-3 font-title">100% Decentralized</h3>
            </div>
            <p className="text-gray-600">No intermediaries, no central authority.</p>
          </div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center font-title">🔗 How It Works?</h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="relative">
              <div className="absolute -left-3 -top-3 w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center text-black font-bold">1</div>
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 h-full">
                <h3 className="font-bold text-xl mb-4 font-title">Submit Data</h3>
                <p className="text-gray-600">You submit your encrypted financial data (e.g., bank history).</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -left-3 -top-3 w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center text-black font-bold">2</div>
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 h-full">
                <h3 className="font-bold text-xl mb-4 font-title">Generate Proof</h3>
                <p className="text-gray-600">Our protocol generates a cryptographic proof (ZK Proof) of your credit score.</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -left-3 -top-3 w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center text-black font-bold">3</div>
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 h-full">
                <h3 className="font-bold text-xl mb-4 font-title">Use Anywhere</h3>
                <p className="text-gray-600">Use this proof on DeFi platforms without ever revealing your sensitive data.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
   </div>
  );
}
