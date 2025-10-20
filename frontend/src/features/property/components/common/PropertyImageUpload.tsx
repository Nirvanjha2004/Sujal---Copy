import { useState, useRef, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';

interface ImagePreview {
  file: File;
  url: string;
  id: string;
  uploadProgress?: number;
  isUploading?: boolean;
  error?: string;
}

interface PropertyImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  onUpload?: (files: File[]) => Promise<void>;
  isUploading?: boolean;
  uploadProgress?: Record<string, number>;
  className?: string;
}

export function PropertyImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 10,
  maxFileSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  onUpload,
  isUploading = false,
  uploadProgress = {},
  className = ""
}: PropertyImageUploadProps) {
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use JPEG, PNG, or WebP images.`;
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB.`;
    }
    
    return null;
  };

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const newPreviews: ImagePreview[] = [];
    
    setError('');

    if (imagePreviews.length + fileArray.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images.`);
      return;
    }

    fileArray.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      validFiles.push(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview: ImagePreview = {
          file,
          url: e.target?.result as string,
          id: Math.random().toString(36).substr(2, 9),
          uploadProgress: 0,
          isUploading: false
        };
        newPreviews.push(preview);
        
        if (newPreviews.length === validFiles.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
          onImagesChange([...images, ...validFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [images, imagePreviews.length, maxImages, maxFileSize, acceptedTypes, onImagesChange]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (id: string) => {
    const imageToRemove = imagePreviews.find(img => img.id === id);
    if (imageToRemove) {
      setImagePreviews(prev => prev.filter(img => img.id !== id));
      onImagesChange(images.filter(img => img !== imageToRemove.file));
    }
    setError('');
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newPreviews = [...imagePreviews];
    const newImages = [...images];
    
    const [movedPreview] = newPreviews.splice(fromIndex, 1);
    const [movedImage] = newImages.splice(fromIndex, 1);
    
    newPreviews.splice(toIndex, 0, movedPreview);
    newImages.splice(toIndex, 0, movedImage);
    
    setImagePreviews(newPreviews);
    onImagesChange(newImages);
  };

  const handleUpload = async () => {
    if (onUpload && images.length > 0) {
      try {
        await onUpload(images);
      } catch (error) {
        setError('Failed to upload images. Please try again.');
      }
    }
  };

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <Icon icon="solar:danger-bold" className="size-5 text-red-500" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label>Upload Property Images</Label>
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Icon 
              icon="solar:cloud-upload-bold" 
              className={`size-12 mx-auto mb-4 ${
                dragActive ? 'text-primary' : 'text-muted-foreground'
              }`} 
            />
            <p className="text-lg font-medium mb-2">
              {dragActive ? 'Drop images here' : 'Upload Property Images'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop images here, or click to browse
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground mb-4">
              <Badge variant="outline">Max {maxImages} images</Badge>
              <Badge variant="outline">Max {maxFileSize}MB each</Badge>
              <Badge variant="outline">JPEG, PNG, WebP</Badge>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={imagePreviews.length >= maxImages || isUploading}
            >
              <Icon icon="solar:gallery-bold" className="size-4 mr-2" />
              Choose Images
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {imagePreviews.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>
              Image Previews ({imagePreviews.length}/{maxImages})
              {imagePreviews.length > 0 && (
                <span className="text-xs text-muted-foreground ml-2">
                  Drag to reorder • First image will be the main photo
                </span>
              )}
            </Label>
            {onUpload && images.length > 0 && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                size="sm"
              >
                {isUploading ? (
                  <>
                    <Icon icon="solar:loading-bold" className="size-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:cloud-upload-bold" className="size-4 mr-2" />
                    Upload All
                  </>
                )}
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imagePreviews.map((preview, index) => (
              <Card key={preview.id} className="relative group overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={preview.url}
                      alt={`Property preview ${index + 1}`}
                      className="w-full h-32 object-cover"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', index.toString());
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        reorderImages(fromIndex, index);
                      }}
                    />
                    
                    {/* Upload Progress */}
                    {preview.isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Icon icon="solar:loading-bold" className="size-6 mx-auto mb-2 animate-spin" />
                          <Progress 
                            value={preview.uploadProgress || 0} 
                            className="w-16 h-2"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Main photo indicator */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Main Photo
                      </div>
                    )}
                    
                    {/* File size */}
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {getFileSize(preview.file.size)}
                    </div>
                    
                    {/* Remove button */}
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(preview.id)}
                      disabled={isUploading}
                    >
                      <Icon icon="solar:close-bold" className="size-3" />
                    </Button>
                    
                    {/* Drag handle */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icon 
                        icon="solar:drag-bold" 
                        className="size-4 text-white drop-shadow-lg cursor-move" 
                      />
                    </div>

                    {/* Error indicator */}
                    {preview.error && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <Icon icon="solar:danger-bold" className="size-6 text-red-500" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {imagePreviews.length < maxImages && (
            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Icon icon="solar:add-circle-bold" className="size-4 mr-2" />
              Add More Images ({maxImages - imagePreviews.length} remaining)
            </Button>
          )}
        </div>
      )}
    </div>
  );
}