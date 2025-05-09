'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../components/auth/AuthContext';

interface Carousel {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'archived';
  itemCount: number;
  locations: string[];
  lastModified: Date;
  thumbnailUrl: string;
}

export default function CarouselsPage() {
  const { user } = useAuth();
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch data from Firestore
    const fetchCarousels = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        setTimeout(() => {
          const mockCarousels: Carousel[] = [
            {
              id: '1',
              name: 'Summer Sale',
              status: 'active',
              itemCount: 5,
              locations: ['Downtown Store', 'Mall Location'],
              lastModified: new Date(),
              thumbnailUrl: '/placeholder-image.jpg',
            },
            {
              id: '2',
              name: 'New Products',
              status: 'active',
              itemCount: 3,
              locations: ['Downtown Store'],
              lastModified: new Date(Date.now() - 86400000), // 1 day ago
              thumbnailUrl: '/placeholder-image.jpg',
            },
            {
              id: '3',
              name: 'Holiday Special',
              status: 'draft',
              itemCount: 8,
              locations: [],
              lastModified: new Date(Date.now() - 172800000), // 2 days ago
              thumbnailUrl: '/placeholder-image.jpg',
            }
          ];
          
          setCarousels(mockCarousels);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching carousels:', error);
        setLoading(false);
      }
    };
    
    fetchCarousels();
  }, [user]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (carousels.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          <svg className="h-12 w-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Ad Carousels Yet</h3>
        <p className="text-gray-500 mb-6">Create your first ad carousel to display on your TVs</p>
        <Link
          href="/portal/carousels/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Carousel
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {carousels.map((carousel) => (
        <Link href={`/portal/carousels/${carousel.id}`} key={carousel.id} className="block">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video relative bg-gray-200">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                {/* Replace with actual thumbnail when available */}
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900">{carousel.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(carousel.status)}`}>
                  {carousel.status.charAt(0).toUpperCase() + carousel.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <svg className="flex-shrink-0 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {carousel.itemCount} items
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <svg className="flex-shrink-0 mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {carousel.locations.length === 0 
                  ? "No locations assigned" 
                  : carousel.locations.length === 1 
                    ? carousel.locations[0] 
                    : `${carousel.locations[0]} +${carousel.locations.length - 1} more`}
              </div>
              <div className="text-xs text-gray-400">
                Last modified: {carousel.lastModified.toLocaleDateString()}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
