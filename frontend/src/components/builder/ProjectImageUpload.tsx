import { useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ProjectImageUploadProps {
  projectId: number;
  images: Array<{
    id: number;
    image_url: string;
    caption?: string;
    is_primary?: boolean;
  }>;
  onImagesUpdate: () => void;
}

export function ProjectImageUpload({ projectId, images, onImagesUpdate }: ProjectImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      setUploading(true);
      
      // FIX: Create a FormData object and append files to it
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('images', file);
      });

      // Pass the FormData object to the API call
      await api.projects.images.uploadProjectImages(projectId, formData);
      
      toast.success(`${validFiles.length} image(s) uploaded successfully`);
      onImagesUpdate();
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [projectId, onImagesUpdate]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await api.projects.images.deleteProjectImage(projectId, imageId);
      toast.success('Image deleted successfully');
      onImagesUpdate();
    } catch (error) {
      console.error('Delete image error:', error);
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Project Images</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Upload high-quality images of your project. First image will be used as the cover photo.
        </p>
      </div>

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : uploading 
            ? 'border-muted-foreground/50' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              {uploading ? (
                <Icon icon="solar:refresh-bold" className="size-8 text-muted-foreground animate-spin" />
              ) : (
                <Icon icon="solar:gallery-add-bold" className="size-8 text-muted-foreground" />
              )}
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">
                {uploading ? 'Uploading images...' : 'Upload project images'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop images here, or click to select files
              </p>
              
              <div className="flex items-center justify-center gap-4">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button type="button" disabled={uploading} asChild>
                    <span>
                      <Icon icon="solar:upload-bold" className="size-4 mr-2" />
                      Choose Files
                    </span>
                  </Button>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  disabled={uploading}
                  className="hidden"
                />
              </div>
              
              <p className="text-xs text-muted-foreground mt-3">
                Supported formats: JPG, PNG, WebP. Maximum size: 10MB per image.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display uploaded images */}
      {images && images.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4">Uploaded Images ({images.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="relative aspect-square">
                  <img
                    src={image.image_url}
                    alt={image.caption || `Project image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {image.is_primary && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Cover Photo
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Icon icon="solar:trash-bin-minimalistic-bold" className="size-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {images && images.length === 0 && (
        <Alert>
          <Icon icon="solar:info-circle-bold" className="size-4" />
          <AlertDescription>
            No images uploaded yet. Add some high-quality images to showcase your project.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}