'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import NavBar from "../components/NavBar";
import { DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import extractTextFromPDF from 'pdf-parser-client-side';
import ZKProofGenerator from '../components/ZKProofGenerator';

export default function GeneratePage() {
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [creditScore, setCreditScore] = useState(700);
  const [apiUrl, setApiUrl] = useState('');
  const [showZKProof, setShowZKProof] = useState(false);

  useEffect(() => {
    // Load environment variables
    const loadEnv = async () => {
      try {
        setApiUrl(process.env.NEXT_PUBLIC_OLLAMA_API_URL || 'http://3.111.10.114:5000/api/generate');
      } catch (error) {
        console.error('Error loading environment variables:', error);
      }
    };
    
    loadEnv();
  }, []);

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

  const generateCreditScore = async (text) => {
    try {
      // Define the JSON schema for the structured output
      const creditScoreSchema = {
        type: "object",
        properties: {
          credit_score: {
            type: "integer",
            description: "The credit score between 300 and 850"
          }
        },
        required: ["credit_score"]
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gemma3:1b",
          prompt: `Analyze the following bank statement information and generate a credit score. Consider factors like income stability, spending habits, savings, and debt levels. Here is the text to analyze: ${text}`,
          format: creditScoreSchema,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      // With structured output, we directly access the credit_score field
      if (data.response && data.response.credit_score) {
        return data.response.credit_score.toString();
      } else {
        throw new Error('Could not extract a valid credit score from the response');
      }
    } catch (error) {
      console.error('Error generating credit score:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setExtractedText('');
    // Ne pas réinitialiser le score de crédit si aucun fichier n'est chargé
    
    try {
      if (files.length === 0) {
        alert('Please upload at least one PDF file');
        setIsSubmitting(false);
        return;
      }

      // Si des fichiers sont chargés, procéder à la réinitialisation du score
      setCreditScore(null);
      setShowZKProof(false);

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
      
      // Generate credit score using the extracted text
      const score = await generateCreditScore(combinedText);
      setCreditScore(score);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing documents. Please try again.');
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
          {/* Section pour l'upload des PDFs et génération du score */}
          <div className="mb-10 pb-10 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-6">Analyze your financial documents</h2>
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
                {isSubmitting ? 'Processing...' : 'Generate Credit Score'}
              </button>

              {creditScore && (
                <div className="mt-8 p-6 border border-gray-200 rounded-lg bg-indigo-50 text-center">
                  <h3 className="font-bold text-xl mb-2">Your Credit Score</h3>
                  <div className="text-5xl font-bold text-indigo-600 my-4">
                    {creditScore}
                  </div>
                  <p className="text-gray-600 mb-4">
                    This score was generated based on your financial documents using AI analysis.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowZKProof(true)}
                    className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition"
                  >
                    Generate Zero-Knowledge Proof
                  </button>
                </div>
              )}

              {extractedText && (
                <div className="mt-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="font-bold text-lg mb-2">Extracted Text:</h3>
                  <div className="text-sm text-gray-600 max-h-96 overflow-y-auto whitespace-pre-wrap">
                    {extractedText}
                  </div>
                </div>
              )}
            </form>
          </div>
          
          {/* Composant ZKProofGenerator */}
          {showZKProof && (
            <ZKProofGenerator creditScore={creditScore} />
          )}

          <p className="text-xs text-gray-500 mt-8 text-center">
            Your data will be processed securely in a Trusted Execution Environment.
            No personal information will be stored or shared.
          </p>
        </div>
      </div>
    </div>
  );
} 