import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Icon } from '@iconify/react';
import { httpClient } from '@/lib/httpClient';
import { Layout } from '@/components/layout/Layout';
import { AdminLayout } from '../layout/AdminLayout';

interface SeoSetting {
  id: number;
  entityType: 'property' | 'page' | 'global';
  entityId?: number;
  pageType?: string;
  title: string;
  description: string;
  keywords: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  metaRobots?: string;
  schemaMarkup?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SeoFilters {
  entityType?: string;
  isActive?: boolean;
  search?: string;
}

export function SeoManagement() {
  const [settings, setSettings] = useState<SeoSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<SeoFilters>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SeoSetting | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    entityType: 'global' as 'property' | 'page' | 'global',
    entityId: '',
    pageType: '',
    title: '',
    description: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    canonicalUrl: '',
    metaRobots: 'index,follow',
    schemaMarkup: '{}',
    isActive: true,
  });

  useEffect(() => {
    fetchSettings();
  }, [currentPage, filters]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        ),
      });

      const response = await httpClient.get<{
        success: boolean;
        data: { settings: SeoSetting[]; total: number; totalPages: number };
      }>(`/admin/seo/settings?${params}`);

      setSettings(response.data.settings);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load SEO settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        entityId: formData.entityId ? parseInt(formData.entityId) : undefined,
        schemaMarkup: formData.schemaMarkup ? JSON.parse(formData.schemaMarkup) : undefined,
      };

      console.log('Submitting SEO data:', submitData);

      if (editingSetting) {
        // Fix: Include the ID in the URL for updates
        await httpClient.put(`/admin/seo/settings/${editingSetting.id}`, submitData);
        setSuccess('SEO settings updated successfully');
      } else {
        await httpClient.post('/admin/seo/settings', submitData);
        setSuccess('SEO settings created successfully');
      }

      await fetchSettings();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save SEO settings');
    }
  };

  const handleEdit = (setting: SeoSetting) => {
    setEditingSetting(setting);
    setFormData({
      entityType: setting.entityType,
      entityId: setting.entityId?.toString() || '',
      pageType: setting.pageType || '',
      title: setting.title,
      description: setting.description,
      keywords: setting.keywords,
      ogTitle: setting.ogTitle || '',
      ogDescription: setting.ogDescription || '',
      ogImage: setting.ogImage || '',
      canonicalUrl: setting.canonicalUrl || '',
      metaRobots: setting.metaRobots || 'index,follow',
      schemaMarkup: setting.schemaMarkup ? JSON.stringify(setting.schemaMarkup, null, 2) : '{}',
      isActive: setting.isActive,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this SEO setting?')) return;

    try {
      await httpClient.delete(`/admin/seo/settings/${id}`);
      await fetchSettings();
      setSuccess('SEO setting deleted successfully');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete SEO setting');
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      await httpClient.put(`/admin/seo/settings/${id}/status`, { isActive: !isActive });
      await fetchSettings();
      setSuccess(`SEO setting ${!isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update SEO setting status');
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingSetting(null);
    setFormData({
      entityType: 'global',
      entityId: '',
      pageType: '',
      title: '',
      description: '',
      keywords: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      canonicalUrl: '',
      metaRobots: 'index,follow',
      schemaMarkup: '{}',
      isActive: true,
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SEO Management</h1>
            <p className="text-gray-600">Manage meta tags, titles, and SEO settings</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Icon icon="solar:add-circle-bold" className="size-4 mr-2" />
            Add SEO Setting
          </Button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <Icon icon="solar:check-circle-bold" className="size-4" />
            <span>{success}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSuccess(null)}
              className="ml-auto"
            >
              <Icon icon="solar:close-circle-bold" className="size-4" />
            </Button>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 text-red-800 border-red-200">
            <Icon icon="solar:danger-circle-bold" className="size-4" />
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto"
            >
              <Icon icon="solar:close-circle-bold" className="size-4" />
            </Button>
          </Alert>
        )}

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="entityType">Entity Type</Label>
              <select
                id="entityType"
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={filters.entityType || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value || undefined }))}
              >
                <option value="">All Types</option>
                <option value="global">Global</option>
                <option value="page">Page</option>
                <option value="property">Property</option>
              </select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={filters.isActive !== undefined ? filters.isActive.toString() : ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  isActive: e.target.value ? e.target.value === 'true' : undefined 
                }))}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by title or keywords..."
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value || undefined }))}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({});
                  setCurrentPage(1);
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* SEO Settings List */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {settings.map((setting) => (
                  <tr key={setting.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{setting.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {setting.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={setting.entityType === 'global' ? 'default' : 'secondary'}>
                        {setting.entityType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {setting.entityType === 'property' && setting.entityId && `Property #${setting.entityId}`}
                      {setting.entityType === 'page' && setting.pageType && setting.pageType}
                      {setting.entityType === 'global' && 'Global Settings'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={setting.isActive ? 'default' : 'secondary'}>
                        {setting.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(setting.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(setting)}
                      >
                        <Icon icon="solar:pen-bold" className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(setting.id, setting.isActive)}
                      >
                        <Icon 
                          icon={setting.isActive ? "solar:eye-closed-bold" : "solar:eye-bold"} 
                          className="size-4" 
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(setting.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Icon icon="solar:trash-bin-trash-bold" className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <span className="flex items-center px-3">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {editingSetting ? 'Edit SEO Setting' : 'Create SEO Setting'}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                    <Icon icon="solar:close-circle-bold" className="size-5" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="entityType">Entity Type *</Label>
                      <select
                        id="entityType"
                        name="entityType"
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        value={formData.entityType}
                        onChange={handleInputChange}
                      >
                        <option value="global">Global</option>
                        <option value="page">Page</option>
                        <option value="property">Property</option>
                      </select>
                    </div>

                    {formData.entityType === 'property' && (
                      <div>
                        <Label htmlFor="entityId">Property ID</Label>
                        <Input
                          id="entityId"
                          name="entityId"
                          type="number"
                          placeholder="Leave empty for all properties"
                          value={formData.entityId}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}

                    {formData.entityType === 'page' && (
                      <div>
                        <Label htmlFor="pageType">Page Type *</Label>
                        <Input
                          id="pageType"
                          name="pageType"
                          required
                          placeholder="e.g. home, about, contact"
                          value={formData.pageType}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="title">Meta Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      required
                      maxLength={60}
                      placeholder="SEO optimized title (60 chars max)"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.title.length}/60 characters
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Meta Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      required
                      maxLength={160}
                      rows={3}
                      placeholder="SEO description (160 chars max)"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.description.length}/160 characters
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      name="keywords"
                      placeholder="keyword1, keyword2, keyword3"
                      value={formData.keywords}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ogTitle">Open Graph Title</Label>
                      <Input
                        id="ogTitle"
                        name="ogTitle"
                        placeholder="Social media title"
                        value={formData.ogTitle}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="ogImage">Open Graph Image URL</Label>
                      <Input
                        id="ogImage"
                        name="ogImage"
                        placeholder="/path/to/image.jpg"
                        value={formData.ogImage}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ogDescription">Open Graph Description</Label>
                    <Textarea
                      id="ogDescription"
                      name="ogDescription"
                      rows={2}
                      placeholder="Social media description"
                      value={formData.ogDescription}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="canonicalUrl">Canonical URL</Label>
                      <Input
                        id="canonicalUrl"
                        name="canonicalUrl"
                        placeholder="/canonical-path"
                        value={formData.canonicalUrl}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="metaRobots">Meta Robots</Label>
                      <select
                        id="metaRobots"
                        name="metaRobots"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        value={formData.metaRobots}
                        onChange={handleInputChange}
                      >
                        <option value="index,follow">Index, Follow</option>
                        <option value="noindex,follow">No Index, Follow</option>
                        <option value="index,nofollow">Index, No Follow</option>
                        <option value="noindex,nofollow">No Index, No Follow</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="schemaMarkup">Schema Markup (JSON)</Label>
                    <Textarea
                      id="schemaMarkup"
                      name="schemaMarkup"
                      rows={6}
                      placeholder='{"@type": "Product", ...}'
                      value={formData.schemaMarkup}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingSetting ? 'Update SEO Setting' : 'Create SEO Setting'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCloseModal}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}