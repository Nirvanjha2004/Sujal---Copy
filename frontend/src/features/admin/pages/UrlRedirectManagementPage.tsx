import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Icon } from '@iconify/react';
import { contentService } from '../services/contentService';

interface UrlRedirect {
  id: number;
  sourceUrl: string;
  targetUrl: string;
  redirectType: 301 | 302;
  isActive: boolean;
  hitCount: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lastHit?: string;
}

interface RedirectFilters {
  redirectType?: number;
  isActive?: boolean;
  search?: string;
}

export function UrlRedirectManagementPage() {
  const [redirects, setRedirects] = useState<UrlRedirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<RedirectFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRedirects();
  }, [currentPage, filters]);

  const fetchRedirects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contentService.getRedirects();
      console.log("The response in URLRedirectManagementPage is", response)
      if (response.success && response.data) {
        setRedirects(response.data.data || []);
        setTotalPages(response.data.totalPages || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch redirects');
      }
    } catch (err: any) {
      console.error('Error fetching redirects:', err);
      setError(err.message || 'Failed to load redirects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm });
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof RedirectFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const updateRedirectStatus = async (redirectId: number, isActive: boolean) => {
    try {
      const response = await contentService.updateUrlRedirect(redirectId, { isActive });
      if (response.success) {
        fetchRedirects();
      } else {
        alert(response.message || 'Failed to update redirect');
      }
    } catch (err: any) {
      alert('Failed to update redirect');
    }
  };

  const deleteRedirect = async (redirectId: number) => {
    if (!confirm('Are you sure you want to delete this redirect?')) return;

    try {
      const response = await contentService.deleteUrlRedirect(redirectId);
      if (response.success) {
        fetchRedirects();
      } else {
        alert(response.message || 'Failed to delete redirect');
      }
    } catch (err: any) {
      alert('Failed to delete redirect');
    }
  };

  const getRedirectTypeBadgeColor = (type: number) => {
    return type === 301 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  if (loading && redirects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading redirects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">URL Redirect Management</h1>
          <p className="text-gray-600">Manage URL redirects and track their usage</p>
        </div>
        <Button>
          <Icon icon="solar:add-circle-bold" className="mr-2 size-4" />
          Add Redirect
        </Button>
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
                placeholder="Search by source or target URL..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleSearch} className="rounded-l-none">
                <Icon icon="solar:magnifer-bold" className="size-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Redirect Type</label>
            <select
              value={filters.redirectType || ''}
              onChange={(e) => handleFilterChange('redirectType', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="301">301 (Permanent)</option>
              <option value="302">302 (Temporary)</option>
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

      {/* Redirects Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Hit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {redirects.map((redirect) => (
                <tr key={redirect.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {redirect.sourceUrl}
                      </div>
                      {redirect.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {redirect.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-xs">
                      {redirect.targetUrl}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getRedirectTypeBadgeColor(redirect.redirectType)}>
                      {redirect.redirectType} {redirect.redirectType === 301 ? '(Permanent)' : '(Temporary)'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={redirect.isActive ? "default" : "secondary"}>
                      {redirect.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {redirect.hitCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {redirect.lastHit 
                      ? new Date(redirect.lastHit).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRedirectStatus(redirect.id, !redirect.isActive)}
                      >
                        {redirect.isActive ? 'Deactivate' : 'Activate'}
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
                        onClick={() => deleteRedirect(redirect.id)}
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

      {redirects.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <Icon icon="solar:link-bold" className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No redirects found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first URL redirect to manage site navigation.
          </p>
          <Button>
            <Icon icon="solar:add-circle-bold" className="mr-2 size-4" />
            Add Redirect
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