import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '../../lib/api';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface PropertyImage {
  id: number;
  property_id: number;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
}

interface ImageUploadProps {
  propertyId: number;
  images: PropertyImage[];
  onImagesUpdated: (images: PropertyImage[]) => void;
}

const ImageUpload = ({ propertyId, images, onImagesUpdated }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch(`/api/properties/${propertyId}/images`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const result = await response.json();
      
      // Refresh images list
      const imagesResponse = await fetch(`/api/properties/${propertyId}/images`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (imagesResponse.ok) {
        const imagesResult = await imagesResponse.json();
        onImagesUpdated(imagesResult.data.images);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  }, [propertyId, onImagesUpdated]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    disabled: uploading,
  });

  const handleDeleteImage = async (imageId: number) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      // Remove image from local state
      const updatedImages = images.filter(img => img.id !== imageId);
      onImagesUpdated(updatedImages);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Property Images</h3>
      
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg mb-2">
          {isDragActive ? 'Drop images here...' : 'Drag & drop images here, or click to select'}
        </p>
        <p className="text-sm text-gray-500">
          Supports JPEG, PNG, WebP (max 10 images)
        </p>
        {uploading && <p className="text-blue-600 mt-2">Uploading...</p>}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.image_url}
                alt={image.alt_text || 'Property image'}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => handleDeleteImage(image.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
              {image.is_primary && (
                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="mx-auto h-12 w-12 mb-4 text-gray-300" />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;