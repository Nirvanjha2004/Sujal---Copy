import React, { useState, useEffect } from 'react';

interface Review {
  id: number;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  reportCount: number;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  property?: {
    id: number;
    title: string;
  };
}

interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  flagged: number;
  averageRating: number;
}

interface ReviewFilters {
  status?: string;
  rating?: number;
  search?: string;
  sortBy?: string;
}

const ReviewModeration: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  
  // Filters
  const [filters, setFilters] = useState<ReviewFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Bulk action
  const [bulkAction, setBulkAction] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [currentPage, filters]);

  const loadReviews = async () => {
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
      
      const response = await fetch(`/api/admin/reviews?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/reviews/stats', {
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

  const moderateReview = async (reviewId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        loadReviews();
        loadStats();
      }
    } catch (error) {
      console.error('Error moderating review:', error);
    }
  };

  const flagReview = async (reviewId: number) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/flag`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        loadReviews();
        loadStats();
      }
    } catch (error) {
      console.error('Error flagging review:', error);
    }
  };

  const deleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        loadReviews();
        loadStats();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedReviews.length === 0) return;
    
    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/reviews/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          reviewIds: selectedReviews, 
          action: bulkAction 
        })
      });

      if (response.ok) {
        setSelectedReviews([]);
        setBulkAction('');
        loadReviews();
        loadStats();
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'flagged': return 'text-orange-600 bg-orange-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Moderation</h1>
          <p className="text-gray-600 mt-2">Manage and moderate user reviews</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <span>🔍</span>
          <span>Filters</span>
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-gray-600">Total Reviews</div>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-gray-600">Approved</div>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-gray-600">Rejected</div>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-2xl font-bold text-orange-600">{stats.flagged}</div>
            <div className="text-gray-600">Flagged</div>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{stats.averageRating.toFixed(1)}</div>
            <div className="text-gray-600">Avg Rating</div>
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
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <select
                value={filters.rating || ''}
                onChange={(e) => setFilters({ ...filters, rating: Number(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search reviews..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy || 'newest'}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating-high">Highest Rating</option>
                <option value="rating-low">Lowest Rating</option>
                <option value="most-reported">Most Reported</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              {selectedReviews.length} review(s) selected
            </span>
            <div className="flex items-center space-x-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border border-blue-300 rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Action</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="flag">Flag</option>
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

      {/* Reviews List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">No reviews found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedReviews.length === reviews.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReviews(reviews.map(r => r.id));
                        } else {
                          setSelectedReviews([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReviews([...selectedReviews, review.id]);
                          } else {
                            setSelectedReviews(selectedReviews.filter(id => id !== review.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">({review.rating}/5)</span>
                        </div>
                        <div className="text-gray-900 max-w-md">
                          {review.comment ? (
                            <p className="line-clamp-3">{review.comment}</p>
                          ) : (
                            <span className="text-gray-500 italic">No comment</span>
                          )}
                        </div>
                        {review.property && (
                          <div className="text-sm text-gray-500">
                            Property: {review.property.title}
                          </div>
                        )}
                        {review.reportCount > 0 && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <span>🚩</span>
                            <span className="text-sm">{review.reportCount} report(s)</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {review.user.firstName} {review.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{review.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(review.status)}`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {review.status === 'pending' && (
                          <>
                            <button
                              onClick={() => moderateReview(review.id, 'approve')}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                              title="Approve"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => moderateReview(review.id, 'reject')}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Reject"
                            >
                              ✕
                            </button>
                          </>
                        )}
                        {review.status !== 'flagged' && (
                          <button
                            onClick={() => flagReview(review.id)}
                            className="p-1 text-orange-600 hover:bg-orange-100 rounded"
                            title="Flag"
                          >
                            🚩
                          </button>
                        )}
                        <button
                          onClick={() => deleteReview(review.id)}
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

export default ReviewModeration;