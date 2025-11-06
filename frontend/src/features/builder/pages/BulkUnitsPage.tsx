import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Layout } from '@/shared/components/layout/Layout';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import projectService from '../services/projectService';
import { toast } from 'sonner';

interface BulkUnit {
  unit_number: string;
  unit_type: string;
  floor_number: number;
  tower?: string;
  area_sqft: number;
  area_sqm?: number;
  price: number;
  price_per_sqft?: number;
  maintenance_charge?: number;
  parking_spaces?: number;
  balconies?: number;
  bathrooms: number;
  bedrooms: number;
  is_corner_unit?: boolean;
  has_terrace?: boolean;
}

export function BulkUnitsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If no project ID is provided, redirect to projects page
  if (!id) {
    navigate('/builder/projects');
    return null;
  }
  
  const [activeTab, setActiveTab] = useState<'form' | 'csv'>('form');
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<BulkUnit[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Form-based bulk creation state
  const [formConfig, setFormConfig] = useState({
    startFloor: 1,
    endFloor: 10,
    unitsPerFloor: 4,
    unitType: '2BHK',
    tower: '',
    basePrice: 5000000,
    areaSqft: 1200,
    bedrooms: 2,
    bathrooms: 2,
    parkingSpaces: 1,
    balconies: 1,
    priceIncrement: 50000, // Price increase per floor
  });

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${id}/units/template`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'units_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }
      
      setCsvFile(file);
      parseCSVPreview(file);
    }
  };

  const parseCSVPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const units: BulkUnit[] = [];
      const parseErrors: string[] = [];

      for (let i = 1; i < Math.min(lines.length, 11); i++) { // Preview first 10 rows
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const unit: any = {};
        
        headers.forEach((header, index) => {
          unit[header] = values[index];
        });

        // Validate required fields
        if (!unit.unit_number || !unit.unit_type || !unit.area_sqft || !unit.price) {
          parseErrors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }

        units.push({
          unit_number: unit.unit_number,
          unit_type: unit.unit_type,
          floor_number: parseInt(unit.floor_number) || 0,
          tower: unit.tower,
          area_sqft: parseFloat(unit.area_sqft),
          area_sqm: unit.area_sqm ? parseFloat(unit.area_sqm) : undefined,
          price: parseFloat(unit.price),
          price_per_sqft: unit.price_per_sqft ? parseFloat(unit.price_per_sqft) : undefined,
          bathrooms: parseInt(unit.bathrooms) || 1,
          bedrooms: parseInt(unit.bedrooms) || 0,
          parking_spaces: parseInt(unit.parking_spaces) || 0,
          balconies: parseInt(unit.balconies) || 0,
          is_corner_unit: unit.is_corner_unit === 'true' || unit.is_corner_unit === '1',
          has_terrace: unit.has_terrace === 'true' || unit.has_terrace === '1',
        });
      }

      setCsvPreview(units);
      setErrors(parseErrors);
    };
    
    reader.readAsText(file);
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await fetch(`/api/v1/projects/${id}/units/bulk-csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Units created successfully');
        navigate(`/builder/projects/${id}/units`);
      } else {
        // Handle different error types
        const errorData = data.error;
        
        switch (errorData?.code) {
          case 'DUPLICATE_UNITS':
          case 'DUPLICATE_ENTRY':
            toast.error(`Duplicate units found: ${errorData.details?.join?.(', ') || 'Some units already exist'}`);
            setErrors([errorData.message, ...(errorData.details || [])]);
            break;
            
          case 'VALIDATION_ERROR':
            toast.error('CSV validation failed - please check your data');
            setErrors(errorData.details?.map((detail: any) => 
              typeof detail === 'string' ? detail : detail.message || 'Validation error'
            ) || [errorData.message]);
            break;
            
          default:
            toast.error(errorData?.message || 'Failed to create units');
            setErrors(errorData?.details || [errorData?.message || 'Upload failed']);
        }
      }
    } catch (error: any) {
      console.error('CSV upload error:', error);
      
      if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        toast.error(errorData.message || 'Failed to upload CSV file');
        setErrors([errorData.message || 'Upload failed']);
      } else {
        toast.error('Failed to upload CSV file - please try again');
        setErrors(['Network error or server unavailable']);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateUnitsFromForm = (): BulkUnit[] => {
    const units: BulkUnit[] = [];
    
    for (let floor = formConfig.startFloor; floor <= formConfig.endFloor; floor++) {
      for (let unitNum = 1; unitNum <= formConfig.unitsPerFloor; unitNum++) {
        const floorPrice = formConfig.basePrice + (floor - formConfig.startFloor) * formConfig.priceIncrement;
        
        units.push({
          unit_number: `${floor}${unitNum.toString().padStart(2, '0')}`,
          unit_type: formConfig.unitType,
          floor_number: floor,
          tower: formConfig.tower || undefined,
          area_sqft: formConfig.areaSqft,
          price: floorPrice,
          price_per_sqft: Math.round(floorPrice / formConfig.areaSqft),
          bedrooms: formConfig.bedrooms,
          bathrooms: formConfig.bathrooms,
          parking_spaces: formConfig.parkingSpaces,
          balconies: formConfig.balconies,
        });
      }
    }
    
    return units;
  };

  // Add function to check for existing units
  const checkForExistingUnits = async (units: BulkUnit[]): Promise<string[]> => {
    try {
      const existingUnits = await projectService.getProjectUnits(id!);
      const existingUnitNumbers = existingUnits.map((unit: any) => unit.unit_number);
      const newUnitNumbers = units.map(unit => unit.unit_number);
      
      return newUnitNumbers.filter(unitNumber => existingUnitNumbers.includes(unitNumber));
    } catch (error) {
      console.error('Error checking existing units:', error);
      return [];
    }
  };

  // Function to suggest alternative floor ranges
  const suggestAlternativeFloors = async (): Promise<string> => {
    try {
      const existingUnits = await projectService.getProjectUnits(id!);
      const existingFloors = [...new Set(existingUnits.map((unit: any) => unit.floor_number))].sort((a, b) => a - b);
      
      if (existingFloors.length === 0) {
        return "You can start from floor 1";
      }
      
      const maxFloor = Math.max(...existingFloors);
      const suggestedStart = maxFloor + 1;
      
      return `Consider starting from floor ${suggestedStart} to avoid conflicts`;
    } catch (error) {
      return "Check existing units to avoid conflicts";
    }
  };

  const handleFormBulkCreate = async () => {
    try {
      setLoading(true);
      setErrors([]); // Clear previous errors
      const units = generateUnitsFromForm();
      
      // Check for existing units first
      const duplicateUnits = await checkForExistingUnits(units);
      if (duplicateUnits.length > 0) {
        const suggestion = await suggestAlternativeFloors();
        toast.error(`These unit numbers already exist: ${duplicateUnits.join(', ')}`);
        setErrors([
          `Duplicate units: ${duplicateUnits.join(', ')}`,
          `Suggestion: ${suggestion}`
        ]);
        return;
      }
      
      const response = await projectService.bulkCreateUnits(parseInt(id!), units);
      
      if (response.success) {
        toast.success(`${response.data.count} units created successfully`);
        navigate(`/builder/projects/${id}/units`);
      }
    } catch (error: any) {
      console.error('Form bulk create error:', error);
      
      // Handle different types of errors
      if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        
        switch (errorData.code) {
          case 'DUPLICATE_UNITS':
          case 'DUPLICATE_ENTRY':
            toast.error(`Duplicate units found: ${errorData.details?.join?.(', ') || 'Some units already exist'}`);
            setErrors([errorData.message]);
            break;
            
          case 'VALIDATION_ERROR':
            toast.error('Validation failed - please check your unit data');
            setErrors(errorData.details?.map((detail: any) => 
              typeof detail === 'string' ? detail : detail.message || 'Validation error'
            ) || [errorData.message]);
            break;
            
          default:
            toast.error(errorData.message || 'Failed to create units');
            setErrors([errorData.message || 'An error occurred']);
        }
      } else {
        toast.error('Failed to create units - please try again');
        setErrors(['Network error or server unavailable']);
      }
    } finally {
      setLoading(false);
    }
  };

  const totalUnits = (formConfig.endFloor - formConfig.startFloor + 1) * formConfig.unitsPerFloor;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/builder/projects/${id}/units`)}
          >
            <Icon icon="solar:arrow-left-bold" className="size-4 mr-2" />
            Back to Units
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">
            Bulk Add Units
          </h1>
          <p className="text-muted-foreground">
            Add multiple units at once using form or CSV upload
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'form' | 'csv')}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="form">
              <Icon icon="solar:document-add-bold" className="size-4 mr-2" />
              Form Generator
            </TabsTrigger>
            <TabsTrigger value="csv">
              <Icon icon="solar:file-bold" className="size-4 mr-2" />
              CSV Upload
            </TabsTrigger>
          </TabsList>

          {/* Form-based Generation */}
          <TabsContent value="form">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Unit Configuration</CardTitle>
                    <CardDescription>
                      Configure the parameters for bulk unit generation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Floor Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startFloor">Start Floor</Label>
                        <Input
                          id="startFloor"
                          type="number"
                          value={formConfig.startFloor}
                          onChange={(e) => setFormConfig(prev => ({ ...prev, startFloor: parseInt(e.target.value) || 1 }))}
                          min={0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endFloor">End Floor</Label>
                        <Input
                          id="endFloor"
                          type="number"
                          value={formConfig.endFloor}
                          onChange={(e) => setFormConfig(prev => ({ ...prev, endFloor: parseInt(e.target.value) || 1 }))}
                          min={formConfig.startFloor}
                        />
                      </div>
                    </div>

                    {/* Units Per Floor */}
                    <div className="space-y-2">
                      <Label htmlFor="unitsPerFloor">Units Per Floor</Label>
                      <Input
                        id="unitsPerFloor"
                        type="number"
                        value={formConfig.unitsPerFloor}
                        onChange={(e) => setFormConfig(prev => ({ ...prev, unitsPerFloor: parseInt(e.target.value) || 1 }))}
                        min={1}
                        max={20}
                      />
                    </div>

                    {/* Unit Type */}
                    <div className="space-y-2">
                      <Label htmlFor="unitType">Unit Type</Label>
                      <Select
                        value={formConfig.unitType}
                        onValueChange={(value) => setFormConfig(prev => ({ ...prev, unitType: value }))}
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
                          <SelectItem value="Penthouse">Penthouse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tower */}
                    <div className="space-y-2">
                      <Label htmlFor="tower">Tower (Optional)</Label>
                      <Input
                        id="tower"
                        value={formConfig.tower}
                        onChange={(e) => setFormConfig(prev => ({ ...prev, tower: e.target.value }))}
                        placeholder="e.g., Tower A"
                      />
                    </div>

                    {/* Area */}
                    <div className="space-y-2">
                      <Label htmlFor="areaSqft">Area (sq ft)</Label>
                      <Input
                        id="areaSqft"
                        type="number"
                        value={formConfig.areaSqft}
                        onChange={(e) => setFormConfig(prev => ({ ...prev, areaSqft: parseInt(e.target.value) || 0 }))}
                        min={100}
                      />
                    </div>

                    {/* Bedrooms & Bathrooms */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          value={formConfig.bedrooms}
                          onChange={(e) => setFormConfig(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || 0 }))}
                          min={0}
                          max={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          value={formConfig.bathrooms}
                          onChange={(e) => setFormConfig(prev => ({ ...prev, bathrooms: parseInt(e.target.value) || 1 }))}
                          min={1}
                          max={10}
                        />
                      </div>
                    </div>

                    {/* Parking & Balconies */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                        <Input
                          id="parkingSpaces"
                          type="number"
                          value={formConfig.parkingSpaces}
                          onChange={(e) => setFormConfig(prev => ({ ...prev, parkingSpaces: parseInt(e.target.value) || 0 }))}
                          min={0}
                          max={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="balconies">Balconies</Label>
                        <Input
                          id="balconies"
                          type="number"
                          value={formConfig.balconies}
                          onChange={(e) => setFormConfig(prev => ({ ...prev, balconies: parseInt(e.target.value) || 0 }))}
                          min={0}
                          max={5}
                        />
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-2">
                      <Label htmlFor="basePrice">Base Price (₹)</Label>
                      <Input
                        id="basePrice"
                        type="number"
                        value={formConfig.basePrice}
                        onChange={(e) => setFormConfig(prev => ({ ...prev, basePrice: parseInt(e.target.value) || 0 }))}
                        min={0}
                        step={100000}
                      />
                      <p className="text-sm text-muted-foreground">
                        Price for the first floor unit
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priceIncrement">Price Increment Per Floor (₹)</Label>
                      <Input
                        id="priceIncrement"
                        type="number"
                        value={formConfig.priceIncrement}
                        onChange={(e) => setFormConfig(prev => ({ ...prev, priceIncrement: parseInt(e.target.value) || 0 }))}
                        min={0}
                        step={10000}
                      />
                      <p className="text-sm text-muted-foreground">
                        Additional price added for each higher floor
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview & Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Total Floors</span>
                      <span className="font-semibold">{formConfig.endFloor - formConfig.startFloor + 1}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Units Per Floor</span>
                      <span className="font-semibold">{formConfig.unitsPerFloor}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Total Units</span>
                      <span className="font-semibold text-lg text-primary">{totalUnits}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Price Range</span>
                      <span className="font-semibold text-sm">
                        ₹{(formConfig.basePrice / 10000000).toFixed(2)}Cr - ₹{((formConfig.basePrice + (formConfig.endFloor - formConfig.startFloor) * formConfig.priceIncrement) / 10000000).toFixed(2)}Cr
                      </span>
                    </div>
                    <div className="pt-4">
                      <Button
                        onClick={handleFormBulkCreate}
                        disabled={loading || totalUnits === 0}
                        className="w-full"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Icon icon="solar:refresh-bold" className="size-4 mr-2 animate-spin" />
                            Creating {totalUnits} Units...
                          </>
                        ) : (
                          <>
                            <Icon icon="solar:add-circle-bold" className="size-4 mr-2" />
                            Create {totalUnits} Units
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Example Unit Numbers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {[...Array(Math.min(5, formConfig.endFloor - formConfig.startFloor + 1))].map((_, i) => {
                        const floor = formConfig.startFloor + i;
                        return (
                          <div key={floor} className="flex items-center justify-between py-1">
                            <span className="text-muted-foreground">Floor {floor}:</span>
                            <span className="font-mono">
                              {floor}01 - {floor}{formConfig.unitsPerFloor.toString().padStart(2, '0')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {errors.length > 0 && (
                  <Card className="border-destructive">
                    <CardHeader>
                      <CardTitle className="text-sm text-destructive">Issues Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1 text-sm">
                        {errors.map((error, i) => (
                          <div key={i} className="text-destructive">
                            • {error}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* CSV Upload */}
          <TabsContent value="csv">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload CSV File</CardTitle>
                    <CardDescription>
                      Upload a CSV file with unit details to add multiple units at once
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <Icon icon="solar:info-circle-bold" className="size-4" />
                      <AlertDescription>
                        Download the CSV template to see the required format and sample data
                      </AlertDescription>
                    </Alert>

                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={handleDownloadTemplate}
                        className="flex-1"
                      >
                        <Icon icon="solar:download-bold" className="size-4 mr-2" />
                        Download CSV Template
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="csvFile">Select CSV File</Label>
                      <Input
                        ref={fileInputRef}
                        id="csvFile"
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                      />
                      {csvFile && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(2)} KB)
                        </p>
                      )}
                    </div>

                    {errors.length > 0 && (
                      <Alert variant="destructive">
                        <Icon icon="solar:danger-circle-bold" className="size-4" />
                        <AlertDescription>
                          <div className="font-semibold mb-2">Errors found in CSV:</div>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {errors.slice(0, 5).map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                            {errors.length > 5 && (
                              <li className="text-muted-foreground">
                                ...and {errors.length - 5} more errors
                              </li>
                            )}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {csvPreview.length > 0 && (
                      <div className="space-y-2">
                        <Label>Preview (First 10 rows)</Label>
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Unit No.</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Floor</TableHead>
                                <TableHead>Area</TableHead>
                                <TableHead>Price</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {csvPreview.map((unit, i) => (
                                <TableRow key={i}>
                                  <TableCell className="font-medium">{unit.unit_number}</TableCell>
                                  <TableCell>{unit.unit_type}</TableCell>
                                  <TableCell>{unit.floor_number}</TableCell>
                                  <TableCell>{unit.area_sqft} sq ft</TableCell>
                                  <TableCell>₹{unit.price.toLocaleString()}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <Button
                        onClick={handleCSVUpload}
                        disabled={!csvFile || loading || errors.length > 0}
                        className="w-full"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Icon icon="solar:refresh-bold" className="size-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Icon icon="solar:upload-bold" className="size-4 mr-2" />
                            Upload & Create Units
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>CSV Format Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Required Fields:</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>unit_number</li>
                        <li>unit_type</li>
                        <li>area_sqft</li>
                        <li>price</li>
                        <li>bedrooms</li>
                        <li>bathrooms</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Optional Fields:</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>floor_number</li>
                        <li>tower</li>
                        <li>parking_spaces</li>
                        <li>balconies</li>
                        <li>is_corner_unit</li>
                        <li>has_terrace</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {csvFile && csvPreview.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm text-muted-foreground">Valid Units</span>
                          <Badge variant="default">{csvPreview.length}</Badge>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm text-muted-foreground">Errors</span>
                          <Badge variant={errors.length > 0 ? "destructive" : "secondary"}>
                            {errors.length}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}