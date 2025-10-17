import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '@iconify/react';
import { Layout } from '@/shared/components/layout/Layout';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { projectService } from '../services/projectService';
import { toast } from 'react-hot-toast';

const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().optional(),
  location: z.string().min(3, 'Location is required'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  projectType: z.enum(['residential', 'commercial', 'mixed_use', 'villa', 'apartment', 'office', 'retail']),
  startDate: z.string().optional(),
  expectedCompletion: z.string().optional(),
  reraNumber: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export function NewProjectPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema)
  });

  const commonAmenities = [
    'Swimming Pool', 'Gym/Fitness Center', 'Clubhouse', 'Children\'s Play Area',
    'Garden/Landscaping', 'Parking', 'Security', '24/7 Power Backup',
    'Lift/Elevator', 'Community Hall', 'Jogging Track', 'Tennis Court',
    'Basketball Court', 'Indoor Games Room', 'Library', 'Spa/Wellness Center',
    'Business Center', 'Guest House', 'Cafeteria', 'Shopping Complex'
  ];

  const handleAmenityToggle = (amenity: string) => {
    setAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !amenities.includes(customAmenity.trim())) {
      setAmenities(prev => [...prev, customAmenity.trim()]);
      setCustomAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(prev => prev.filter(a => a !== amenity));
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setLoading(true);

      const projectData = {
        ...data,
        amenities,
        specifications: {},
        pricing: {}
      };

      const response = await projectService.createProject(projectData);

      if (response.success) {
        toast.success('Project created successfully!');
        navigate(`/builder/projects/${response.data.project.id}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

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

        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">
            Create New Project
          </h1>
          <p className="text-muted-foreground">
            Add a new construction project to your portfolio
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="solar:info-circle-bold" className="size-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g., Sunrise Residency"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="projectType">Project Type *</Label>
                  <Select onValueChange={(value) => setValue('projectType', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="mixed_use">Mixed Use</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.projectType && (
                    <p className="text-sm text-red-500 mt-1">{errors.projectType.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe your project..."
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="solar:map-point-bold" className="size-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Full Address *</Label>
                <Textarea
                  id="address"
                  {...register('address')}
                  placeholder="Complete address with landmarks"
                  rows={3}
                />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="location">Area/Sector *</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="e.g., Sector 15"
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    {...register('city')}
                    placeholder="e.g., Gurgaon"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    {...register('state')}
                    placeholder="e.g., Haryana"
                  />
                  {errors.state && (
                    <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    {...register('pincode')}
                    placeholder="e.g., 122001"
                  />
                  {errors.pincode && (
                    <p className="text-sm text-red-500 mt-1">{errors.pincode.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="solar:calendar-bold" className="size-5" />
                Project Timeline & Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date (Optional)</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register('startDate')}
                  />
                </div>

                <div>
                  <Label htmlFor="expectedCompletion">Expected Completion (Optional)</Label>
                  <Input
                    id="expectedCompletion"
                    type="date"
                    {...register('expectedCompletion')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="reraNumber">RERA Number (Optional)</Label>
                  <Input
                    id="reraNumber"
                    {...register('reraNumber')}
                    placeholder="e.g., RERA-GGM-567-2023"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="solar:star-bold" className="size-5" />
                Amenities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Amenities */}
              {amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {amenities.map((amenity) => (
                    <Badge
                      key={amenity}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="ml-1 hover:text-red-500"
                      >
                        <Icon icon="solar:close-circle-bold" className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Common Amenities */}
              <div>
                <Label>Select Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {commonAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={amenities.includes(amenity)}
                        onCheckedChange={() => handleAmenityToggle(amenity)}
                      />
                      <Label htmlFor={amenity} className="text-sm">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Amenity */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom amenity"
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
                />
                <Button type="button" variant="outline" onClick={addCustomAmenity}>
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/builder/projects')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Icon icon="solar:refresh-bold" className="size-4 mr-2 animate-spin" />}
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}