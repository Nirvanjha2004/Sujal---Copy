import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Icon } from '@iconify/react';
import { contentService } from '../services/contentService';
import type { ReviewModerationData } from '../types/moderation';

interface ReviewFilters {
  status?: 'pending' | 'approved' | 'rejected';
  rating?: number;
  search?: string;
}

export function ReviewModerationPage() {
  const [reviews, setReviews] = useState<ReviewModerationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<ReviewFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [currentPage, filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contentService.getReviews({
        page: currentPage,
        limit: 20,
        ...filters
      });

      console.log("The response is", response)

      if (response.success && response.data) {
        setReviews(response.data.data);
        setTotalPages(response.data.totalPages);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch reviews');
      }
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm });
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof ReviewFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const updateReviewStatus = async (reviewId: number, action: 'approve' | 'reject', reason?: string) => {
    try {
      const response = await contentService.moderateReview(reviewId, action, reason);
      if (response.success) {
        fetchReviews();
      } else {
        alert(response.error?.message || 'Failed to update review');
      }
    } catch (err: any) {
      alert('Failed to update review');
    }
  };

  const deleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await contentService.deleteReview(reviewId);
      if (response.success) {
        fetchReviews();
      } else {
        alert(response.error?.message || 'Failed to delete review');
      }
    } catch (err: any) {
      alert('Failed to delete review');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        icon={i < rating ? "solar:star-bold" : "solar:star-outline-bold"}
        className={`size-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Moderation</h1>
        <p className="text-gray-600">Moderate user reviews and feedback</p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reviews..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleSearch} className="rounded-l-none">
                <Icon icon="solar:magnifer-bold" className="size-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Review Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Reviews</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <select
              value={filters.rating || ''}
              onChange={(e) => handleFilterChange('rating', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating Filter</label>
            <select
              value={filters.rating?.toString() || ''}
              onChange={(e) => handleFilterChange('rating', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                  <Badge variant={review.status === 'approved' ? "default" : review.status === 'rejected' ? "destructive" : "secondary"}>
                    {review.status === 'approved' ? 'Approved' : review.status === 'rejected' ? 'Rejected' : 'Pending'}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold mb-2">Review for {review.propertyTitle}</h3>
                <p className="text-gray-700 mb-4">{review.reviewText}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <strong>Property:</strong> {review.propertyTitle || 'N/A'}
                  </div>
                  <div>
                    <strong>Reviewer:</strong> {review.reviewerName || 'N/A'}
                    {review.reviewerEmail && (
                      <span className="text-gray-500"> • {review.reviewerEmail}</span>
                    )}
                  </div>
                  <div>
                    <strong>Submitted:</strong> {new Date(review.submittedAt).toLocaleDateString()}
                  </div>
                  {review.moderatedAt && (
                    <div>
                      <strong>Moderated:</strong> {new Date(review.moderatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                {review.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => updateReviewStatus(review.id, 'approve')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Icon icon="solar:check-circle-bold" className="mr-2 size-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateReviewStatus(review.id, 'reject')}
                    >
                      <Icon icon="solar:close-circle-bold" className="mr-2 size-4" />
                      Reject
                    </Button>
                  </>
                )}
                
                {review.status === 'approved' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateReviewStatus(review.id, 'reject')}
                  >
                    <Icon icon="solar:close-circle-bold" className="mr-2 size-4" />
                    Reject
                  </Button>
                )}

                {review.status === 'rejected' && (
                  <Button
                    size="sm"
                    onClick={() => updateReviewStatus(review.id, 'approve')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Icon icon="solar:check-circle-bold" className="mr-2 size-4" />
                    Approve
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteReview(review.id)}
                >
                  <Icon icon="solar:trash-bin-trash-bold" className="mr-2 size-4" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4">
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
        </Card>
      )}

      {reviews.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <Icon icon="solar:star-bold" className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
          <p className="text-muted-foreground">
            No reviews match your current filters.
          </p>
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