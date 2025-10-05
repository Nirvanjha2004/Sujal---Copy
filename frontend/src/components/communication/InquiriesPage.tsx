import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Textarea } from '@/components/ui/textarea';
import { Layout } from '@/components/layout/Layout';
import { api } from '@/lib/api';

interface Inquiry {
  id: number;
  property_id: number;
  user_id: number;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
  updated_at: string;
  property: {
    id: number;
    title: string;
    price: number;
    images: Array<{ image_url: string }>;
  };
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  responses?: Array<{
    id: number;
    message: string;
    created_at: string;
    user: {
      first_name: string;
      last_name: string;
    };
  }>;
}

interface InquiryFilters {
  status: string;
  search: string;
  dateRange: string;
}

export function InquiriesPage() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const [filters, setFilters] = useState<InquiryFilters>({
    status: 'all',
    search: '',
    dateRange: 'all'
  });

  useEffect(() => {
    loadInquiries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inquiries, filters]);

  const loadInquiries = async () => {
    try {
      setIsLoading(true);
      const response = await api.getInquiries();
      setInquiries(response.data || []);
    } catch (error) {
      console.error('Failed to load inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...inquiries];

    if (filters.search) {
      filtered = filtered.filter(inquiry =>
        inquiry.property.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        inquiry.user.first_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        inquiry.user.last_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.status === filters.status);
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(inquiry => 
        new Date(inquiry.created_at) >= filterDate
      );
    }

    setFilteredInquiries(filtered);
  };

  const handleFilterChange = (key: keyof InquiryFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRespondToInquiry = async (inquiryId: number) => {
    if (!responseMessage.trim()) return;

    try {
      setIsResponding(true);
      await api.respondToInquiry(inquiryId, responseMessage);
      
      // Update the inquiry status and reload
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === inquiryId 
          ? { ...inquiry, status: 'responded' as const }
          : inquiry
      ));
      
      setResponseMessage('');
      setSelectedInquiry(null);
    } catch (error) {
      console.error('Failed to respond to inquiry:', error);
    } finally {
      setIsResponding(false);
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId: number, status: 'pending' | 'responded' | 'closed') => {
    try {
      await api.updateInquiryStatus(inquiryId, status);
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === inquiryId 
          ? { ...inquiry, status }
          : inquiry
      ));
    } catch (error) {
      console.error('Failed to update inquiry status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'responded': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Icon icon="solar:loading-bold" className="size-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading inquiries...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Property Inquiries</h1>
            <p className="text-muted-foreground">
              Manage inquiries from potential buyers and renters
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/my-properties')}>
              <Icon icon="solar:home-bold" className="size-4 mr-2" />
              My Properties
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search inquiries..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({ status: 'all', search: '', dateRange: 'all' })}
                  className="w-full"
                >
                  <Icon icon="solar:refresh-bold" className="size-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inquiries List */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredInquiries.length} of {inquiries.length} inquiries
          </div>
        </div>

        {filteredInquiries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Icon icon="solar:chat-round-bold" className="size-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Inquiries Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {inquiries.length === 0 
                  ? "You haven't received any inquiries yet."
                  : "No inquiries match your current filters."
                }
              </p>
              <Button onClick={() => navigate('/my-properties')}>
                <Icon icon="solar:home-bold" className="size-4 mr-2" />
                View My Properties
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInquiries.map((inquiry) => (
              <Card key={inquiry.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <img
                      src={inquiry.property.images?.[0]?.image_url || "https://via.placeholder.com/120x80"}
                      alt={inquiry.property.title}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{inquiry.property.title}</h3>
                          <p className="text-primary font-semibold">{formatPrice(inquiry.property.price)}</p>
                        </div>
                        <Badge className={getStatusColor(inquiry.status)}>
                          {inquiry.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon icon="solar:user-bold" className="size-4" />
                            {inquiry.user.first_name} {inquiry.user.last_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon icon="solar:letter-bold" className="size-4" />
                            {inquiry.user.email}
                          </span>
                          {inquiry.user.phone && (
                            <span className="flex items-center gap-1">
                              <Icon icon="solar:phone-bold" className="size-4" />
                              {inquiry.user.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Icon icon="solar:calendar-bold" className="size-4" />
                            {formatDate(inquiry.created_at)}
                          </span>
                        </div>
                        
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm">{inquiry.message}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {inquiry.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedInquiry(inquiry)}
                          >
                            <Icon icon="solar:chat-round-bold" className="size-4 mr-2" />
                            Respond
                          </Button>
                        )}
                        
                        <Select
                          value={inquiry.status}
                          onValueChange={(value) => handleUpdateInquiryStatus(inquiry.id, value as any)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="responded">Responded</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/property/${inquiry.property.id}`)}
                        >
                          <Icon icon="solar:eye-bold" className="size-4 mr-2" />
                          View Property
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Response Modal */}
        {selectedInquiry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Respond to Inquiry</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Property: {selectedInquiry.property.title}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Original Message:</p>
                  <p className="text-sm">{selectedInquiry.message}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Response</label>
                  <Textarea
                    placeholder="Type your response here..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedInquiry(null);
                      setResponseMessage('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleRespondToInquiry(selectedInquiry.id)}
                    disabled={!responseMessage.trim() || isResponding}
                  >
                    {isResponding ? (
                      <>
                        <Icon icon="solar:loading-bold" className="size-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:paper-plane-bold" className="size-4 mr-2" />
                        Send Response
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}