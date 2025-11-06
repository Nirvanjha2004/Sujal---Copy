import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Icon } from '@iconify/react';
import { contentService } from '../services/contentService';

interface CmsContent {
  id: number;
  type: 'banner' | 'announcement' | 'page' | 'widget';
  key: string;
  title: string;
  content: string;
  metadata?: any;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface ContentFilters {
  type?: string;
  isActive?: boolean;
  search?: string;
}

export function ContentManagementPage() {
  const [contents, setContents] = useState<CmsContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<ContentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContents();
  }, [currentPage, filters]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contentService.getContent({
        page: currentPage,
        limit: 20,
        ...filters
      });

      if (response.success && response.data) {
        setContents(response.data.data);
        setTotalPages(response.data.totalPages);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch contents');
      }
    } catch (err: any) {
      console.error('Error fetching contents:', err);
      setError(err.message || 'Failed to load contents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm });
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof ContentFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const updateContentStatus = async (contentId: number, isActive: boolean) => {
    try {
      const response = await contentService.updateContent(contentId, { isActive });
      if (response.success) {
        fetchContents();
      } else {
        alert(response.error?.message || 'Failed to update content');
      }
    } catch (err: any) {
      alert('Failed to update content');
    }
  };

  const deleteContent = async (contentId: number) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const response = await contentService.deleteContent(contentId);
      if (response.success) {
        fetchContents();
      } else {
        alert(response.error?.message || 'Failed to delete content');
      }
    } catch (err: any) {
      alert('Failed to delete content');
    }
  };

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      banner: 'bg-blue-100 text-blue-800',
      announcement: 'bg-green-100 text-green-800',
      page: 'bg-purple-100 text-purple-800',
      widget: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading && contents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h1>
        <p className="text-gray-600">Manage website content and announcements</p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or key..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleSearch} className="rounded-l-none">
                <Icon icon="solar:magnifer-bold" className="size-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="banner">Banner</option>
              <option value="announcement">Announcement</option>
              <option value="page">Page</option>
              <option value="widget">Widget</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.isActive !== undefined ? filters.isActive.toString() : ''}
              onChange={(e) => handleFilterChange('isActive', e.target.value ? e.target.value === 'true' : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Content Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contents.map((content) => (
                <tr key={content.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {content.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        Key: {content.key}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`${getTypeBadgeColor(content.type)} capitalize`}>
                      {content.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={content.isActive ? "default" : "secondary"}>
                      {content.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {content.displayOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(content.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateContentStatus(content.id, !content.isActive)}
                      >
                        {content.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteContent(content.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

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