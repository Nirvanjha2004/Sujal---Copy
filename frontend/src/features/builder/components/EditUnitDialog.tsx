import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import  projectService  from '../services/projectService';
import { toast } from 'sonner';

interface EditUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  unitId: number;
  onSuccess: () => void;
}

interface UnitFormData {
  unitNumber: string;
  unitType: string;
  floorNumber: number;
  tower: string;
  areaSqft: number;
  areaSqm?: number;
  carpetArea?: number;
  builtUpArea?: number;
  superBuiltUpArea?: number;
  price: number;
  pricePerSqft?: number;
  maintenanceCharge?: number;
  parkingSpaces: number;
  balconies: number;
  bathrooms: number;
  bedrooms: number;
  facing: string;
  status: string;
  isCornerUnit: boolean;
  hasTerrace: boolean;
}

export function EditUnitDialog({ open, onOpenChange, projectId, unitId, onSuccess }: EditUnitDialogProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingUnit, setFetchingUnit] = useState(false);
  const [formData, setFormData] = useState<UnitFormData>({
    unitNumber: '',
    unitType: '2BHK',
    floorNumber: 0,
    tower: '',
    areaSqft: 0,
    price: 0,
    parkingSpaces: 0,
    balconies: 0,
    bathrooms: 1,
    bedrooms: 0,
    facing: '',
    status: 'available',
    isCornerUnit: false,
    hasTerrace: false,
  });

  useEffect(() => {
    if (open && unitId) {
      fetchUnitDetails();
    }
  }, [open, unitId]);

  const fetchUnitDetails = async () => {
    try {
      setFetchingUnit(true);
      const response = await projectService.getUnit(projectId, unitId);
      
      if (response.success) {
        const unit = response.data.unit;
        setFormData({
          unitNumber: unit.unit_number,
          unitType: unit.unit_type,
          floorNumber: unit.floor_number,
          tower: unit.tower || '',
          areaSqft: unit.area_sqft,
          areaSqm: unit.area_sqm,
          price: unit.price,
          pricePerSqft: unit.price_per_sqft,
          maintenanceCharge: unit.maintenance_charge,
          parkingSpaces: unit.parking_spaces || 0,
          balconies: unit.balconies || 0,
          bathrooms: unit.bathrooms,
          bedrooms: unit.bedrooms,
          status: unit.status,
          isCornerUnit: unit.is_corner_unit || false,
          hasTerrace: unit.has_terrace || false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch unit details:', error);
      toast.error('Failed to load unit details');
    } finally {
      setFetchingUnit(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const response = await projectService.updateUnit(projectId, unitId, formData);
      
      if (response.success) {
        toast.success('Unit updated successfully');
        onSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error('Update unit error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update unit');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UnitFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate price per sqft
      if (field === 'price' || field === 'areaSqft') {
        if (updated.price && updated.areaSqft) {
          updated.pricePerSqft = Math.round(updated.price / updated.areaSqft);
        }
      }
      
      // Auto-calculate area in sqm
      if (field === 'areaSqft' && updated.areaSqft) {
        updated.areaSqm = parseFloat((updated.areaSqft * 0.092903).toFixed(2));
      }
      
      return updated;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Unit</DialogTitle>
          <DialogDescription>
            Update unit details and specifications
          </DialogDescription>
        </DialogHeader>

        {fetchingUnit ? (
          <div className="flex items-center justify-center py-12">
            <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitNumber">Unit Number *</Label>
                  <Input
                    id="unitNumber"
                    value={formData.unitNumber}
                    onChange={(e) => handleChange('unitNumber', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitType">Unit Type *</Label>
                  <Select
                    value={formData.unitType}
                    onValueChange={(value) => handleChange('unitType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="1BHK">1BHK</SelectItem>
                      <SelectItem value="2BHK">2BHK</SelectItem>
                      <SelectItem value="3BHK">3BHK</SelectItem>
                      <SelectItem value="4BHK">4BHK</SelectItem>
                      <SelectItem value="5BHK">5BHK</SelectItem>
                      <SelectItem value="Penthouse">Penthouse</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floorNumber">Floor Number *</Label>
                  <Input
                    id="floorNumber"
                    type="number"
                    value={formData.floorNumber}
                    onChange={(e) => handleChange('floorNumber', parseInt(e.target.value) || 0)}
                    min={0}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tower">Tower</Label>
                  <Input
                    id="tower"
                    value={formData.tower}
                    onChange={(e) => handleChange('tower', e.target.value)}
                    placeholder="e.g., Tower A"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facing">Facing</Label>
                  <Select
                    value={formData.facing}
                    onValueChange={(value) => handleChange('facing', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select facing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="North">North</SelectItem>
                      <SelectItem value="South">South</SelectItem>
                      <SelectItem value="East">East</SelectItem>
                      <SelectItem value="West">West</SelectItem>
                      <SelectItem value="North-East">North-East</SelectItem>
                      <SelectItem value="North-West">North-West</SelectItem>
                      <SelectItem value="South-East">South-East</SelectItem>
                      <SelectItem value="South-West">South-West</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Area Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Area Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="areaSqft">Area (sq ft) *</Label>
                  <Input
                    id="areaSqft"
                    type="number"
                    value={formData.areaSqft}
                    onChange={(e) => handleChange('areaSqft', parseFloat(e.target.value) || 0)}
                    min={0}
                    step={0.01}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="areaSqm">Area (sq m)</Label>
                  <Input
                    id="areaSqm"
                    type="number"
                    value={formData.areaSqm || ''}
                    onChange={(e) => handleChange('areaSqm', parseFloat(e.target.value))}
                    min={0}
                    step={0.01}
                    placeholder="Auto-calculated"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carpetArea">Carpet Area (sq ft)</Label>
                  <Input
                    id="carpetArea"
                    type="number"
                    value={formData.carpetArea || ''}
                    onChange={(e) => handleChange('carpetArea', parseFloat(e.target.value))}
                    min={0}
                    step={0.01}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="builtUpArea">Built-up Area (sq ft)</Label>
                  <Input
                    id="builtUpArea"
                    type="number"
                    value={formData.builtUpArea || ''}
                    onChange={(e) => handleChange('builtUpArea', parseFloat(e.target.value))}
                    min={0}
                    step={0.01}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="superBuiltUpArea">Super Built-up Area (sq ft)</Label>
                  <Input
                    id="superBuiltUpArea"
                    type="number"
                    value={formData.superBuiltUpArea || ''}
                    onChange={(e) => handleChange('superBuiltUpArea', parseFloat(e.target.value))}
                    min={0}
                    step={0.01}
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                    min={0}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerSqft">Price per sq ft (₹)</Label>
                  <Input
                    id="pricePerSqft"
                    type="number"
                    value={formData.pricePerSqft || ''}
                    onChange={(e) => handleChange('pricePerSqft', parseFloat(e.target.value))}
                    min={0}
                    placeholder="Auto-calculated"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenanceCharge">Maintenance Charge (₹/month)</Label>
                  <Input
                    id="maintenanceCharge"
                    type="number"
                    value={formData.maintenanceCharge || ''}
                    onChange={(e) => handleChange('maintenanceCharge', parseFloat(e.target.value))}
                    min={0}
                  />
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Configuration</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms *</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => handleChange('bedrooms', parseInt(e.target.value) || 0)}
                    min={0}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms *</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => handleChange('bathrooms', parseInt(e.target.value) || 1)}
                    min={1}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="balconies">Balconies</Label>
                  <Input
                    id="balconies"
                    type="number"
                    value={formData.balconies}
                    onChange={(e) => handleChange('balconies', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                  <Input
                    id="parkingSpaces"
                    type="number"
                    value={formData.parkingSpaces}
                    onChange={(e) => handleChange('parkingSpaces', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              </div>
            </div>

            {/* Special Features */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Special Features</h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isCornerUnit"
                    checked={formData.isCornerUnit}
                    onCheckedChange={(checked) => handleChange('isCornerUnit', checked)}
                  />
                  <Label htmlFor="isCornerUnit" className="cursor-pointer">
                    Corner Unit
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasTerrace"
                    checked={formData.hasTerrace}
                    onCheckedChange={(checked) => handleChange('hasTerrace', checked)}
                  />
                  <Label htmlFor="hasTerrace" className="cursor-pointer">
                    Has Terrace
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Icon icon="solar:refresh-bold" className="size-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:check-circle-bold" className="size-4 mr-2" />
                    Update Unit
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}