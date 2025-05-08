'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getFirestore, collection, query, where, getDocs, onSnapshot, doc } from 'firebase/firestore';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  order: number;
  duration: number;
}

interface Carousel {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'archived';
  items: MediaItem[];
  schedule: {
    displayDuration: number;
  };
}

export default function TVDisplayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tvId, setTvId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [carousel, setCarousel] = useState<Carousel | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [offlineMode, setOfflineMode] = useState(false);
  
  // Check if TV is set up
  useEffect(() => {
    const storedTvId = localStorage.getItem('tvId');
    const storedLocationId = localStorage.getItem('locationId');
    
    if (!storedTvId || !storedLocationId) {
      // TV is not set up, redirect to setup page
      router.push('/tv/setup');
      return;
    }
    
    setTvId(storedTvId);
    setLocationId(storedLocationId);
    
    // Set up online/offline detection
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setOfflineMode(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);
  
  // Fetch active carousel for location
  useEffect(() => {
    if (!locationId) return;
    
    const fetchCarousel = async () => {
      try {
        setLoading(true);
        
        // Check for cached carousel first (for offline support)
        const cachedCarousel = localStorage.getItem('cachedCarousel');
        if (offlineMode && cachedCarousel) {
          setCarousel(JSON.parse(cachedCarousel));
          setLoading(false);
          return;
        }
        
        // In a real app, this would query Firestore for active carousels for this location
        // For this demo, we'll create a mock carousel
        
        setTimeout(() => {
          const mockCarousel: Carousel = {
            id: 'carousel1',
            name: 'Store Promotions',
            status: 'active',
            items: [
              {
                id: '1',
                url: '/placeholder-image.jpg',
                type: 'image',
                name: 'Welcome.jpg',
                order: 0,
                duration: 5,
              },
              {
                id: '2',
                url: '/placeholder-image.jpg',
                type: 'image',
                name: 'Sale.jpg',
                order: 1,
                duration: 5,
              },
              {
                id: '3',
                url: '/placeholder-image.jpg',
                type: 'image',
                name: 'NewProducts.jpg',
                order: 2,
                duration: 5,
              },
              {
                id: '4',
                url: '/placeholder-video.mp4',
                type: 'video',
                name: 'Promo.mp4',
                order: 3,
                duration: 15, // Video duration in seconds
              },
            ],
            schedule: {
              displayDuration: 5, // Default duration for images
            },
          };
          
          // Cache the carousel for offline use
          localStorage.setItem('cachedCarousel', JSON.stringify(mockCarousel));
          
          setCarousel(mockCarousel);
          setLoading(false);
        }, 1500);
        
        // In a real app, we would set up a Firestore real-time listener
        // to get updates to the active carousel
        
        /*
        const db = getFirestore();
        
        // Listen for changes to the TV document
        const tvUnsubscribe = onSnapshot(doc(db, 'tvs', tvId), (tvDoc) => {
          if (tvDoc.exists()) {
            const tvData = tvDoc.data();
            
            // If the TV's location has changed, update it
            if (tvData.locationId !== locationId) {
              setLocationId(tvData.locationId);
              localStorage.setItem('locationId', tvData.locationId);
            }
          }
        });
        
        // Listen for active carousels for this location
        const carouselQuery = query(
          collection(db, 'carousels'),
          where('locations', 'array-contains', locationId),
          where('status', '==', 'active')
        );
        
        const carouselUnsubscribe = onSnapshot(carouselQuery, (snapshot) => {
          if (!snapshot.empty) {
            // Get the most recently updated carousel
            const carousels = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            // Sort by updatedAt (most recent first)
            carousels.sort((a, b) => b.updatedAt.toDate() - a.updatedAt.toDate());
            
            // Use the most recent carousel
            const activeCarousel = carousels[0];
            setCarousel(activeCarousel);
            
            // Cache the carousel for offline use
            localStorage.setItem('cachedCarousel', JSON.stringify(activeCarousel));
          } else {
            // No active carousels found
            setCarousel(null);
          }
          
          setLoading(false);
        });
        
        return () => {
          tvUnsubscribe();
          carouselUnsubscribe();
        };
        */
      } catch (error) {
        console.error('Error fetching carousel:', error);
        setError('Failed to load content. Please check your connection and refresh the page.');
        setLoading(false);
      }
    };
    
    fetchCarousel();
  }, [locationId, tvId, offlineMode]);
  
  // Handle carousel item rotation
  useEffect(() => {
    if (!carousel || carousel.items.length === 0 || loading) return;
    
    const currentItem = carousel.items[currentItemIndex];
    
    // For images, use the specified duration
    // For videos, the duration is based on the video length, which is triggered by onEnded event
    if (currentItem.type === 'image') {
      const timer = setTimeout(() => {
        setCurrentItemIndex((prevIndex) => (prevIndex + 1) % carousel.items.length);
      }, currentItem.duration * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentItemIndex, carousel, loading]);
  
  // Handle video ended event to move to the next item
  const handleVideoEnded = () => {
    setCurrentItemIndex((prevIndex) => (prevIndex + 1) % (carousel?.items.length || 1));
  };
  
  // Handle errors with media loading
  const handleMediaError = () => {
    // Skip to the next item if current one fails to load
    console.error('Media failed to load, skipping to next item');
    setCurrentItemIndex((prevIndex) => (prevIndex + 1) % (carousel?.items.length || 1));
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto"></div>
          <h2 className="mt-6 text-2xl font-bold">Loading Content</h2>
          <p className="mt-2 text-gray-400">Please wait a moment...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-2xl font-bold">Error</h2>
          <p className="mt-2 text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }
  
  if (!carousel || carousel.items.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="text-center text-white max-w-md">
          <svg className="mx-auto h-16 w-16 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-2xl font-bold">No Content Available</h2>
          <p className="mt-2 text-gray-300">
            There are no active carousels for this location.
            Please check your Advertiser-Genius dashboard to assign content to this TV.
          </p>
          
          {offlineMode && (
            <div className="mt-4 bg-red-900 bg-opacity-50 rounded p-3 inline-block">
              <p className="text-sm">You are currently offline. Check your internet connection.</p>
            </div>
          )}
        </div>
        
        {/* Show TV ID and Location ID in a corner for troubleshooting */}
        <div className="absolute bottom-4 right-4 text-gray-600 text-xs">
          <p>TV ID: {tvId}</p>
          <p>Location: {locationId}</p>
        </div>
      </div>
    );
  }
  
  const currentItem = carousel.items[currentItemIndex];
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative">
      {/* Media display area */}
      <div className="w-full h-full flex items-center justify-center">
        {currentItem.type === 'image' ? (
          <img
            src={currentItem.url}
            alt={currentItem.name}
            className="max-w-full max-h-full object-contain"
            onError={handleMediaError}
          />
        ) : (
          <video
            ref={videoRef}
            src={currentItem.url}
            className="max-w-full max-h-full object-contain"
            autoPlay
            muted={false}
            controls={false}
            onEnded={handleVideoEnded}
            onError={handleMediaError}
          />
        )}
      </div>
      
      {/* Progress indicator */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="flex">
          {carousel.items.map((item, index) => (
            <div 
              key={item.id} 
              className={`h-1 ${index === currentItemIndex ? 'bg-white' : 'bg-gray-700'} transition-all duration-500`}
              style={{ width: `${100 / carousel.items.length}%` }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Offline indicator */}
      {offlineMode && (
        <div className="absolute top-4 right-4 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
          Offline Mode
        </div>
      )}
      
      {/* Debug info - hidden in production */}
      <div className="absolute bottom-4 left-4 text-gray-600 text-xs opacity-30">
        <p>Item {currentItemIndex + 1} of {carousel.items.length}</p>
        <p>{currentItem.name}</p>
      </div>
    </div>
  );
}
