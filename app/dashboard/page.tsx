'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where, getFirestore } from 'firebase/firestore';
import { useAuth } from '../components/auth/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    carousels: 0,
    locations: 0,
    tvDevices: 0,
    activeAds: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      
      try {
        setLoading(true);
        const db = getFirestore();
        
        // In a real app, you would fetch actual data from Firestore
        // This is a placeholder implementation
        
        // For demonstration, we'll simulate data fetching
        setTimeout(() => {
          setStats({
            carousels: 5,
            locations: 3,
            tvDevices: 7,
            activeAds: 12
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setLoading(false);
      }
    }
    
    fetchStats();
  }, [user]);

  const statCards = [
    { name: 'Ad Carousels', value: stats.carousels, icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', href: '/portal/carousels', color: 'bg-indigo-500' },
    { name: 'Locations', value: stats.locations, icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', href: '/dashboard/locations', color: 'bg-green-500' },
    { name: 'TV Devices', value: stats.tvDevices, icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', href: '/dashboard/devices', color: 'bg-purple-500' },
    { name: 'Active Ads', value: stats.activeAds, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', href: '/portal/carousels', color: 'bg-orange-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.email}</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card) => (
              <Link
                key={card.name}
                href={card.href}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`${card.color} p-3 rounded-md text-white mr-4`}>
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon} />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{card.value}</div>
                    <div className="text-gray-500 text-sm">{card.name}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {/* Sample activity items - in a real app these would come from Firestore */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start pb-4 border-b border-gray-100">
                    <div className="bg-blue-100 p-2 rounded-md text-blue-600 mr-4">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-800">Carousel "Summer Sale" was published</p>
                      <p className="text-gray-500 text-sm">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/portal/carousels" className="text-indigo-600 text-sm hover:text-indigo-800">
                  View all carousels →
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/portal/carousels/new"
                  className="flex items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg className="h-5 w-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Carousel
                </Link>
                <Link
                  href="/dashboard/locations/new"
                  className="flex items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg className="h-5 w-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Location
                </Link>
                <Link
                  href="/tv/setup"
                  className="flex items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg className="h-5 w-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Setup New TV
                </Link>
                <Link
                  href="/dashboard/subscription"
                  className="flex items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg className="h-5 w-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Manage Subscription
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
