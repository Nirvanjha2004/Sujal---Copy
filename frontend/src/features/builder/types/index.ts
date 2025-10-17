// Project types
export interface Project {
  id: number;
  builder_id: number;
  name: string;
  description?: string;
  location: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  project_type: ProjectType;
  status: ProjectStatus;
  total_units: number;
  available_units: number;
  sold_units: number;
  blocked_units: number;
  start_date?: string;
  expected_completion?: string;
  actual_completion?: string;
  rera_number?: string;
  approval_status: string;
  amenities?: string[];
  specifications?: Record<string, any>;
  pricing?: Record<string, any>;
  floor_plans?: string[];
  brochure_url?: string;
  video_url?: string;
  virtual_tour_url?: string;
  is_active: boolean;
  featured: boolean;
  images?: ProjectImage[];
  created_at: string;
  updated_at: string;
}

export interface ProjectImage {
  id: number;
  project_id: number;
  image_url: string;
  caption?: string;
  alt_text?: string;
  is_primary?: boolean;
  display_order?: number;
  created_at: string;
}

export interface ProjectUnit {
  id: number;
  project_id: number;
  unit_number: string;
  unit_type: string;
  floor_number: number;
  tower?: string;
  area_sqft: number;
  area_sqm?: number;
  carpet_area?: number;
  built_up_area?: number;
  super_built_up_area?: number;
  price: number;
  price_per_sqft: number;
  maintenance_charge?: number;
  parking_spaces?: number;
  balconies?: number;
  bathrooms: number;
  bedrooms: number;
  facing?: string;
  status: UnitStatus;
  is_corner_unit?: boolean;
  has_terrace?: boolean;
  specifications?: Record<string, any>;
  amenities?: string[];
  created_at: string;
  updated_at: string;
}

// Enums
export type ProjectType = 
  | 'residential' 
  | 'commercial' 
  | 'mixed_use' 
  | 'villa' 
  | 'apartment' 
  | 'office' 
  | 'retail';

export type ProjectStatus = 
  | 'planning' 
  | 'pre_launch' 
  | 'under_construction' 
  | 'ready_to_move' 
  | 'completed' 
  | 'on_hold';

export type UnitStatus = 
  | 'available' 
  | 'blocked' 
  | 'sold' 
  | 'reserved' 
  | 'under_construction';

// Form data types
export interface CreateProjectData {
  name: string;
  description?: string;
  location: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  projectType: ProjectType;
  startDate?: string;
  expectedCompletion?: string;
  reraNumber?: string;
  amenities?: string[];
  specifications?: Record<string, any>;
  pricing?: Record<string, any>;
}

export interface CreateUnitData {
  unitNumber: string;
  unitType: string;
  floorNumber: number;
  tower?: string;
  areaSqft: number;
  areaSqm?: number;
  carpetArea?: number;
  builtUpArea?: number;
  superBuiltUpArea?: number;
  price: number;
  pricePerSqft?: number;
  maintenanceCharge?: number;
  parkingSpaces?: number;
  balconies?: number;
  bathrooms: number;
  bedrooms: number;
  facing?: string;
  status?: UnitStatus;
  isCornerUnit?: boolean;
  hasTerrace?: boolean;
  specifications?: Record<string, any>;
  amenities?: string[];
}

// API response types
export interface ProjectsResponse {
  success: boolean;
  data: {
    projects: Project[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: {
    message: string;
    details?: any;
  };
}

export interface ProjectResponse {
  success: boolean;
  data: {
    project: Project;
  };
  error?: {
    message: string;
    details?: any;
  };
}

export interface UnitsResponse {
  success: boolean;
  data: {
    units: ProjectUnit[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: {
    message: string;
    details?: any;
  };
}

export interface UnitResponse {
  success: boolean;
  data: {
    unit: ProjectUnit;
  };
  error?: {
    message: string;
    details?: any;
  };
}

// Filter and search types
export interface ProjectFilters {
  status?: ProjectStatus | 'all';
  project_type?: ProjectType | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

export interface UnitFilters {
  status?: UnitStatus | 'all';
  unitType?: string | 'all';
  floorNumber?: number;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  page?: number;
  limit?: number;
}

// Analytics types
export interface ProjectAnalytics {
  totalUnits: number;
  availableUnits: number;
  soldUnits: number;
  blockedUnits: number;
  reservedUnits: number;
  totalRevenue: number;
  averagePrice: number;
  averagePricePerSqft: number;
  salesVelocity: number;
  completionPercentage: number;
  unitTypeDistribution: Record<string, number>;
  floorWiseSales: Record<string, number>;
  monthlyBookings: Array<{
    month: string;
    bookings: number;
    revenue: number;
  }>;
}

// Bulk operations
export interface BulkUnitData {
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

export interface BulkCreateResponse {
  success: boolean;
  data: {
    count: number;
    units: ProjectUnit[];
    errors?: Array<{
      row: number;
      error: string;
    }>;
  };
  error?: {
    message: string;
    details?: any;
  };
}