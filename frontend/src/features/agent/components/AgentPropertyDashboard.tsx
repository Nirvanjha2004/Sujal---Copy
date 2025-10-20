import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Layout } from '../../../components/layout/Layout';
import { BulkUploadPage } from '../../../pages/agent/BulkUploadPage';
import { PropertyImageUpload } from '@/features/property/components/common/PropertyImageUpload';
import { PerformanceAnalytics, LeadManagement } from './';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AgentStatsCard from './AgentStatsCard';
import QuickActionCard from './QuickActionCard';
import AgentAnalyticsChart from './AgentAnalyticsChart';
import { agentService } from '../services/agentService';
import { DashboardStats, Property, QuickAction } from '../types';

const AgentPropertyDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeClients: 0,
    propertiesSold: 0,
    pendingDocuments: 0
  });
  const [loading, setLoading] = useState(true);

  const quickActions: QuickAction[] = [
    {
      id: 'add-client-property',
      title: 'Add Client Property',
      description: 'List property for a client',
      icon: 'solar:home-add-bold',
      iconColor: 'text-gray-600',
      action: () => navigate('/add-property')
    },
    {
      id: 'bulk-upload',
      title: 'Bulk Upload Properties',
      description: 'Upload multiple properties via CSV',
      icon: 'solar:upload-bold',
      iconColor: 'text-purple-600',
      action: () => setActiveTab('bulk-upload')
    },
    {
      id: 'client-portfolio',
      title: 'Client Portfolio',
      description: 'Manage all client properties',
      icon: 'solar:folder-bold',
      iconColor: 'text-gray-600',
      action: () => navigate('/my-properties')
    },
    {
      id: 'lead-management',
      title: 'Lead Management',
      description: 'Track and convert leads',
      icon: 'solar:users-group-rounded-bold',
      iconColor: 'text-orange-600',
      action: () => navigate('/leads')
    },
    {
      id: 'client-communication',
      title: 'Client Communication',
      description: 'Messages and client interactions',
      icon: 'solar:chat-round-dots-bold',
      iconColor: 'text-blue-600',
      action: () => navigate('/dashboard/messages')
    }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { stats: dashboardStats, properties: agentProperties } = await agentService.fetchDashboardData();
      setStats(dashboardStats);
      setProperties(agentProperties);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Prop Puzzel | Agent Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, Agent Name. Here is your performance summary and key activity overview.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  Export
                </Button>
                <Button className="bg-red-600 hover:bg-red-700">
                  Add New Property
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="bg-transparent border-b border-gray-200 rounded-none h-auto p-0">
                <TabsTrigger
                  value="dashboard"
                  className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-4 py-2"
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="property-listings"
                  className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-4 py-2"
                >
                  Property Listings
                </TabsTrigger>
                <TabsTrigger
                  value="clients"
                  className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-4 py-2"
                >
                  Clients
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-4 py-2"
                >
                  Documents
                </TabsTrigger>
                <TabsTrigger
                  value="messages"
                  className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-4 py-2"
                >
                  Messages
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-4 py-2"
                >
                  Settings
                </TabsTrigger>
                <TabsTrigger
                  value="support"
                  className="border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none px-4 py-2"
                >
                  Support
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-8">
                <div className="container mx-auto px-4">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <Icon icon="solar:refresh-bold" className="size-8 mr-2 animate-spin" />
                      <span>Loading dashboard data...</span>
                    </div>
                  ) : (
                    <>
                      {/* Quick Actions */}
                      <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {quickActions.map((action) => (
                            <QuickActionCard
                              key={action.id}
                              title={action.title}
                              description={action.description}
                              icon={action.icon}
                              iconColor={action.iconColor}
                              onClick={action.action}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <AgentStatsCard
                          label="Total Properties Listed"
                          value={stats.totalProperties}
                        />
                        <AgentStatsCard
                          label="Active Clients"
                          value={stats.activeClients}
                        />
                        <AgentStatsCard
                          label="Properties Sold or Rented"
                          value={stats.propertiesSold}
                        />
                        <AgentStatsCard
                          label="Pending Documents"
                          value={stats.pendingDocuments}
                        />
                      </div>

                      {/* Performance Analytics */}
                      <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Analytics</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                          <AgentAnalyticsChart title="Closing Over Time" />
                          <AgentAnalyticsChart title="Lead Conversion Rate" />
                        </div>

                        <AgentAnalyticsChart
                          title="Monthly Revenue Growth"
                          height="h-80"
                          iconSize="size-16"
                        />
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Other tab contents */}
              <TabsContent value="property-listings" className="mt-8">
                <div className="container mx-auto px-4">
                  <div className="text-center py-12">
                    <Icon icon="solar:home-bold" className="size-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Property Listings</h3>
                    <p className="text-gray-600">Property listings management will be implemented here</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="clients" className="mt-8">
                <div className="container mx-auto px-4">
                  <div className="text-center py-12">
                    <Icon icon="solar:users-group-rounded-bold" className="size-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Clients</h3>
                    <p className="text-gray-600">Client management will be implemented here</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-8">
                <div className="container mx-auto px-4">
                  <div className="text-center py-12">
                    <Icon icon="solar:document-bold" className="size-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Documents</h3>
                    <p className="text-gray-600">Document management will be implemented here</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="messages" className="mt-8">
                <div className="container mx-auto px-4">
                  <div className="text-center py-12">
                    <Icon icon="solar:chat-round-dots-bold" className="size-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Messages</h3>
                    <p className="text-gray-600">Message center will be implemented here</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-8">
                <div className="container mx-auto px-4">
                  <div className="text-center py-12">
                    <Icon icon="solar:settings-bold" className="size-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Settings</h3>
                    <p className="text-gray-600">Account settings will be implemented here</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="support" className="mt-8">
                <div className="container mx-auto px-4">
                  <div className="text-center py-12">
                    <Icon icon="solar:help-bold" className="size-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Support</h3>
                    <p className="text-gray-600">Support center will be implemented here</p>
                  </div>
                </div>
              </TabsContent>

              {/* Legacy tabs for backward compatibility */}
              <TabsContent value="bulk-upload" className="mt-8">
                <div className="container mx-auto px-4">
                  <BulkUploadPage />
                </div>
              </TabsContent>

              <TabsContent value="media" className="mt-8">
                <div className="container mx-auto px-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Media Upload</CardTitle>
                      <CardDescription>
                        Upload and manage property images. Select a property to upload images for.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {properties.length > 0 ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {properties.map((property) => (
                              <Card key={property.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                                <CardHeader>
                                  <CardTitle className="text-lg">{property.title}</CardTitle>
                                  <CardDescription>
                                    ${property.price.toLocaleString()} • {property.property_type}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <PropertyImageUpload
                                    propertyId={property.id}
                                    images={property.images || []}
                                    onImagesUpdated={(images) => {
                                      setProperties(prev => prev.map(p =>
                                        p.id === property.id ? { ...p, images } : p
                                      ));
                                    }}
                                  />
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Icon icon="solar:image-bold" className="mx-auto size-12 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                          <p className="text-gray-600 mb-4">
                            You need to create some properties first before you can upload images.
                          </p>
                          <Button onClick={() => setActiveTab('bulk-upload')}>
                            <Icon icon="solar:add-circle-bold" className="size-4 mr-2" />
                            Add Properties
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-8">
                <div className="container mx-auto px-4">
                  <PerformanceAnalytics />
                </div>
              </TabsContent>

              <TabsContent value="leads" className="mt-8">
                <div className="container mx-auto px-4">
                  <LeadManagement />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AgentPropertyDashboard;