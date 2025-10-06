import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api } from '@/lib/api';

// Custom toast hook implementation - SIMPLIFIED
const useToast = () => ({
  toast: ({ title, description, variant }: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
    // Only show error toasts, success operations are self-evident
    if (variant === 'destructive') {
      console.error(`❌ ${title}: ${description}`);
      alert(`Error: ${description}`);
    } else {
      console.log(`✅ ${title}: ${description}`);
      // Don't show success alerts for normal operations
    }
  }
});

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

interface CreateContentData {
  type: 'banner' | 'announcement';
  key: string;
  title: string;
  content: string;
  metadata?: object;
  isActive?: boolean;
  displayOrder?: number;
}

export function BannerManagement() {
  const [content, setContent] = useState<CmsContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingContent, setEditingContent] = useState<CmsContent | null>(null);
  const [selectedType, setSelectedType] = useState<'banner' | 'announcement'>('banner');
  const { toast } = useToast();

  const [formData, setFormData] = useState<CreateContentData>({
    type: 'banner',
    key: '',
    title: '',
    content: '',
    metadata: {
      targetAudience: 'all',
      priority: 1,
      startDate: '',
      endDate: '',
    },
    isActive: true,
    displayOrder: 0,
  });

  // Fetch CMS content - OPTIMIZED
  const fetchContent = async () => {
    if (!isLoading) {
      setIsLoading(true);
    }
    
    try {
      console.log('🔄 Fetching CMS content...');
      
      const response = await api.cms.getContent({
        page: 1,
        limit: 100,
      });

      console.log('📦 CMS Response:', response);

      if (response.success && response.data?.content) {
        // Filter for banners and announcements only
        const filteredContent = response.data.content.filter(
          (item: CmsContent) => item.type === 'banner' || item.type === 'announcement'
        );
        
        setContent(filteredContent);
        console.log('✅ Loaded content:', filteredContent.length, 'items');
        
        // NO TOAST FOR SUCCESSFUL LOADING - it's expected behavior
      } else {
        console.warn('⚠️ No content data in response');
        setContent([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching content:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to fetch content',
        variant: "destructive",
      });
      setContent([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create or update content - OPTIMIZED
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('💾 Saving content:', formData);

      const contentData = {
        type: formData.type,
        key: formData.key,
        title: formData.title,
        content: formData.content,
        metadata: formData.metadata,
        isActive: formData.isActive,
        displayOrder: formData.displayOrder || 0,
      };

      let response;
      if (editingContent) {
        // Update existing content
        response = await api.cms.updateContent(editingContent.id, {
          title: contentData.title,
          content: contentData.content,
          metadata: contentData.metadata,
          isActive: contentData.isActive,
          displayOrder: contentData.displayOrder,
        });
        console.log('✅ Updated content:', response);
      } else {
        // Create new content
        response = await api.cms.createContent(contentData);
        console.log('✅ Created content:', response);
      }

      if (response.success) {
        // Close form and reset
        setShowCreateForm(false);
        setEditingContent(null);
        resetForm();
        
        // Refresh data without showing loading state
        setIsLoading(false);
        await fetchContent();
        
        // NO TOAST - successful creation/update is evident from the UI refresh
      }
    } catch (error: any) {
      console.error('❌ Error saving content:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to save content',
        variant: "destructive",
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      type: 'banner',
      key: '',
      title: '',
      content: '',
      metadata: {
        targetAudience: 'all',
        priority: 1,
        startDate: '',
        endDate: '',
      },
      isActive: true,
      displayOrder: 0,
    });
  };

  // Edit content
  const handleEdit = (item: CmsContent) => {
    setEditingContent(item);
    setFormData({
      type: item.type as 'banner' | 'announcement',
      key: item.key,
      title: item.title,
      content: item.content,
      metadata: item.metadata || {
        targetAudience: 'all',
        priority: 1,
        startDate: '',
        endDate: '',
      },
      isActive: item.isActive,
      displayOrder: item.displayOrder,
    });
    setShowCreateForm(true);
  };

  // Toggle content status - OPTIMIZED
  const handleToggleStatus = async (id: number) => {
    try {
      console.log('🔄 Toggling status for content:', id);
      
      const response = await api.cms.toggleContentStatus(id);
      
      if (response.success) {
        // Update local state immediately for better UX
        setContent(prev => prev.map(item => 
          item.id === id ? { ...item, isActive: !item.isActive } : item
        ));
        
        console.log('✅ Status toggled successfully');
        // NO TOAST - toggle is evident from UI change
      }
    } catch (error: any) {
      console.error('❌ Error toggling status:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update status',
        variant: "destructive",
      });
    }
  };

  // Delete content - OPTIMIZED
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting content:', id);
      
      const response = await api.cms.deleteContent(id);
      
      if (response.success) {
        // Remove from local state immediately
        setContent(prev => prev.filter(item => item.id !== id));
        
        console.log('✅ Content deleted successfully');
        // NO TOAST - deletion is evident from UI change
      }
    } catch (error: any) {
      console.error('❌ Error deleting content:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to delete content',
        variant: "destructive",
      });
    }
  };

  // Generate unique key from title
  const generateKey = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  // Update key when title changes (for new content only)
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      ...(editingContent ? {} : { key: generateKey(title) }),
    }));
  };

  // SINGLE useEffect with dependency array
  useEffect(() => {
    let mounted = true;
    
    const loadInitialData = async () => {
      if (mounted) {
        await fetchContent();
      }
    };
    
    loadInitialData();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  // Filter content by selected type
  const filteredContent = content.filter(item => item.type === selectedType);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon icon="solar:loading-bold" className="size-8 animate-spin text-primary" />
        <span className="ml-4 text-lg">Loading banner management...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banner & Announcement Management</h1>
          <p className="text-muted-foreground">Manage banners and announcements shown across the platform</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Icon icon="solar:add-circle-bold" className="mr-2" />
              Create {selectedType === 'banner' ? 'Banner' : 'Announcement'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingContent ? 'Edit' : 'Create New'} {selectedType === 'banner' ? 'Banner' : 'Announcement'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: 'banner' | 'announcement') => {
                      setFormData({ ...formData, type: value });
                      setSelectedType(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <Select 
                    value={formData.metadata?.targetAudience || 'all'} 
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      metadata: { ...formData.metadata, targetAudience: value } 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="buyers">Buyers</SelectItem>
                      <SelectItem value="sellers">Sellers</SelectItem>
                      <SelectItem value="agents">Agents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter title"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Key</label>
                <Input
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="unique-key"
                  required
                  disabled={!!editingContent}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-generated from title. Must be unique.
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter content"
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Input
                    type="number"
                    value={formData.metadata?.priority || 1}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      metadata: { ...formData.metadata, priority: parseInt(e.target.value) || 1 } 
                    })}
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Display Order</label>
                  <Input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date (Optional)</label>
                  <Input
                    type="date"
                    value={formData.metadata?.startDate || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      metadata: { ...formData.metadata, startDate: e.target.value } 
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date (Optional)</label>
                  <Input
                    type="date"
                    value={formData.metadata?.endDate || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      metadata: { ...formData.metadata, endDate: e.target.value } 
                    })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingContent(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingContent ? 'Update' : 'Create'} {selectedType === 'banner' ? 'Banner' : 'Announcement'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content Type Selector */}
      <div className="flex items-center gap-2">
        <Button
          variant={selectedType === 'banner' ? 'default' : 'outline'}
          onClick={() => setSelectedType('banner')}
        >
          <Icon icon="solar:panorama-bold" className="mr-2" />
          Banners ({content.filter(item => item.type === 'banner').length})
        </Button>
        <Button
          variant={selectedType === 'announcement' ? 'default' : 'outline'}
          onClick={() => setSelectedType('announcement')}
        >
          <Icon icon="solar:megaphone-bold" className="mr-2" />
          Announcements ({content.filter(item => item.type === 'announcement').length})
        </Button>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {filteredContent.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Icon icon="solar:document-bold" className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No {selectedType}s Found</h3>
              <p className="text-muted-foreground">Create your first {selectedType} to get started.</p>
            </CardContent>
          </Card>
        ) : (
          filteredContent.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <Badge variant={item.type === 'banner' ? 'default' : 'secondary'}>
                      {item.type}
                    </Badge>
                    <Badge variant={item.metadata?.targetAudience === 'all' ? 'outline' : 'default'}>
                      {item.metadata?.targetAudience || 'all'}
                    </Badge>
                    <Badge variant={item.isActive ? 'default' : 'secondary'}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      <Icon icon="solar:pen-bold" className="size-4" />
                    </Button>
                    <Switch
                      checked={item.isActive}
                      onCheckedChange={() => handleToggleStatus(item.id)}
                    />
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(item.id)}
                    >
                      <Icon icon="solar:trash-bin-minimalistic-bold" className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">{item.content}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Key: {item.key}</span>
                  <span>Order: {item.displayOrder}</span>
                  <span>Priority: {item.metadata?.priority || 1}</span>
                  <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                  {item.metadata?.startDate && (
                    <span>Starts: {new Date(item.metadata.startDate).toLocaleDateString()}</span>
                  )}
                  {item.metadata?.endDate && (
                    <span>Ends: {new Date(item.metadata.endDate).toLocaleDateString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Icon icon="solar:panorama-bold" className="size-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {content.filter(item => item.type === 'banner').length}
                </div>
                <div className="text-sm text-muted-foreground">Total Banners</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Icon icon="solar:megaphone-bold" className="size-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {content.filter(item => item.type === 'announcement').length}
                </div>
                <div className="text-sm text-muted-foreground">Total Announcements</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Icon icon="solar:eye-bold" className="size-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {content.filter(item => item.isActive).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Items</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Icon icon="solar:refresh-bold" className="size-5 text-orange-600" />
              <div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchContent()} 
                  className="w-full"
                  disabled={isLoading}
                >
                  <Icon icon="solar:refresh-bold" className="mr-2" />
                  {isLoading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}