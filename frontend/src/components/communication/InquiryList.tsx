import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { InquiryStatusBadge, InquiryStatus } from './InquiryStatusBadge';
import { api } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';

interface Inquiry {
  id: number;
  property_id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
  property?: {
    id: number;
    title: string;
    property_type: string;
    listing_type: string;
    price: number;
  };
}

interface InquiryListProps {
  userRole?: 'buyer' | 'owner' | 'agent' | 'builder' | 'admin';
  propertyId?: number;
  onInquiryClick?: (inquiry: Inquiry) => void;
}

export const InquiryList: React.FC<InquiryListProps> = ({
  userRole = 'buyer',
  propertyId,
  onInquiryClick,
}) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadInquiries = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      setLoading(true);
      const params: any = { page: pageNum, limit: 10 };
      if (propertyId) {
        params.property_id = propertyId;
      }

      const response = await api.communication.getInquiries(params);
      
      if (reset) {
        setInquiries(response.data);
      } else {
        setInquiries(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.data.length === 10);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries(1, true);
  }, [propertyId]);

  const handleStatusUpdate = async (inquiryId: number, newStatus: InquiryStatus) => {
    try {
      await api.communication.updateInquiryStatus(inquiryId, newStatus);
      setInquiries(prev =>
        prev.map(inquiry =>
          inquiry.id === inquiryId
            ? { ...inquiry, status: newStatus }
            : inquiry
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleLoadMore = () => {
    loadInquiries(page + 1, false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading && inquiries.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <div className="text-red-600 mb-2">Error loading inquiries</div>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => loadInquiries(1, true)} variant="outline">
          Try Again
        </Button>
      </Card>
    );
  }

  if (inquiries.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Inquiries</h3>
        <p className="text-gray-600">
          {userRole === 'buyer' 
            ? "You haven't made any inquiries yet."
            : "No inquiries have been received yet."
          }
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <Card key={inquiry.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900">{inquiry.name}</h4>
                <InquiryStatusBadge status={inquiry.status} />
              </div>
              <p className="text-sm text-gray-600">{inquiry.email}</p>
              {inquiry.phone && (
                <p className="text-sm text-gray-600">{inquiry.phone}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          {inquiry.property && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium text-gray-900">{inquiry.property.title}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {inquiry.property.property_type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {inquiry.property.listing_type}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {formatPrice(inquiry.property.price)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-gray-700 line-clamp-3">{inquiry.message}</p>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {(userRole === 'owner' || userRole === 'agent' || userRole === 'builder' || userRole === 'admin') && (
                <>
                  {inquiry.status === 'new' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(inquiry.id, 'contacted')}
                      className="text-xs"
                    >
                      Mark as Contacted
                    </Button>
                  )}
                  {inquiry.status === 'contacted' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(inquiry.id, 'closed')}
                      className="text-xs"
                    >
                      Close Inquiry
                    </Button>
                  )}
                </>
              )}
            </div>
            
            {onInquiryClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onInquiryClick(inquiry)}
                className="text-xs"
              >
                View Details
              </Button>
            )}
          </div>
        </Card>
      ))}

      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
};