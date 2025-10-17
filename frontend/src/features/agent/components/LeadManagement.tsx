import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle,
  Filter,
  Search,
  Eye
} from 'lucide-react';
import { leadService } from '../services/leadService';
import { Lead, LeadStats, LeadFilters } from '../types';

const LeadManagement = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [filters, setFilters] = useState<LeadFilters>({
    status: '',
    property_id: '',
    search: ''
  });
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const leadsData = await leadService.fetchLeads(filters);
      setLeads(leadsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await leadService.fetchLeadStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const updateLeadStatus = async (leadId: number, status: string) => {
    try {
      await leadService.updateLeadStatus(leadId, status);

      // Update local state
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: status as Lead['status'] } : lead
      ));
      
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, status: status as Lead['status'] });
      }

      fetchStats(); // Refresh stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const sendResponse = async () => {
    if (!selectedLead || !responseMessage.trim()) return;

    try {
      await leadService.sendResponse(selectedLead.id, responseMessage);

      setResponseMessage('');
      setShowResponse(false);
      
      // Update status to contacted if it was new
      if (selectedLead.status === 'new') {
        await updateLeadStatus(selectedLead.id, 'contacted');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send response');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="h-4 w-4" />;
      case 'contacted': return <MessageSquare className="h-4 w-4" />;
      case 'qualified': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      case 'spam': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'spam': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lead Management</h1>
        <Button onClick={fetchLeads}>Refresh</Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacted</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.contacted}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.qualified}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or message"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Leads ({leads.length})</CardTitle>
            <CardDescription>Click on a lead to view details and respond</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedLead?.id === lead.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{lead.name}</h3>
                        <Badge className={`${getStatusColor(lead.status)} text-xs`}>
                          {getStatusIcon(lead.status)}
                          <span className="ml-1">{lead.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{lead.email}</p>
                      {lead.phone && (
                        <p className="text-sm text-gray-600">{lead.phone}</p>
                      )}
                      {lead.property && (
                        <p className="text-sm font-medium mt-2">
                          {lead.property.title} - ${lead.property.price.toLocaleString()}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {lead.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLead(lead);
                        setShowResponse(true);
                      }}>
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {leads.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                  <p>No leads found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lead Details */}
        {selectedLead && (
          <Card>
            <CardHeader>
              <CardTitle>Lead Details</CardTitle>
              <CardDescription>
                Received on {new Date(selectedLead.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{selectedLead.email}</span>
                  </div>
                  {selectedLead.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{selectedLead.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedLead.property && (
                <div>
                  <h4 className="font-medium mb-2">Property of Interest</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium">{selectedLead.property.title}</h5>
                    <p className="text-sm text-gray-600">
                      ${selectedLead.property.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedLead.property.address}, {selectedLead.property.city}, {selectedLead.property.state}
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Eye className="h-3 w-3 mr-1" />
                      View Property
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Message</h4>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedLead.message}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <Select 
                  value={selectedLead.status} 
                  onValueChange={(value) => updateLeadStatus(selectedLead.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Quick Response</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResponse(!showResponse)}
                  >
                    {showResponse ? 'Cancel' : 'Respond'}
                  </Button>
                </div>
                
                {showResponse && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Type your response..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      rows={4}
                    />
                    <Button onClick={sendResponse} disabled={!responseMessage.trim()}>
                      Send Response
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LeadManagement;