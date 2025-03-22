'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import NavBar from "../components/NavBar";
import { DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import extractTextFromPDF from 'pdf-parser-client-side';

export default function GeneratePage() {
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

  const extractTextFromPdf = async (pdfFile) => {
    try {
      const text = await extractTextFromPDF(pdfFile, 'clean');
      return text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return 'Failed to extract text from PDF';
    }
  };

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

      const extractionPromises = files.map(async ({ file }) => {
        if (file.type !== 'application/pdf') {
          return `${file.name} is not a PDF file. Skipping...`;
        }
        
        const text = await extractTextFromPdf(file);
        return `--- Text from ${file.name} ---\n${text}\n\n`;
      });

      const results = await Promise.all(extractionPromises);
      const combinedText = results.join('');
      
      setExtractedText(combinedText);
      console.log('Extracted Text:', combinedText);
      
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 tracking-tight flex flex-col gap-4">
            <span className="font-title">Generate Your Proof</span>
            <span className="bg-indigo-100 px-3 py-1 rounded-lg w-fit text-3xl">Unlock DeFi Lending</span>
          </h1>
          <p className="text-gray-600 mb-10 text-lg">
            DeFi lending requires credit scores, but your privacy matters. Upload your financial documents 
            to generate a zero-knowledge proof of creditworthiness. Your data remains private and secure, 
            processed in a Trusted Execution Environment (TEE) without storing any personal information.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-3xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <input {...getInputProps()} />
              <DocumentArrowUpIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              {isDragActive ? (
                <p className="text-lg text-gray-600">Drop the PDF files here...</p>
              ) : (
                <div>
                  <p className="text-lg text-gray-600 mb-2">
                    Drag & drop PDF files here, or click to select files
                  </p>
                  <p className="text-sm text-gray-500">
                    Only PDF files are supported
                  </p>
                </div>
              )}
            </div>

            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Selected Files:</h3>
                <div className="space-y-2">
                  {files.map(({ file, id }) => (
                    <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="truncate flex-1">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(id)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={files.length === 0 || isSubmitting}
              className={`w-full mt-6 rounded-full py-3 font-medium transition
                ${files.length === 0 || isSubmitting
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'}`}
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

            <p className="text-xs text-gray-500 mt-4 text-center">
              Your data will be processed securely in a Trusted Execution Environment.
              No personal information will be stored or shared.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
} 