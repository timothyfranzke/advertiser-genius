'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider } from '../../components/auth/AuthContext';

export default function CarouselsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isNewCarousel = pathname === '/portal/carousels/new';
  const isCarouselList = pathname === '/portal/carousels';
  
  return (
    <AuthProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ad Carousels</h1>
            <p className="text-gray-600">Create and manage your ad carousels</p>
          </div>
          
          {!isNewCarousel && (
            <Link
              href="/portal/carousels/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Create New Carousel
            </Link>
          )}
          
          {isNewCarousel && (
            <Link
              href="/portal/carousels"
              className="text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors"
            >
              Back to Carousels
            </Link>
          )}
        </div>
        
        {isCarouselList && (
          <div className="bg-white p-4 rounded-md shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <div className="relative flex-grow max-w-sm">
                <input
                  type="text"
                  placeholder="Search carousels..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <select className="border border-gray-300 rounded-md text-gray-700 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Draft</option>
                  <option>Archived</option>
                </select>
                
                <select className="border border-gray-300 rounded-md text-gray-700 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option>All Locations</option>
                  <option>Location 1</option>
                  <option>Location 2</option>
                  <option>Location 3</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {children}
      </div>
    </AuthProvider>
  );
}
