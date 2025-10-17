import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Layout } from '@/shared/components/layout/Layout';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import  projectService  from '../services/projectService';
import { Project, ProjectUnit } from '../types';
import { ProjectImageUpload } from '../components/ProjectImageUpload';
import { toast } from 'sonner';

export function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [units, setUnits] = useState<ProjectUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchUnits();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjectById(parseInt(id!));
      if (response.success) {
        setProject(response.data.project);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project details');
      navigate('/builder/projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      setUnitsLoading(true);
      const response = await projectService.getUnits(parseInt(id!), {
        limit: 10
      });
      if (response.success) {
        setUnits(response.data.units);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setUnitsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await projectService.updateProjectStatus(parseInt(id!), newStatus);
      toast.success('Project status updated successfully');
      fetchProject();
    } catch (error) {
      toast.error('Failed to update project status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-800';
      case 'pre_launch': return 'bg-blue-100 text-blue-800';
      case 'under_construction': return 'bg-yellow-100 text-yellow-800';
      case 'ready_to_move': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'on_hold': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUnitStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-orange-100 text-orange-800';
      case 'reserved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <Button onClick={() => navigate('/builder/projects')}>
              Back to Projects
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/builder/projects')}
          >
            <Icon icon="solar:arrow-left-bold" className="size-4 mr-2" />
            Back to Projects
          </Button>
        </div>

        {/* Project Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">
              {project.name}
            </h1>
            <p className="text-muted-foreground flex items-center mb-4">
              <Icon icon="solar:map-point-bold" className="size-4 mr-1" />
              {project.location}, {project.city}, {project.state}
            </p>
            <div className="flex items-center gap-4">
              <Badge className={getStatusColor(project.status)}>
                {project.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">
                {project.project_type.replace('_', ' ')}
              </Badge>
              {project.rera_number && (
                <Badge variant="outline">
                  RERA: {project.rera_number}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={project.status}
              onValueChange={handleStatusUpdate}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="pre_launch">Pre-Launch</SelectItem>
                <SelectItem value="under_construction">Under Construction</SelectItem>
                <SelectItem value="ready_to_move">Ready to Move</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => navigate(`/builder/projects/${project.id}/edit`)}
            >
              <Icon icon="solar:pen-bold" className="size-4 mr-2" />
              Edit Project
            </Button>
          </div>
        </div>

        {/* Units Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-full">
                  <Icon icon="solar:home-2-bold" className="size-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{project.total_units}</p>
                  <p className="text-sm font-medium">Total Units</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-full">
                  <Icon icon="solar:check-circle-bold" className="size-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{project.available_units}</p>
                  <p className="text-sm font-medium">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                  <Icon icon="solar:star-bold" className="size-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{project.sold_units}</p>
                  <p className="text-sm font-medium">Sold</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-full">
                  <Icon icon="solar:danger-circle-bold" className="size-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{project.blocked_units}</p>
                  <p className="text-sm font-medium">Blocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="units">Units ({units.length})</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Project Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project.images && project.images.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {project.images.slice(0, 6).map((image) => (
                          <div
                            key={image.id}
                            className="aspect-video rounded-lg overflow-hidden bg-muted"
                          >
                            <img
                              src={image.image_url}
                              alt={image.alt_text || project.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Icon icon="solar:camera-bold" className="size-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No images uploaded</p>
                          <Button size="sm" className="mt-2" onClick={() => setActiveTab('gallery')}>
                            Upload Images
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Description */}
                {project.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{project.description}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Amenities */}
                {project.amenities && project.amenities.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Amenities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.amenities.map((amenity) => (
                          <Badge key={amenity} variant="outline">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {project.start_date && (
                        <div className="flex items-center gap-3">
                          <Icon icon="solar:calendar-bold" className="size-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Start Date</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(project.start_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                      {project.expected_completion && (
                        <div className="flex items-center gap-3">
                          <Icon icon="solar:flag-bold" className="size-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Expected Completion</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(project.expected_completion).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                      {project.actual_completion && (
                        <div className="flex items-center gap-3">
                          <Icon icon="solar:check-circle-bold" className="size-5 text-green-600" />
                          <div>
                            <p className="font-medium">Actual Completion</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(project.actual_completion).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="units" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Project Units</h3>
                  <Button onClick={() => navigate(`/builder/projects/${project.id}/units`)}>
                    <Icon icon="solar:add-circle-bold" className="size-4 mr-2" />
                    Manage Units
                  </Button>
                </div>

                {unitsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : units.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Icon icon="solar:home-2-bold" className="size-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No units added yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start by adding units to your project
                      </p>
                      <Button onClick={() => navigate(`/builder/projects/${project.id}/units/new`)}>
                        <Icon icon="solar:add-circle-bold" className="size-4 mr-2" />
                        Add First Unit
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {units.map((unit) => (
                      <Card key={unit.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold">{unit.unit_number}</h4>
                                <Badge variant="outline">{unit.unit_type}</Badge>
                                <Badge className={getUnitStatusColor(unit.status)}>
                                  {unit.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Floor</p>
                                  <p className="font-medium">{unit.floor_number}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Area</p>
                                  <p className="font-medium">{unit.area_sqft} sq ft</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Price</p>
                                  <p className="font-medium">₹{unit.price.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Per Sq Ft</p>
                                  <p className="font-medium">₹{unit.price_per_sqft.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Icon icon="solar:eye-bold" className="size-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Icon icon="solar:pen-bold" className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="text-center">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/builder/projects/${project.id}/units`)}
                      >
                        View All Units
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="gallery">
                <ProjectImageUpload
                  projectId={project.id}
                  images={project.images || []}
                  onImagesUpdate={fetchProject}
                />
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Icon icon="solar:chart-bold" className="size-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Project Analytics</h3>
                    <p className="text-muted-foreground mb-4">
                      View detailed analytics and performance metrics
                    </p>
                    <Button>
                      <Icon icon="solar:eye-bold" className="size-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Project Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{project.total_units}</p>
                    <p className="text-sm text-muted-foreground">Total Units</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{project.available_units}</p>
                    <p className="text-sm text-muted-foreground">Available</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{project.sold_units}</p>
                    <p className="text-sm text-muted-foreground">Sold</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{project.blocked_units}</p>
                    <p className="text-sm text-muted-foreground">Blocked</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate(`/builder/projects/${project.id}/units/new`)}
                >
                  <Icon icon="solar:add-circle-bold" className="size-4 mr-2" />
                  Add New Unit
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate(`/builder/projects/${project.id}/units`)}
                >
                  <Icon icon="solar:home-2-bold" className="size-4 mr-2" />
                  Manage Units
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => setActiveTab('gallery')}
                >
                  <Icon icon="solar:upload-bold" className="size-4 mr-2" />
                  Upload Images
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Icon icon="solar:document-bold" className="size-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground">{project.address}</p>
                  </div>
                  <div>
                    <p className="font-medium">City</p>
                    <p className="text-muted-foreground">{project.city}, {project.state} - {project.pincode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}