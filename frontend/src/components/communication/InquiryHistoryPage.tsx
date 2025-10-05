import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Tabs } from '../ui/tabs';
import { InquiryList } from './InquiryList';
import { InquiryStatusBadge, InquiryStatus } from './InquiryStatusBadge';
import { api } from '../../lib/api';

interface InquiryStats {
  total: number;
  new: number;
  contacted: number;
  closed: number;
}

interface InquiryHistoryPageProps {
  userRole: 'buyer' | 'owner' | 'agent' | 'builder' | 'admin';
  userId?: number;
}

export const InquiryHistoryPage: React.FC<InquiryHistoryPageProps> = ({
  userRole,
}) => {
  const [stats, setStats] = useState<InquiryStats>({
    total: 0,
    new: 0,
    contacted: 0,
    closed: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      const response = await api.communication.getInquiryStats();
      setStats(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getFilteredInquiryProps = () => {
    const props: any = {
      userRole,
    };

    if (selectedStatus !== 'all') {
      props.status = selectedStatus;
    }

    if (selectedPropertyId) {
      props.propertyId = selectedPropertyId;
    }

    return props;
  };

  const handleInquiryClick = (inquiry: any) => {
    // Handle inquiry detail view
    console.log('View inquiry details:', inquiry);
  };

  const getTabTitle = (status: InquiryStatus | 'all', count?: number) => {
    const titles = {
      all: 'All Inquiries',
      new: 'New',
      contacted: 'Contacted',
      closed: 'Closed',
    };

    return count !== undefined ? `${titles[status]} (${count})` : titles[status];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {userRole === 'buyer' ? 'My Inquiries' : 'Inquiry Management'}
        </h1>
        <p className="text-gray-600 mt-1">
          {userRole === 'buyer' 
            ? 'Track your property inquiries and responses'
            : 'Manage inquiries received for your properties'
          }
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Inquiries</p>
              <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <InquiryStatusBadge status="new" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contacted</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <InquiryStatusBadge status="contacted" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Closed</p>
              <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <InquiryStatusBadge status="closed" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as InquiryStatus | 'all')}
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </Select>
            <Button variant="outline" onClick={() => {
              setSelectedStatus('all');
              setSearchTerm('');
              setSelectedPropertyId(null);
            }}>
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Inquiry Tabs */}
      <Card>
        <Tabs defaultValue="all" className="w-full">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedStatus === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {getTabTitle('all', stats.total)}
              </button>
              <button
                onClick={() => setSelectedStatus('new')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedStatus === 'new'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {getTabTitle('new', stats.new)}
              </button>
              <button
                onClick={() => setSelectedStatus('contacted')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedStatus === 'contacted'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {getTabTitle('contacted', stats.contacted)}
              </button>
              <button
                onClick={() => setSelectedStatus('closed')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedStatus === 'closed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {getTabTitle('closed', stats.closed)}
              </button>
            </nav>
          </div>

          <div className="p-6">
            <InquiryList
              {...getFilteredInquiryProps()}
              onInquiryClick={handleInquiryClick}
            />
          </div>
        </Tabs>
      </Card>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="text-red-800">{error}</div>
        </Card>
      )}
    </div>
  );
};