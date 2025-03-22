'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import NavBar from "../components/NavBar";
import { DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function VerifyPage() {
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extractedText, setExtractedText] = useState('');

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
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setExtractedText('');

    try {
      if (files.length === 0) {
        alert('Please upload at least one PDF file');
        setIsSubmitting(false);
        return;
      }

      setExtractedText('Extracted Text');
      console.log('Extracted Text:');
      
      alert('PDF text extraction completed!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing PDF files. Please try again.');
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
          
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6 text-center cursor-pointer hover:bg-gray-50 transition">
            <input {...getInputProps()} />
            <DocumentArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            {isDragActive ? (
              <p className="text-gray-600">Drop the PDF files here...</p>
            ) : (
              <p className="text-gray-600">Drag &amp; drop PDF files here, or click to select files</p>
            )}
          </div>
          
          {files.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded files:</h3>
              <ul className="space-y-2">
                {files.map(fileObj => (
                  <li key={fileObj.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="truncate max-w-xs">{fileObj.file.name}</span>
                    <button 
                      onClick={() => removeFile(fileObj.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || files.length === 0}
            className={`w-full bg-black text-white rounded-full py-3 font-medium transition ${
              isSubmitting || files.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Extract PDF Text'}
          </button>
          
          {extractedText && (
            <div className="mt-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="font-bold text-lg mb-2">Extracted Text:</h3>
              <div className="text-sm text-gray-600 max-h-96 overflow-y-auto whitespace-pre-wrap">
                {extractedText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 