import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '@iconify/react';
import { Layout } from '@/shared/components/layout/Layout';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { projectService } from '../services/projectService';
import { toast } from 'sonner';

// Updated schema with field names matching the backend expectations
const unitSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required'),
  unitType: z.string().min(1, 'Unit type is required'),
  floorNumber: z.coerce.number().int().min(0, 'Floor number must be a positive integer'),
  bedrooms: z.coerce.number().int().min(0, 'Bedrooms must be a non-negative integer'),
  bathrooms: z.coerce.number().int().min(1, 'Bathrooms must be at least 1'),
  areaSqft: z.coerce.number().positive('Area in sqft must be greater than 0'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  status: z.string().default('available'),
});

type UnitFormData = z.infer<typeof unitSchema>;

export function NewUnitPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      status: 'available',
      floorNumber: 1,
      bedrooms: 2, // Add default value for bedrooms
      bathrooms: 2,
    },
  });

  // Fetch project details to display project name
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      
      try {
        const response = await projectService.getProject(parseInt(projectId));
        if (response.success) {
          setProject(response.data.project);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };
    
    fetchProject();
  }, [projectId]);

  const onSubmit = async (data: UnitFormData) => {
    if (!projectId) {
      toast.error('Project ID is missing.');
      return;
    }

    try {
      setLoading(true);
      const response = await projectService.createUnit(parseInt(projectId), data);

      if (response.success) {
        toast.success('Unit created successfully!');
        navigate(`/builder/projects/${projectId}`);
      } else {
        toast.error(response.error?.message || 'Failed to create unit');
      }
    } catch (error: any) {
      console.error('Error creating unit:', error);
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
                  {errors.unitNumber && <p className="text-sm text-destructive mt-1">{errors.unitNumber.message}</p>}
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
                  {errors.unitType && <p className="text-sm text-destructive mt-1">{errors.unitType.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <Label htmlFor="floorNumber">Floor Number *</Label>
                  <Input id="floorNumber" type="number" {...register('floorNumber')} placeholder="e.g., 3" />
                  {errors.floorNumber && <p className="text-sm text-destructive mt-1">{errors.floorNumber.message}</p>}
                </div>
                <div>
                  <Label htmlFor="bedrooms">Bedrooms *</Label>
                  <Input id="bedrooms" type="number" {...register('bedrooms')} placeholder="e.g., 2" />
                  {errors.bedrooms && <p className="text-sm text-destructive mt-1">{errors.bedrooms.message}</p>}
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms *</Label>
                  <Input id="bathrooms" type="number" {...register('bathrooms')} placeholder="e.g., 2" />
                  {errors.bathrooms && <p className="text-sm text-destructive mt-1">{errors.bathrooms.message}</p>}
                </div>
                <div>
                  <Label htmlFor="areaSqft">Area (sqft) *</Label>
                  <Input id="areaSqft" type="number" {...register('areaSqft')} placeholder="e.g., 1500" />
                  {errors.areaSqft && <p className="text-sm text-destructive mt-1">{errors.areaSqft.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price">Price (INR) *</Label>
                  <Input id="price" type="number" {...register('price')} placeholder="e.g., 7500000" />
                  {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
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
                  {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
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