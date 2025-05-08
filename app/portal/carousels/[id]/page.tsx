'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../../components/auth/AuthContext'

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
  description: string;
  status: 'active' | 'draft' | 'archived';
  locations: string[];
  schedule: {
    startDate: Date;
    endDate: Date;
    displayDuration: number;
  };
  items: MediaItem[];
  createdAt: Date;
  updatedAt: Date;
}

export default function CarouselDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [carousel, setCarousel] = useState<Carousel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Editable form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: '',
    locations: [] as string[],
    startDate: '',
    endDate: '',
    displayDuration: 10,
  });
  
  useEffect(() => {
    const fetchCarousel = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // In a real app, this would fetch from Firestore
        // For this demo, we'll create a mock carousel
        
        setTimeout(() => {
          const mockCarousel: Carousel = {
            id: params.id,
            name: 'Summer Sale Campaign',
            description: 'Promotional carousel for our summer product line',
            status: 'active',
            locations: ['location1', 'location2'],
            schedule: {
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              displayDuration: 10,
            },
            items: [
              {
                id: '1',
                url: '/placeholder-image.jpg',
                type: 'image',
                name: 'Summer Sale Banner.jpg',
                order: 0,
                duration: 10,
              },
              {
                id: '2',
                url: '/placeholder-image.jpg',
                type: 'image',
                name: 'Product Highlight 1.jpg',
                order: 1,
                duration: 10,
              },
              {
                id: '3',
                url: '/placeholder-image.jpg',
                type: 'video',
                name: 'Promotional Video.mp4',
                order: 2,
                duration: 30,
              },
            ],
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          };
          
          setCarousel(mockCarousel);
          
          // Initialize form data
          setFormData({
            name: mockCarousel.name,
            description: mockCarousel.description,
            status: mockCarousel.status,
            locations: mockCarousel.locations,
            startDate: mockCarousel.schedule.startDate.toISOString().split('T')[0],
            endDate: mockCarousel.schedule.endDate.toISOString().split('T')[0],
            displayDuration: mockCarousel.schedule.displayDuration,
          });
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching carousel:', error);
        setLoading(false);
      }
    };
    
    fetchCarousel();
  }, [user, params.id]);
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      locations: selectedOptions,
    }));
  };
  
  const saveChanges = async () => {
    if (!user || !carousel) return;
    
    try {
      setIsSaving(true);
      
      // In a real app, this would update the document in Firestore
      // For this demo, we'll just update the local state
      
      const updatedCarousel = {
        ...carousel,
        name: formData.name,
        description: formData.description,
        status: formData.status as 'active' | 'draft' | 'archived',
        locations: formData.locations,
        schedule: {
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          displayDuration: formData.displayDuration,
        },
        updatedAt: new Date(),
      };
      
      setCarousel(updatedCarousel);
      setIsEditing(false);
      setIsSaving(false);
      
      // Success notification would go here
    } catch (error) {
      console.error('Error updating carousel:', error);
      setIsSaving(false);
      // Error notification would go here
    }
  };
  
  const deleteCarousel = async () => {
    if (!user || !carousel) return;
    
    try {
      // In a real app, this would delete the document from Firestore
      // For this demo, we'll just redirect
      
      // Success notification would go here
      router.push('/portal/carousels');
    } catch (error) {
      console.error('Error deleting carousel:', error);
      // Error notification would go here
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!carousel) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h3 className="text-xl font-medium text-gray-900 mb-2">Carousel Not Found</h3>
        <p className="text-gray-500 mb-6">The carousel you are looking for may have been deleted or doesn't exist.</p>
        <Link
          href="/portal/carousels"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Carousels
        </Link>
      </div>
    );
  }
  
  const locationNames: Record<string, string> = {
    location1: 'Downtown Store',
    location2: 'Mall Location',
    location3: 'West Side Shop',
  };
  
  const statusBadgeColors = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800',
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">{carousel.name}</h1>
            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeColors[carousel.status]}`}>
              {carousel.status.charAt(0).toUpperCase() + carousel.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Created: {carousel.createdAt.toLocaleDateString()} | Last Updated: {carousel.updatedAt.toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex space-x-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={saveChanges}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Delete Carousel</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this carousel? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteCarousel}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details column */}
          <div className="lg:col-span-1">
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Carousel Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="locations" className="block text-sm font-medium text-gray-700 mb-1">
                    Display Locations
                  </label>
                  <select
                    id="locations"
                    name="locations"
                    multiple
                    value={formData.locations}
                    onChange={handleLocationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="location1">Downtown Store</option>
                    <option value="location2">Mall Location</option>
                    <option value="location3">West Side Shop</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple locations</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-xs text-gray-500 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-xs text-gray-500 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="displayDuration" className="block text-sm font-medium text-gray-700 mb-1">
                    Display Duration (seconds per item)
                  </label>
                  <input
                    type="number"
                    id="displayDuration"
                    name="displayDuration"
                    value={formData.displayDuration}
                    onChange={handleFormChange}
                    min="1"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {carousel.description || 'No description provided'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Locations</h3>
                  <div className="mt-1">
                    {carousel.locations.length === 0 ? (
                      <p className="text-sm text-gray-900">No locations assigned</p>
                    ) : (
                      <ul className="text-sm text-gray-900">
                        {carousel.locations.map(loc => (
                          <li key={loc} className="mb-1">
                            {locationNames[loc] || loc}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Schedule</h3>
                  <div className="mt-1 text-sm text-gray-900">
                    <p>
                      Start Date: {carousel.schedule.startDate.toLocaleDateString()}
                    </p>
                    <p>
                      End Date: {carousel.schedule.endDate.toLocaleDateString()}
                    </p>
                    <p>
                      Display Duration: {carousel.schedule.displayDuration} seconds per item
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Media items column */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Media Items ({carousel.items.length})
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {carousel.items.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden">
                  <div className="aspect-video relative bg-gray-100">
                    {item.type === 'image' ? (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3">
                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                      <span>Duration: {item.duration}s</span>
                    </div>
                  </div>
                  
                  <div className="absolute top-2 left-2 bg-gray-800 bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    #{item.order + 1}
                  </div>
                </div>
              ))}
            </div>
            
            {isEditing && (
              <div className="mt-6">
                <Link
                  href={`/portal/carousels/${carousel.id}/edit-media`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Edit Media Items
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
