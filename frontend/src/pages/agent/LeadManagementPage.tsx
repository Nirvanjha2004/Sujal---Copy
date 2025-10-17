import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@iconify/react';
import { api } from '@/shared/lib/api';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface SiteVisit {
  id: number;
  property_id: number;
  visitor_id: number | null;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string | null;
  scheduled_at: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  agent_notes: string | null;
  created_at: string;
  updated_at: string;
  property?: {
    id: number;
    title: string;
    address: string;
    city: string;
    state: string;
  };
  visitor?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
}

interface SiteVisitStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  no_show: number;
  upcoming: number;
}

export function LeadManagementPage() {
  const [activeTab, setActiveTab] = useState<string>('scheduled');
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [stats, setStats] = useState<SiteVisitStats>({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0,
    upcoming: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selected visit for viewing/editing
  const [selectedVisit, setSelectedVisit] = useState<SiteVisit | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  
  // Edit form state
  const [editStatus, setEditStatus] = useState<string>('scheduled');
  const [editDate, setEditDate] = useState<string>('');
  const [editTime, setEditTime] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  
  // Fetch visits based on the active tab
  useEffect(() => {
    fetchSiteVisits();
    fetchSiteVisitStats();
  }, [activeTab]);
  
  const fetchSiteVisits = async () => {
    try {
      setLoading(true);
      const response = await api.getSiteVisits({ status: activeTab });
      setSiteVisits(response.data.visits);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch site visits', err);
      setError(err.message || 'Failed to load site visits');
      toast.error('Could not load site visits');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSiteVisitStats = async () => {
    try {
      const response = await api.getSiteVisitStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch site visit statistics', err);
    }
  };
  
  const handleEditVisit = (visit: SiteVisit) => {
    setSelectedVisit(visit);
    
    // Parse the scheduled date and time
    const scheduledDate = new Date(visit.scheduled_at);
    setEditDate(format(scheduledDate, 'yyyy-MM-dd'));
    setEditTime(format(scheduledDate, 'HH:mm'));
    setEditStatus(visit.status);
    setEditNotes(visit.agent_notes || '');
    
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateVisit = async () => {
    if (!selectedVisit) return;
    
    try {
      // Combine date and time
      const scheduledDateTime = `${editDate}T${editTime}:00`;

      await api.updateSiteVisit(selectedVisit.id, {
        status: editStatus as 'scheduled' | 'completed' | 'cancelled' | 'no_show',
        scheduled_at: scheduledDateTime,
        agent_notes: editNotes
      });
      
      toast.success('Site visit updated successfully');
      setIsEditDialogOpen(false);
      
      // Refresh the data
      fetchSiteVisits();
      fetchSiteVisitStats();
    } catch (err) {
      console.error('Failed to update site visit', err);
      toast.error('Could not update site visit');
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">
              Lead Management
            </h1>
            <p className="text-muted-foreground">
              Manage your site visit requests and leads
            </p>
          </div>
          <Button onClick={fetchSiteVisits}>
            <Icon icon="solar:refresh-bold" className="size-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Total Leads</span>
                <span className="text-3xl font-bold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Upcoming Visits</span>
                <span className="text-3xl font-bold text-blue-600">{stats.upcoming}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Scheduled</span>
                <span className="text-3xl font-bold text-blue-600">{stats.scheduled}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="text-3xl font-bold text-green-600">{stats.completed}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Cancelled</span>
                <span className="text-3xl font-bold text-red-600">{stats.cancelled}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">No Shows</span>
                <span className="text-3xl font-bold text-yellow-600">{stats.no_show}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Site Visits Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="no_show">No Shows</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scheduled" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Site Visits</CardTitle>
              </CardHeader>
              <CardContent>
                {renderVisitsTable()}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Completed Site Visits</CardTitle>
              </CardHeader>
              <CardContent>
                {renderVisitsTable()}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cancelled" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Cancelled Site Visits</CardTitle>
              </CardHeader>
              <CardContent>
                {renderVisitsTable()}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="no_show" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>No Show Site Visits</CardTitle>
              </CardHeader>
              <CardContent>
                {renderVisitsTable()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Update Site Visit</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input 
                    type="date" 
                    value={editDate} 
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input 
                    type="time" 
                    value={editTime} 
                    onChange={(e) => setEditTime(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Agent Notes</label>
                <Textarea
                  placeholder="Add your notes about this site visit"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateVisit}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
  
  function renderVisitsTable() {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-32">
          <Icon icon="solar:refresh-bold" className="size-6 mr-2 animate-spin" />
          <span>Loading site visits...</span>
        </div>
      );
    }
    
    if (error) {
      return (
        <Alert variant="destructive">
          <Icon icon="solar:danger-circle-bold" className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    
    if (siteVisits.length === 0) {
      return (
        <div className="text-center py-8">
          <Icon icon="solar:calendar-bold" className="size-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No site visits found</h3>
          <p className="text-muted-foreground">
            {activeTab === 'scheduled' 
              ? "You don't have any scheduled site visits." 
              : `No ${activeTab} site visits to display.`}
          </p>
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Visitor</TableHead>
            <TableHead>Scheduled For</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {siteVisits.map((visit) => (
            <TableRow key={visit.id}>
              <TableCell>
                <div className="font-medium">{visit.property?.title}</div>
                <div className="text-xs text-muted-foreground">{visit.property?.address}, {visit.property?.city}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{visit.visitor_name}</div>
                <div className="text-xs text-muted-foreground">{visit.visitor_email}</div>
                {visit.visitor_phone && (
                  <div className="text-xs">{visit.visitor_phone}</div>
                )}
              </TableCell>
              <TableCell>
                {format(new Date(visit.scheduled_at), 'MMM d, yyyy')}
                <div className="text-xs">
                  {format(new Date(visit.scheduled_at), 'h:mm a')}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(visit.status)}>
                  {visit.status.charAt(0).toUpperCase() + visit.status.slice(1).replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(visit.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEditVisit(visit)}
                >
                  <Icon icon="solar:pen-bold" className="size-4 mr-1" />
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}

export default LeadManagementPage;