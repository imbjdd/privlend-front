'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import NavBar from "../components/NavBar";
import { DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function VerifyPage() {
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7)
    }))]);
  }, []);

  const removeFile = (fileId) => {
    setFiles(files => files.filter(f => f.id !== fileId));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Commented out API call code
      /*
      const formData = new FormData();
      files.forEach(({ file }) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/verify-documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const data = await response.json();
      console.log('Success:', data);
      */
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Files processed successfully! (API call simulated)');
      setFiles([]);
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing files. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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