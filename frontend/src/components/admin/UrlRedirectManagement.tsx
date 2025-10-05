import React, { useState, useEffect } from 'react';

interface UrlRedirect {
  id: number;
  fromPath: string;
  toPath: string;
  statusCode: number;
  isActive: boolean;
  description?: string;
  hitCount: number;
  lastUsed?: string;
  createdAt: string;
  creator: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

interface RedirectStats {
  total: number;
  active: number;
  inactive: number;
  totalHits: number;
  statusCodeBreakdown: Record<number, number>;
}

interface RedirectFilters {
  isActive?: boolean;
  statusCode?: number;
  search?: string;
}

const UrlRedirectManagement: React.FC = () => {
  const [redirects, setRedirects] = useState<UrlRedirect[]>([]);
  const [stats, setStats] = useState<RedirectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRedirects, setSelectedRedirects] = useState<number[]>([]);
  
  // Filters
  const [filters, setFilters] = useState<RedirectFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Form for creating/editing redirects
  const [showForm, setShowForm] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<UrlRedirect | null>(null);
  const [formData, setFormData] = useState({
    fromPath: '',
    toPath: '',
    statusCode: 301,
    description: '',
    isActive: true
  });
  
  // Bulk action
  const [bulkAction, setBulkAction] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadRedirects();
    loadStats();
  }, [currentPage, filters]);

  const loadRedirects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '20');
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/admin/redirects?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRedirects(data.redirects);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error loading redirects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/redirects/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setActionLoading(true);
      const url = editingRedirect ? `/api/admin/redirects/${editingRedirect.id}` : '/api/admin/redirects';
      const method = editingRedirect ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingRedirect(null);
        setFormData({
          fromPath: '',
          toPath: '',
          statusCode: 301,
          description: '',
          isActive: true
        });
        loadRedirects();
        loadStats();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error saving redirect');
      }
    } catch (error) {
      console.error('Error saving redirect:', error);
      alert('Error saving redirect');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteRedirect = async (id: number) => {
    if (!confirm('Are you sure you want to delete this redirect?')) return;
    
    try {
      const response = await fetch(`/api/admin/redirects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        loadRedirects();
        loadStats();
      }
    } catch (error) {
      console.error('Error deleting redirect:', error);
    }
  };

  const toggleRedirectStatus = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/redirects/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        loadRedirects();
        loadStats();
      }
    } catch (error) {
      console.error('Error toggling redirect status:', error);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedRedirects.length === 0) return;
    
    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/redirects/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          redirectIds: selectedRedirects, 
          action: bulkAction 
        })
      });

      if (response.ok) {
        setSelectedRedirects([]);
        setBulkAction('');
        loadRedirects();
        loadStats();
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const editRedirect = (redirect: UrlRedirect) => {
    setEditingRedirect(redirect);
    setFormData({
      fromPath: redirect.fromPath,
      toPath: redirect.toPath,
      statusCode: redirect.statusCode,
      description: redirect.description || '',
      isActive: redirect.isActive
    });
    setShowForm(true);
  };

  const getStatusCodeColor = (code: number) => {
    if (code >= 300 && code < 400) return 'text-blue-600 bg-blue-100';
    if (code >= 400 && code < 500) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">URL Redirect Management</h1>
          <p className="text-gray-600 mt-2">Manage URL redirects for SEO and navigation</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <span>🔍</span>
            <span>Filters</span>
          </button>
          <button
            onClick={() => {
              setEditingRedirect(null);
              setFormData({
                fromPath: '',
                toPath: '',
                statusCode: 301,
                description: '',
                isActive: true
              });
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Redirect
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-gray-600">Total Redirects</div>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-gray-600">Active</div>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            <div className="text-gray-600">Inactive</div>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{stats.totalHits.toLocaleString()}</div>
            <div className="text-gray-600">Total Hits</div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.isActive !== undefined ? filters.isActive.toString() : ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  isActive: e.target.value === '' ? undefined : e.target.value === 'true'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Code</label>
              <select
                value={filters.statusCode || ''}
                onChange={(e) => setFilters({ ...filters, statusCode: Number(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Codes</option>
                <option value="301">301 - Permanent</option>
                <option value="302">302 - Temporary</option>
                <option value="307">307 - Temporary</option>
                <option value="308">308 - Permanent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search paths..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedRedirects.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              {selectedRedirects.length} redirect(s) selected
            </span>
            <div className="flex items-center space-x-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border border-blue-300 rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Action</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="delete">Delete</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || actionLoading}
                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">
            {editingRedirect ? 'Edit Redirect' : 'Create New Redirect'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Path *</label>
                <input
                  type="text"
                  value={formData.fromPath}
                  onChange={(e) => setFormData({ ...formData, fromPath: e.target.value })}
                  placeholder="/old-path"
                  required
                  disabled={!!editingRedirect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Path *</label>
                <input
                  type="text"
                  value={formData.toPath}
                  onChange={(e) => setFormData({ ...formData, toPath: e.target.value })}
                  placeholder="/new-path or https://example.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Code</label>
                <select
                  value={formData.statusCode}
                  onChange={(e) => setFormData({ ...formData, statusCode: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={301}>301 - Moved Permanently</option>
                  <option value={302}>302 - Found (Temporary)</option>
                  <option value={307}>307 - Temporary Redirect</option>
                  <option value={308}>308 - Permanent Redirect</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.isActive.toString()}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description for this redirect"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : editingRedirect ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Redirects List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : redirects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">No redirects found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRedirects.length === redirects.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRedirects(redirects.map(r => r.id));
                        } else {
                          setSelectedRedirects([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paths
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {redirects.map((redirect) => (
                  <tr key={redirect.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRedirects.includes(redirect.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRedirects([...selectedRedirects, redirect.id]);
                          } else {
                            setSelectedRedirects(selectedRedirects.filter(id => id !== redirect.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">
                          {redirect.fromPath}
                        </div>
                        <div className="text-sm text-blue-600">
                          → {redirect.toPath}
                        </div>
                        {redirect.description && (
                          <div className="text-xs text-gray-500">
                            {redirect.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          Created: {new Date(redirect.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusCodeColor(redirect.statusCode)}`}>
                        {redirect.statusCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        redirect.isActive 
                          ? 'text-green-600 bg-green-100' 
                          : 'text-gray-600 bg-gray-100'
                      }`}>
                        {redirect.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {redirect.hitCount} hits
                        </div>
                        {redirect.lastUsed && (
                          <div className="text-xs text-gray-500">
                            Last: {new Date(redirect.lastUsed).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => editRedirect(redirect)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => toggleRedirectStatus(redirect.id)}
                          className={`p-1 rounded ${
                            redirect.isActive 
                              ? 'text-gray-600 hover:bg-gray-100' 
                              : 'text-green-600 hover:bg-green-100'
                          }`}
                          title={redirect.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {redirect.isActive ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => deleteRedirect(redirect.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlRedirectManagement;