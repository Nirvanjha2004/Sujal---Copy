import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Layout } from '@/shared/components/layout/Layout';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { EditUnitDialog } from '../components/EditUnitDialog';
import  projectService  from '../services/projectService';
import { toast } from 'react-hot-toast';

export function ProjectUnitsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [unitTypeFilter, setUnitTypeFilter] = useState('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  useEffect(() => {
    fetchProjectDetails();
    fetchUnits();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await projectService.getProject(parseInt(id!));
      if (response.success) {
        setProject(response.data.project);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
      toast.error('Failed to load project details');
    }
  };

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (unitTypeFilter && unitTypeFilter !== 'all') {
        params.unitType = unitTypeFilter;
      }

      const response = await projectService.getUnits(parseInt(id!), params);
      if (response.success) {
        setUnits(response.data.units);
      }
    } catch (error) {
      console.error('Failed to fetch units:', error);
      toast.error('Failed to load units');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [statusFilter, unitTypeFilter]);

  const handleEditUnit = (unitId: number) => {
    setSelectedUnitId(unitId);
    setEditDialogOpen(true);
  };

  const handleDeleteUnit = (unitId: number) => {
    setSelectedUnitId(unitId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUnit = async () => {
    if (!selectedUnitId) return;

    try {
      const response = await projectService.deleteUnit(parseInt(id!), selectedUnitId);
      
      if (response.success) {
        toast.success('Unit deleted successfully');
        fetchUnits();
        fetchProjectDetails();
      }
    } catch (error: any) {
      console.error('Failed to delete unit:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to delete unit');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedUnitId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-gray-100 text-gray-800';
      case 'blocked':
        return 'bg-yellow-100 text-yellow-800';
      case 'reserved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.unit_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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

        {project && (
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">
              {project.name} - Units
            </h1>
            <p className="text-muted-foreground">
              <Icon icon="solar:map-point-bold" className="size-4 inline mr-1" />
              {project.location}
            </p>
          </div>
        )}

        {/* Stats Cards */}
        {project && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-full">
                    <Icon icon="solar:home-2-bold" className="size-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{filteredUnits.length}</p>
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
                  <div className="p-3 bg-gray-100 text-gray-600 rounded-full">
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
                  <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                    <Icon icon="solar:lock-bold" className="size-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{project.blocked_units}</p>
                    <p className="text-sm font-medium">Blocked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-4 w-full md:w-auto">
                <div className="flex-1 max-w-sm">
                  <Input
                    placeholder="Search units..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={unitTypeFilter} onValueChange={setUnitTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="1BHK">1BHK</SelectItem>
                    <SelectItem value="2BHK">2BHK</SelectItem>
                    <SelectItem value="3BHK">3BHK</SelectItem>
                    <SelectItem value="4BHK">4BHK</SelectItem>
                    <SelectItem value="Penthouse">Penthouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/builder/projects/${id}/bulk-units`)}
                >
                  <Icon icon="solar:document-add-bold" className="size-4 mr-2" />
                  Bulk Add Units
                </Button>
                <Button onClick={() => navigate(`/builder/projects/${id}/units/new`)}>
                  <Icon icon="solar:add-circle-bold" className="size-4 mr-2" />
                  Add Unit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Units Table */}
        <Card>
          <CardHeader>
            <CardTitle>Units ({filteredUnits.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-primary" />
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="text-center py-12">
                <Icon icon="solar:home-2-bold" className="size-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No units found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all' || unitTypeFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Start by adding units to this project'}
                </p>
                {!searchTerm && statusFilter === 'all' && unitTypeFilter === 'all' && (
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => navigate(`/builder/projects/${id}/units/new`)}>
                      <Icon icon="solar:add-circle-bold" className="size-4 mr-2" />
                      Add Unit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/builder/projects/${id}/bulk-units`)}
                    >
                      <Icon icon="solar:document-add-bold" className="size-4 mr-2" />
                      Bulk Add
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Floor</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUnits.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium">{unit.unit_number}</TableCell>
                        <TableCell>{unit.unit_type}</TableCell>
                        <TableCell>{unit.floor_number}</TableCell>
                        <TableCell>{unit.area_sqft} sq ft</TableCell>
                        <TableCell>₹{unit.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(unit.status)}>
                            {unit.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Icon icon="solar:menu-dots-bold" className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUnit(unit.id)}>
                                <Icon icon="solar:pen-bold" className="size-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteUnit(unit.id)}
                                className="text-red-600"
                              >
                                <Icon icon="solar:trash-bin-trash-bold" className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        {selectedUnitId && (
          <EditUnitDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            projectId={parseInt(id!)}
            unitId={selectedUnitId}
            onSuccess={() => {
              fetchUnits();
              fetchProjectDetails();
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the unit from your project.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteUnit} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}