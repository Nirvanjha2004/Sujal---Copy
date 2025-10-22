import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { Icon } from '@iconify/react';
import { Layout } from '@/shared/components/layout/Layout';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import  projectService  from '../services/projectService';
import { toast } from 'sonner';

interface UnitFormData {
  unitNumber: string;
  unitType: string;
  floorNumber: string;
  bedrooms: string;
  bathrooms: string;
  areaSqft: string;
  price: string;
  status: string;
}

export function NewUnitPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
  } = useForm<UnitFormData>({
    defaultValues: {
      unitNumber: '',
      unitType: '',
      status: 'available',
      floorNumber: '1',
      bedrooms: '2',
      bathrooms: '2',
      areaSqft: '',
      price: '',
    },
  });

  // Fetch project details to display project name
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      
      try {
        console.log('NewUnitPage: Fetching project details for ID:', projectId);
        const projectData = await projectService.getProjectById(projectId);
        console.log('NewUnitPage: Received project data:', projectData);
        
        if (projectData) {
          setProject(projectData);
        }
      } catch (error) {
        console.error('NewUnitPage: Error fetching project:', error);
      }
    };
    
    fetchProject();
  }, [projectId]);

  const onSubmit = async (formData: UnitFormData) => {
    if (!projectId) {
      toast.error('Project ID is missing.');
      return;
    }

    // Basic validation
    if (!formData.unitNumber?.trim()) {
      toast.error('Unit number is required');
      return;
    }
    if (!formData.unitType?.trim()) {
      toast.error('Unit type is required');
      return;
    }
    if (!formData.areaSqft || parseFloat(formData.areaSqft) <= 0) {
      toast.error('Valid area is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }

    try {
      setLoading(true);
      console.log('NewUnitPage: Creating unit with form data:', formData);
      
      // Transform the form data to match API expectations and ensure proper types
      const unitData = {
        unitNumber: formData.unitNumber.trim(),
        unitType: formData.unitType.trim(),
        floorNumber: parseInt(formData.floorNumber) || 0,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 1,
        areaSqft: parseFloat(formData.areaSqft) || 0,
        price: parseFloat(formData.price) || 0,
        status: formData.status || 'available',
        // Calculate price per sqft
        pricePerSqft: Math.round((parseFloat(formData.price) || 0) / (parseFloat(formData.areaSqft) || 1)),
        // Set default values for optional fields
        parkingSpaces: 1,
        balconies: 1,
        isCornerUnit: false,
        hasTerrace: false
      };
      
      console.log('NewUnitPage: Transformed unit data:', unitData);
      
      const createdUnit = await projectService.addProjectUnit(projectId, unitData);
      console.log('NewUnitPage: Unit created successfully:', createdUnit);
      
      toast.success('Unit created successfully!');
      navigate(`/builder/projects/${projectId}`);
    } catch (error: any) {
      console.error('NewUnitPage: Error creating unit:', error);
      toast.error(error?.message || 'Failed to create unit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/builder/projects/${projectId}`)}
          >
            <Icon icon="solar:arrow-left-bold" className="size-4 mr-2" />
            Back to Project
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">
            Add New Unit
          </h1>
          <p className="text-muted-foreground">
            Add a new unit to {project?.name || 'your project'}.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Unit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="unitNumber">Unit Number *</Label>
                  <Input id="unitNumber" {...register('unitNumber')} placeholder="e.g., A-101" />
                </div>
                <div>
                  <Label htmlFor="unitType">Unit Type *</Label>
                  <Select onValueChange={(value) => setValue('unitType', value)}>
                    <SelectTrigger id="unitType">
                      <SelectValue placeholder="Select unit type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1BHK">1BHK</SelectItem>
                      <SelectItem value="2BHK">2BHK</SelectItem>
                      <SelectItem value="3BHK">3BHK</SelectItem>
                      <SelectItem value="4BHK">4BHK</SelectItem>
                      <SelectItem value="Penthouse">Penthouse</SelectItem>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="Office">Office Space</SelectItem>
                      <SelectItem value="Shop">Retail Shop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <Label htmlFor="floorNumber">Floor Number *</Label>
                  <Input id="floorNumber" type="number" {...register('floorNumber')} placeholder="e.g., 3" />
                </div>
                <div>
                  <Label htmlFor="bedrooms">Bedrooms *</Label>
                  <Input id="bedrooms" type="number" {...register('bedrooms')} placeholder="e.g., 2" />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms *</Label>
                  <Input id="bathrooms" type="number" {...register('bathrooms')} placeholder="e.g., 2" />
                </div>
                <div>
                  <Label htmlFor="areaSqft">Area (sqft) *</Label>
                  <Input id="areaSqft" type="number" {...register('areaSqft')} placeholder="e.g., 1500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price">Price (INR) *</Label>
                  <Input id="price" type="number" {...register('price')} placeholder="e.g., 7500000" />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(value) => setValue('status', value)} defaultValue="available">
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="under_construction">Under Construction</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(`/builder/projects/${projectId}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Icon icon="solar:refresh-bold" className="size-4 mr-2 animate-spin" />}
              Create Unit
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}