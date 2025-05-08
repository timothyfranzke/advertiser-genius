'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../components/auth/AuthContext';

// Interfaces
interface MediaItem {
  id: string;
  file?: File;
  previewUrl: string;
  type: 'image' | 'video';
  name: string;
  size: number;
  duration?: number; // For videos
}

interface CarouselFormData {
  name: string;
  description: string;
  locations: string[];
  schedule: {
    startDate: string;
    endDate: string;
    displayDuration: number; // seconds per item
  };
}

// Media Item Card Component
const ItemTypes = {
  MEDIA_ITEM: 'mediaItem',
};

interface DraggableItemProps {
  item: MediaItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  onRemove: (id: string) => void;
}

const DraggableItem = ({ item, index, moveItem, onRemove }: DraggableItemProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.MEDIA_ITEM,
    item: () => ({ id: item.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop({
    accept: ItemTypes.MEDIA_ITEM,
    hover: (draggedItem: { id: string; index: number }, monitor) => {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      moveItem(dragIndex, hoverIndex);
      
      // Update the index for the dragged item
      draggedItem.index = hoverIndex;
    },
  });
  
  drag(drop(ref));
  
  return (
    <div
      ref={ref}
      className={`relative bg-white border rounded-lg overflow-hidden ${isDragging ? 'opacity-50' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="aspect-video relative bg-gray-100">
        {item.type === 'image' ? (
          <img 
            src={item.previewUrl} 
            alt={item.name} 
            className="w-full h-full object-contain"
          />
        ) : (
          <video 
            src={item.previewUrl} 
            className="w-full h-full object-contain" 
            controls
          />
        )}
      </div>
      
      <div className="p-3">
        <div className="flex justify-between items-center">
          <div className="truncate">
            <p className="font-medium text-gray-900 truncate">{item.name}</p>
            <p className="text-sm text-gray-500">
              {item.type === 'image' ? 'Image' : 'Video'} - 
              {(item.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          
          <button
            onClick={() => onRemove(item.id)}
            className="text-red-600 hover:text-red-800"
            aria-label="Remove item"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="absolute top-2 left-2 bg-gray-800 bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        #{index + 1}
      </div>
    </div>
  );
};

// Main Carousel Creation Component
export default function NewCarouselPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState<CarouselFormData>({
    name: '',
    description: '',
    locations: [],
    schedule: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      displayDuration: 10,
    },
  });
  
  // Handle form field changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('schedule.')) {
      const scheduleKey = name.split('.')[1];
      setFormData({
        ...formData,
        schedule: {
          ...formData.schedule,
          [scheduleKey]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  // Handle multi-select for locations
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData({
      ...formData,
      locations: selectedOptions,
    });
  };
  
  // File upload with react-dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems = acceptedFiles.map(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) return null;
      
      return {
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        type: isImage ? 'image' as const : 'video' as const,
        name: file.name,
        size: file.size,
        duration: isVideo ? 0 : undefined, // We would calculate video duration here in a real app
      };
    }).filter(Boolean) as MediaItem[];
    
    setMediaItems(prevItems => [...prevItems, ...newItems]);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'video/mp4': []
    }
  });
  
  // Drag and drop reordering
  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setMediaItems(prevItems => {
      const newItems = [...prevItems];
      const draggedItem = newItems[dragIndex];
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, draggedItem);
      return newItems;
    });
  }, []);
  
  // Remove item
  const removeItem = useCallback((id: string) => {
    setMediaItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);
  
  // Save carousel
  const saveCarousel = async () => {
    if (!user) return;
    
    if (!formData.name.trim()) {
      alert('Please enter a carousel name');
      return;
    }
    
    if (mediaItems.length === 0) {
      alert('Please add at least one media item');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Upload all media items to Firebase Storage
      const storage = getStorage();
      const db = getFirestore();
      
      const uploadPromises = mediaItems.map(async (item, index) => {
        if (!item.file) return null;
        
        const fileExt = item.name.split('.').pop();
        const fileName = `carousels/${user.uid}/${Date.now()}_${index}.${fileExt}`;
        const storageRef = ref(storage, fileName);
        
        await uploadBytes(storageRef, item.file);
        const downloadUrl = await getDownloadURL(storageRef);
        
        return {
          id: item.id,
          url: downloadUrl,
          type: item.type,
          name: item.name,
          order: index,
          duration: item.duration || formData.schedule.displayDuration,
        };
      });
      
      // Set progress to 50% after media upload starts
      setUploadProgress(50);
      
      const uploadedItems = await Promise.all(uploadPromises);
      
      // Create carousel document in Firestore
      const carouselData = {
        userId: user.uid,
        name: formData.name,
        description: formData.description,
        locations: formData.locations,
        schedule: {
          startDate: new Date(formData.schedule.startDate),
          endDate: new Date(formData.schedule.endDate),
          displayDuration: Number(formData.schedule.displayDuration),
        },
        items: uploadedItems.filter(Boolean),
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      // Set progress to 75% after media upload completes
      setUploadProgress(75);
      
      const docRef = await addDoc(collection(db, 'carousels'), carouselData);
      
      // Set progress to 100% when complete
      setUploadProgress(100);
      
      // Redirect to carousel details page
      router.push(`/portal/carousels/${docRef.id}`);
    } catch (error) {
      console.error('Error saving carousel:', error);
      alert('An error occurred while saving your carousel. Please try again.');
      setIsUploading(false);
    }
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-xl font-semibold text-gray-900">Create New Ad Carousel</h1>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form fields */}
            <div className="lg:col-span-1 space-y-6">
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
                      name="schedule.startDate"
                      value={formData.schedule.startDate}
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
                      name="schedule.endDate"
                      value={formData.schedule.endDate}
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
                  name="schedule.displayDuration"
                  value={formData.schedule.displayDuration}
                  onChange={handleFormChange}
                  min="1"
                  max="60"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={saveCarousel}
                  disabled={isUploading}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isUploading ? 'Saving...' : 'Save Carousel'}
                </button>
                
                {isUploading && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {uploadProgress}% complete
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Media items section */}
            <div className="lg:col-span-2">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer h-64 ${
                  isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                <input {...getInputProps()} />
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-gray-600">
                  {isDragActive ? (
                    'Drop the files here...'
                  ) : (
                    <>
                      Drag & drop images or videos here, or <span className="text-indigo-600">browse</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports: PNG, JPEG, MP4 (max 20MB)
                </p>
              </div>
              
              {mediaItems.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-900">Media Items ({mediaItems.length})</h3>
                    <button 
                      type="button"
                      onClick={() => setMediaItems([])}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaItems.map((item, index) => (
                      <DraggableItem
                        key={item.id}
                        item={item}
                        index={index}
                        moveItem={moveItem}
                        onRemove={removeItem}
                      />
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-3">
                    Drag and drop items to reorder them in the carousel.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
