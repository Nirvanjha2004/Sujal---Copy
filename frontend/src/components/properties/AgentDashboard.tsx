import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import BulkUpload from './BulkUpload';
import ImageUpload from './ImageUpload';
import PerformanceAnalytics from './PerformanceAnalytics';
import LeadManagement from './LeadManagement';
import { 
  Upload, 
  BarChart3, 
  MessageSquare, 
  Image as ImageIcon,
  Plus,
  List
} from 'lucide-react';

interface Property {
  id: number;
  title: string;
  price: number;
  property_type: string;
  status: string;
  images?: any[];
}

const AgentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [properties, setProperties] = useState<Property[]>([]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Property
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <List className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="bulk-upload">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </TabsTrigger>
          <TabsTrigger value="media">
            <ImageIcon className="h-4 w-4 mr-2" />
            Media Upload
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="leads">
            <MessageSquare className="h-4 w-4 mr-2" />
            Leads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for property management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('bulk-upload')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload Properties
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('media')}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Upload Property Images
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('analytics')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Performance Analytics
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('leads')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Manage Leads
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Recent property views, inquiries, and updates will appear here.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Properties</span>
                    <span className="font-medium">{properties.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Listings</span>
                    <span className="font-medium">
                      {properties.filter(p => p.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pending Approval</span>
                    <span className="font-medium">
                      {properties.filter(p => p.status === 'pending').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk-upload">
          <BulkUpload />
        </TabsContent>

        <TabsContent value="media">
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
                          <ImageUpload
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
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                  <p className="text-gray-600 mb-4">
                    You need to create some properties first before you can upload images.
                  </p>
                  <Button onClick={() => setActiveTab('bulk-upload')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Properties
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <PerformanceAnalytics />
        </TabsContent>

        <TabsContent value="leads">
          <LeadManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentDashboard;