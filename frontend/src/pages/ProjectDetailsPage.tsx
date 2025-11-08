import { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Layout } from "@/shared/components/layout/Layout";
import { Icon } from "@iconify/react";
import { api } from "@/shared/lib/api";

interface Project {
  id: number;
  name: string;
  description?: string;
  location: string;
  city: string;
  state: string;
  project_type: string;
  status: string;
  total_units: number;
  available_units: number;
  sold_units: number;
  blocked_units: number;
  pricing?: Record<string, any>;
  amenities?: string[];
  specifications?: Record<string, any>;
  images?: string[];
  builder?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
  units?: any[];
}

export function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await api.getProjectById(parseInt(id));
        if (response.success) {
          setProject(response.data.project);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const formatPrice = (pricing: any) => {
    if (pricing?.min && pricing?.max) {
      const formatAmount = (amount: number) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)} L`;
        return `₹${amount.toLocaleString()}`;
      };
      return `${formatAmount(pricing.min)} - ${formatAmount(pricing.max)}`;
    }
    return 'Price on request';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready_to_move': return 'bg-green-500';
      case 'under_construction': return 'bg-yellow-500';
      case 'pre_launch': return 'bg-blue-500';
      case 'planning': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready_to_move': return 'Ready to Move';
      case 'under_construction': return 'Under Construction';
      case 'pre_launch': return 'Pre Launch';
      case 'planning': return 'Planning';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <Icon icon="solar:danger-bold" className="h-4 w-4" />
            <AlertDescription>
              {error || 'Project not found'}
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/')} className="mt-4">
            <Icon icon="solar:arrow-left-bold" className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <Icon icon="solar:arrow-left-bold" className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Icon icon="solar:map-point-bold" className="h-4 w-4" />
                <span>{project.location}, {project.city}, {project.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(project.status)} text-white`}>
                  {getStatusText(project.status)}
                </Badge>
                <Badge variant="outline">
                  {project.project_type}
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-primary mb-1">
                {formatPrice(project.pricing)}
              </div>
              <div className="text-sm text-muted-foreground">
                {project.available_units} of {project.total_units} units available
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        {project.images && project.images.length > 0 && (
          <div className="mb-8 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main large image - takes full height on left */}
              <div className="relative w-full h-[25rem] overflow-hidden rounded-lg">
                <img
                  src={project.images[0]}
                  alt={project.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              
              {/* Smaller images grid - 2x2 on right */}
              <div className="grid grid-cols-2 gap-4">
                {project.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative w-full h-[12rem] overflow-hidden rounded-lg">
                    <img
                      src={image}
                      alt={`${project.name} ${index + 2}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ))}
                {/* Fill empty slots if less than 4 additional images */}
                {project.images.length < 5 && Array.from({ length: 5 - project.images.length }).map((_, index) => (
                  <div key={`empty-${index}`} className="relative w-full h-[12rem] bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    <Icon icon="solar:gallery-bold" className="h-8 w-8 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="units">Units</TabsTrigger>
            {/* <TabsTrigger value="contact">Contact</TabsTrigger> */}
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Project</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {project.description || 'No description available.'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div>
                        <h4 className="font-semibold mb-2">Project Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total Units:</span>
                            <span>{project.total_units}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Available:</span>
                            <span className="text-green-600">{project.available_units}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sold:</span>
                            <span className="text-red-600">{project.sold_units}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Project Type:</span>
                            <span>{project.project_type}</span>
                          </div>
                        </div>
                      </div>
                      
                      {project.specifications && Object.keys(project.specifications).length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Specifications</h4>
                          <div className="space-y-2 text-sm">
                            {Object.entries(project.specifications).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="capitalize">{key.replace('_', ' ')}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:home-bold" className="h-4 w-4 text-primary" />
                          <span className="text-sm">Total Units</span>
                        </div>
                        <span className="font-semibold">{project.total_units}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Available</span>
                        </div>
                        <span className="font-semibold text-green-600">{project.available_units}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:close-circle-bold" className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Sold</span>
                        </div>
                        <span className="font-semibold text-red-600">{project.sold_units}</span>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="text-sm text-muted-foreground mb-2">Availability</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ 
                              width: `${(project.available_units / project.total_units) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {Math.round((project.available_units / project.total_units) * 100)}% available
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="amenities" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Amenities & Features</CardTitle>
              </CardHeader>
              <CardContent>
                {project.amenities && project.amenities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-green-500" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No amenities information available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="units" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Units</CardTitle>
              </CardHeader>
              <CardContent>
                {project.units && project.units.length > 0 ? (
                  <div className="space-y-4">
                    {project.units.slice(0, 10).map((unit: any) => (
                      <div key={unit.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{unit.unit_number}</h4>
                            <p className="text-sm text-muted-foreground">{unit.unit_type}</p>
                          </div>
                          <Badge variant={unit.status === 'available' ? 'default' : 'secondary'}>
                            {unit.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Floor:</span>
                            <span className="ml-1">{unit.floor_number}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Area:</span>
                            <span className="ml-1">{unit.area_sqft} sq ft</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Price:</span>
                            <span className="ml-1">₹{(unit.price / 100000).toFixed(1)}L</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">BHK:</span>
                            <span className="ml-1">{unit.bedrooms}BHK</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {project.units.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Showing 10 of {project.units.length} units
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No unit information available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Builder</CardTitle>
              </CardHeader>
              <CardContent>
                {project.builder ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {project.builder.first_name} {project.builder.last_name}
                      </h4>
                      <p className="text-muted-foreground">Project Developer</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon icon="solar:letter-bold" className="h-4 w-4 text-muted-foreground" />
                        <span>{project.builder.email}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button className="w-full">
                        <Icon icon="solar:phone-bold" className="mr-2 h-4 w-4" />
                        Contact Builder
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Builder information not available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}