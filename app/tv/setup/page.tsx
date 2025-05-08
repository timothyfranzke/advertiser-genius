'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode.react';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function TVSetupPage() {
  const router = useRouter();
  const [setupCode, setSetupCode] = useState<string>('');
  const [locationId, setLocationId] = useState<string>('');
  const [step, setStep] = useState<'generating' | 'qrcode' | 'location'>('generating');
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(300); // 5 minutes in seconds
  
  // Generate a random setup code
  useEffect(() => {
    const generateCode = async () => {
      try {
        // Generate a random 6-character code
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        setSetupCode(randomCode);
        
        // In a real app, we would store this code in Firestore
        // along with its creation timestamp to enforce expiration
        const db = getFirestore();
        await setDoc(doc(db, 'tvSetup', randomCode), {
          createdAt: serverTimestamp(),
          status: 'pending', // pending, linked, expired
          tvId: null,
          locationId: null,
          userId: null,
        });
        
        setStep('qrcode');
        
        // Start listening for updates to this document
        const unsubscribe = onSnapshot(doc(db, 'tvSetup', randomCode), (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            if (data.status === 'linked' && data.tvId) {
              // TV has been linked from the dashboard, proceed to location selection
              localStorage.setItem('tvId', data.tvId);
              if (data.locationId) {
                // Location was already set, redirect to display page
                localStorage.setItem('locationId', data.locationId);
                router.push('/tv/display');
              } else {
                // Ask for location
                setStep('location');
              }
            }
          }
        });
        
        // Cleanup function
        return () => unsubscribe();
      } catch (error) {
        console.error('Error generating setup code:', error);
        setError('Failed to generate setup code. Please refresh the page and try again.');
      }
    };
    
    generateCode();
  }, [router]);
  
  // Countdown timer for QR code expiration
  useEffect(() => {
    if (step !== 'qrcode' || countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('Setup code expired. Please refresh the page to generate a new code.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [step, countdown]);
  
  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!locationId) {
      setError('Please enter a location ID');
      return;
    }
    
    try {
      const tvId = localStorage.getItem('tvId');
      if (!tvId) {
        throw new Error('TV ID not found');
      }
      
      // In a real app, we would update the TV document in Firestore
      const db = getFirestore();
      await setDoc(doc(db, 'tvs', tvId), {
        locationId,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      localStorage.setItem('locationId', locationId);
      router.push('/tv/display');
    } catch (error) {
      console.error('Error setting location:', error);
      setError('Failed to set location. Please try again.');
    }
  };
  
  // Format the countdown as MM:SS
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-2xl font-bold">Error</h2>
          <p className="mt-2 text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <h2 className="mt-6 text-2xl font-bold">Generating Setup Code</h2>
          <p className="mt-2 text-gray-300">Please wait a moment...</p>
        </div>
      </div>
    );
  }
  
  if (step === 'qrcode') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-6">TV Setup</h1>
          <div className="bg-white p-4 rounded-lg inline-block mx-auto mb-6">
            <QRCode value={`https://advertiser-genius.com/dashboard/devices/link?code=${setupCode}`} size={200} />
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Setup Code:</h2>
            <div className="text-3xl font-mono bg-gray-800 py-2 px-4 rounded-md inline-block">
              {setupCode}
            </div>
            <p className="mt-4 text-gray-300">
              This code will expire in <span className="font-semibold">{formatCountdown()}</span>
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-left">
            <h3 className="text-xl font-semibold mb-4">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-3 text-gray-300">
              <li>Open the Advertiser-Genius dashboard on your computer or mobile device</li>
              <li>Go to <span className="font-semibold">Devices</span> section</li>
              <li>Click <span className="font-semibold">Link New TV</span></li>
              <li>Scan this QR code or enter the setup code manually</li>
              <li>Follow the prompts to complete the setup</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }
  
  if (step === 'location') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-6">TV Setup</h1>
          <div className="bg-gray-800 rounded-lg p-6 text-left">
            <h2 className="text-2xl font-semibold mb-4">Enter Location ID</h2>
            <p className="mb-6 text-gray-300">
              Please enter the location ID where this TV is installed. You can find this in your Advertiser-Genius dashboard.
            </p>
            
            <form onSubmit={handleLocationSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter Location ID"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}
