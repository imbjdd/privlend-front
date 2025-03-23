'use client';

import { useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';

export default function ZKProofGenerator({ creditScore = 700 }) {
  const iframeRef = useRef(null);
  const [messageStatus, setMessageStatus] = useState(null);
  const [messageCount, setMessageCount] = useState(0);
  const [proof, setProof] = useState(null);
  const [proofHash, setProofHash] = useState(null);
  const intervalRef = useRef(null);
  const targetOrigin = '*';

  const sendCreditScoreToIframe = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const message = {
          type: 'creditScore',
          value: creditScore
        };
        
        iframeRef.current.contentWindow.postMessage(message, targetOrigin);
        setMessageCount(prev => prev + 1);
        setMessageStatus('sent');
      } catch (error) {
        setMessageStatus('error');
      }
    }
  };

  const handleIframeLoad = () => {
    sendCreditScoreToIframe();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (messageStatus !== 'received') {
        sendCreditScoreToIframe();
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, 5000);
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'proof') {
        console.log('Proof received:', event.data);
        const proofValue = event.data.value;
        setProof(proofValue);
        
        // Convert proof to hash using keccak256
        try {
          // Check if the proof is already in hex format
          if (typeof proofValue === 'string' && proofValue.startsWith('0x')) {
            // If it's already a hex string, use it directly
            const hash = ethers.keccak256(proofValue);
            setProofHash(hash);
            console.log('Proof hash generated from hex:', hash);
          } else if (Array.isArray(proofValue)) {
            // If it's an array as originally expected
            const abiCoder = new ethers.AbiCoder();
            const packedData = abiCoder.encode(['uint32[]'], [proofValue]);
            const hash = ethers.keccak256(packedData);
            setProofHash(hash);
            console.log('Proof hash generated from array:', hash);
          } else {
            // For any other format, convert to string and hash
            const stringValue = String(proofValue);
            // Need to convert to bytes-like for keccak256
            const encoder = new TextEncoder();
            const dataBytes = encoder.encode(stringValue);
            const dataHex = '0x' + Array.from(dataBytes)
              .map(b => b.toString(16).padStart(2, '0'))
              .join('');
            const hash = ethers.keccak256(dataHex);
            setProofHash(hash);
            console.log('Proof hash generated from other format:', hash);
          }
        } catch (error) {
          console.error('Error generating hash:', error);
          console.error('Proof value type:', typeof proofValue);
          console.error('Proof value:', proofValue);
        }
        
        setMessageStatus('received');
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (iframeRef.current) {
      setMessageStatus(null);
      setMessageCount(0);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      sendCreditScoreToIframe();
      
      intervalRef.current = setInterval(() => {
        if (messageStatus !== 'received') {
          sendCreditScoreToIframe();
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      }, 5000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [creditScore]);

  return (
    <div>
      <iframe
        ref={iframeRef}
        src="https://privlend-zkfront.vercel.app/"
        width="100%"
        height="200px"
        className='hidden'
        style={{ border: 'none' }}
        onLoad={handleIframeLoad}
      ></iframe>
      
      {messageStatus && (
        <div className="mt-4 p-4 rounded bg-gray-50 border border-gray-200">
          {messageStatus !== 'received' && (
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          )}
          
          {messageStatus === 'sent' && (
            <div className="text-gray-600">
              <p className="italic text-sm mt-2">Waiting for ZK application confirmation...</p>
            </div>
          )}
          
          {messageStatus === 'error' && (
            <div className="text-red-600">
              <p>Error sending credit score</p>
              <p className="text-sm mt-1">Please check that the ZK application is properly loaded.</p>
            </div>
          )}
          
          {messageStatus === 'received' && (
            <div className="text-green-600">
              <p>✅ Proof received!</p>
              {proofHash && (
                <div className="mt-2">
                  <p className="text-sm font-semibold">Proof Hash (keccak256):</p>
                  <p className="text-xs font-mono break-all mt-1">{proofHash}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
