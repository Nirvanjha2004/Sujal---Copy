// Re-export auth types from dedicated auth feature module
export * from '@/features/auth/types';

// Re-export property types from dedicated property feature module
export type {
  Property,
  PropertyType,
  ListingType,
  PropertyStatus,
  PropertyImage,
  PropertyImageType,
  PropertyStats,
  PropertyFeature,
  LocationData,
  PropertyFilters,
  SearchCriteria,
  SavedSearch,
  PropertyAnalytics,
  MarketInsights,
  PerformanceMetrics,
  PaginatedResponse as PropertyPaginatedResponse,
  ApiResponse as PropertyApiResponse
} from '@/features/property/types';

// LocationData is already exported above

// Re-export dashboard types from dedicated dashboard feature module
export * from '@/features/dashboard/types';

// Standardized API response format
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Inquiry types - match backend
export type InquiryStatus = 'new' | 'contacted' | 'closed';

export interface Inquiry {
  id: number;
  property_id?: number;
  project_id?: number;
  inquirer_id?: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: InquiryStatus;
  conversation_id?: number;
  created_at: string;
  
  // Related data will be typed when used in specific contexts
  property?: any;
  project?: any;
  inquirer?: any;
}

// PropertyFilters is now exported from property feature module

// Visit Types
export interface SiteVisit {
  id: number;
  propertyId: number;
  visitorId: number;
  agentId: number;
  visitDate: string;
  visitTime: string;
  status: VisitStatus;
  visitorNotes?: string;
  agentNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type VisitStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'no_show';

// Project enums - match backend exactly
export type ProjectStatus = 'planning' | 'pre_launch' | 'under_construction' | 'ready_to_move' | 'completed' | 'on_hold';
export type ProjectType = 'residential' | 'commercial' | 'mixed_use' | 'villa' | 'apartment' | 'office' | 'retail';

// Project interface - matches backend API response
export interface Project {
  id: number;
  builder_id: number;        // Backend field name
  name: string;
  description?: string;
  location: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  project_type: ProjectType; // Backend field name
  status: ProjectStatus;
  total_units: number;       // Backend field name
  available_units: number;   // Backend field name
  sold_units: number;        // Backend field name
  blocked_units: number;     // Backend field name
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
  is_active: boolean;        // Backend field name
  featured: boolean;
  created_at: string;        // Backend field name
  updated_at: string;        // Backend field name
  
  // Related data
  images?: ProjectImage[];
  units?: ProjectUnit[];
}

export interface ProjectImage {
  id: number;
  project_id: number;
  image_url: string;
  alt_text?: string;
  image_type: 'exterior' | 'interior' | 'amenity' | 'floor_plan' | 'site_plan' | 'location' | 'gallery';
  is_primary: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Utility functions for backward compatibility  
export const getProjectBuilderId = (project: Project): number => project.builder_id;
export const getProjectType = (project: Project): ProjectType => project.project_type;
export const getProjectTotalUnits = (project: Project): number => project.total_units;
export const getProjectAvailableUnits = (project: Project): number => project.available_units;
export const getProjectSoldUnits = (project: Project): number => project.sold_units;
export const getProjectBlockedUnits = (project: Project): number => project.blocked_units;
export const getProjectIsActive = (project: Project): boolean => project.is_active;
export const getProjectCreatedAt = (project: Project): string => project.created_at;
export const getProjectUpdatedAt = (project: Project): string => project.updated_at;

export interface ProjectUnit {
  id: number;
  projectId: number;
  unitNumber: string;
  unitType: string;
  area: number;
  price: number;
  floor: number;
  status: UnitStatus;
  amenities: string[];
}

export type UnitStatus = 'available' | 'sold' | 'reserved' | 'blocked';