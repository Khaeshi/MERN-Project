'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../lib/api';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Check,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import Image from 'next/image';

interface S3Image {
  key: string;
  url: string;
  lastModified: string;
  size: number;
}

interface ImageGalleryProps {
  onSelectImage: (url: string) => void;
  selectedImage?: string;
  onClose: () => void;
}

export default function ImageGallery({ onSelectImage, selectedImage, onClose }: ImageGalleryProps) {
  const [images, setImages] = useState<S3Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(selectedImage || '');

  // Fetch images from S3
  const fetchImages = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(API_ENDPOINTS.listImages, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch images');

      const data = await response.json();
      setImages(data.images);
    } catch (error) {
      console.error('Error fetching images:', error);
      alert('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Upload image
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(API_ENDPOINTS.uploadImage, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      // Refresh image list
      await fetchImages();
      
      // Auto-select the newly uploaded image
      setSelectedImageUrl(data.imageUrl);
      
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Delete image
  const handleDelete = async (key: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    const token = localStorage.getItem('adminToken');
    
    try {
      const response = await fetch(API_ENDPOINTS.deleteImage, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) throw new Error('Delete failed');

      // Refresh image list
      await fetchImages();
      
      alert('Image deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    }
  };

  // Select image
  const handleSelect = () => {
    if (selectedImageUrl) {
      onSelectImage(selectedImageUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-stone-800 border-stone-700">
        <CardHeader className="border-b border-stone-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-500" />
              Image Gallery
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchImages}
                disabled={loading}
                className="bg-stone-700 border-stone-600 text-white hover:bg-stone-600"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-stone-400 hover:text-white hover:bg-stone-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Upload Section */}
          <div className="mb-6">
            <label className="block">
              <div className="border-2 border-dashed border-stone-600 rounded-lg p-8 text-center hover:border-amber-600 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-amber-500 mb-3 animate-spin" />
                    <p className="text-stone-300">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-stone-500 mb-3" />
                    <p className="text-stone-300 font-medium mb-1">
                      Click to upload image
                    </p>
                    <p className="text-stone-500 text-sm">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Images Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 mx-auto text-stone-500 mb-4" />
              <p className="text-stone-400">No images yet. Upload your first image!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.key}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageUrl === image.url
                      ? 'border-amber-600 ring-2 ring-amber-600/50'
                      : 'border-stone-700 hover:border-stone-600'
                  }`}
                  onClick={() => setSelectedImageUrl(image.url)}
                >
                  <div className="aspect-square relative bg-stone-900">
                    <Image
                      src={image.url}
                      alt="Gallery image"
                      fill
                      className="object-cover"
                    />
                    
                    {/* Selected Indicator */}
                    {selectedImageUrl === image.url && (
                      <div className="absolute inset-0 bg-amber-600/20 flex items-center justify-center">
                        <div className="bg-amber-600 rounded-full p-2">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.key);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/80 hover:bg-red-600 text-white p-2 h-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Image Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">
                      {(image.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* Footer Actions */}
        <div className="border-t border-stone-700 p-4 bg-stone-800/50">
          <div className="flex justify-between items-center">
            <p className="text-stone-400 text-sm">
              {selectedImageUrl ? 'Image selected' : 'Select an image to continue'}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="bg-stone-700 border-stone-600 text-white hover:bg-stone-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSelect}
                disabled={!selectedImageUrl}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Select Image
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}