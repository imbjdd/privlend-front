'use client';

import Image from "next/image";
import NavBar from "./components/NavBar";
import { Eye, Plus, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="lg:h-screen min-h-screen bg-white text-black">
      {/* Navigation Bar */}
      <NavBar />

      {/* Hero Section with decorative elements */}
      <div className="container mx-auto px-6 py-20 relative flex items-center justify-between">
        <div className="max-w-2xl relative z-10">
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
        <div className="relative w-[450px] h-[450px]">
          <Image 
            src="/contract.png"
            alt="Smart Contract Illustration"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Solution Section */}
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="mb-4 flex items-center">
              <div className="w-10 h-10 bg-black flex items-center justify-center rounded-full">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-xl ml-3 font-title">Secured by TEE</h3>
            </div>
            <p className="text-gray-600">Your data is processed in a protected environment.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="mb-4 flex items-center">
              <div className="w-10 h-10 bg-black flex items-center justify-center rounded-full">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-xl ml-3 font-title">ZK Proofs</h3>
            </div>
            <p className="text-gray-600">Prove your credit score without revealing any personal information.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="mb-4 flex items-center">
              <div className="w-10 h-10 bg-black flex items-center justify-center rounded-full">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-xl ml-3 font-title">100% Decentralized</h3>
            </div>
            <p className="text-gray-600">No intermediaries, no central authority.</p>
          </div>
        </div>
      </div>
   </div>
  );
}
