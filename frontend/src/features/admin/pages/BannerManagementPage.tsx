import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { contentService } from '../services/contentService';

interface CmsContent {
  id: number;
  type: 'banner' | 'announcement' | 'page' | 'widget';
  key: string;
  title: string;
  content: string;
  metadata?: {
    targetAudience?: 'all' | 'buyers' | 'sellers' | 'agents';
    priority?: number;
    startDate?: string;
    endDate?: string;
    color?: string;
    backgroundColor?: string;
    buttonText?: string;
    buttonLink?: string;
  };
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export function BannerManagementPage() {
  const [banners, setBanners] = useState<CmsContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contentService.getContent({
        page: 1,
        limit: 50,
        type: 'banner'
      });

      if (response.success && response.data) {
        setBanners(response.data.data);
      } else {
        throw new Error(response.message || 'Failed to fetch banners');
      }
    } catch (err: any) {
      console.error('Error fetching banners:', err);
      setError(err.message || 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const updateBannerStatus = async (bannerId: number, isActive: boolean) => {
    try {
      const response = await contentService.updateContent(bannerId, { isActive });
      if (response.success) {
        fetchBanners();
      } else {
        alert(response.message || 'Failed to update banner');
      }
    } catch (err: any) {
      alert('Failed to update banner');
    }
  };

  const deleteBanner = async (bannerId: number) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await contentService.deleteContent(bannerId);
      if (response.success) {
        fetchBanners();
      } else {
        alert(response.message || 'Failed to delete banner');
      }
    } catch (err: any) {
      alert('Failed to delete banner');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Banner Management</h1>
          <p className="text-gray-600">Manage site banners and announcements</p>
        </div>
        <Button>
          <Icon icon="solar:add-circle-bold" className="mr-2 size-4" />
          Create Banner
        </Button>
      </div>

      {/* Banners Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {banners.map((banner) => (
          <Card key={banner.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{banner.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Key: {banner.key}
                  </p>
                </div>
                <Badge variant={banner.isActive ? "default" : "secondary"}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Banner Preview */}
              <div 
                className="p-4 rounded-lg border-2 border-dashed border-gray-200 min-h-[100px] flex items-center justify-center"
                style={{
                  backgroundColor: banner.metadata?.backgroundColor || '#f8f9fa',
                  color: banner.metadata?.color || '#333'
                }}
              >
                <div className="text-center">
                  <p className="text-sm font-medium">{banner.content}</p>
                  {banner.metadata?.buttonText && (
                    <Button size="sm" className="mt-2">
                      {banner.metadata.buttonText}
                    </Button>
                  )}
                </div>
              </div>

              {/* Banner Details */}
              <div className="space-y-2 text-sm">
                {banner.metadata?.targetAudience && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Audience:</span>
                    <Badge variant="outline" className="capitalize">
                      {banner.metadata.targetAudience}
                    </Badge>
                  </div>
                )}
                {banner.metadata?.priority && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Priority:</span>
                    <span>{banner.metadata.priority}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order:</span>
                  <span>{banner.displayOrder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated:</span>
                  <span>{new Date(banner.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => updateBannerStatus(banner.id, !banner.isActive)}
                >
                  {banner.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                >
                  <Icon icon="solar:pen-bold" className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteBanner(banner.id)}
                >
                  <Icon icon="solar:trash-bin-trash-bold" className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {banners.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <Icon icon="solar:megaphone-bold" className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No banners found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first banner to start engaging with your users.
          </p>
          <Button>
            <Icon icon="solar:add-circle-bold" className="mr-2 size-4" />
            Create Banner
          </Button>
        </Card>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <Icon icon="solar:danger-triangle-bold" className="size-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}