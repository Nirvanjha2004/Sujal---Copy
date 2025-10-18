// Re-export auth types from dedicated auth feature module
export * from '@/features/auth/types';

// Property Types
export interface Property {
  id: number;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  location: LocationData;
  amenities: string[];
  images: PropertyImage[];
  isActive: boolean;
  isFeatured: boolean;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export type PropertyType = 'apartment' | 'house' | 'villa' | 'plot' | 'commercial';
export type ListingType = 'sale' | 'rent';

export interface LocationData {
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyImage {
  id: number;
  url: string;
  alt: string;
  isPrimary: boolean;
}

// Dashboard Types
export interface DashboardStats {
  buyer: BuyerStats;
  owner: OwnerStats;
  agent: AgentStats;
  builder: BuilderStats;
}

export interface BuyerStats {
  savedProperties: number;
  savedSearches: number;
  messages: number;
}

export interface OwnerStats {
  totalListings: number;
  activeListings: number;
  propertyViews: number;
  inquiries: number;
  messages: number;
}

export interface AgentStats extends OwnerStats {}

export interface BuilderStats {
  totalProjects: number;
  activeProjects: number;
  unitsListed: number;
  unitsAvailable: number;
  totalInquiries: number;
  messages: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface PropertyFilters {
  location?: string;
  propertyType?: PropertyType;
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
}

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

// Project Types (Builder)
export interface Project {
  id: number;
  name: string;
  description: string;
  location: LocationData;
  phase: string;
  status: ProjectStatus;
  totalUnits: number;
  availableUnits: number;
  soldUnits: number;
  builderId: number;
  images: ProjectImage[];
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'upcoming' | 'active' | 'completed' | 'on_hold';

export interface ProjectImage {
  id: number;
  url: string;
  alt: string;
  isPrimary: boolean;
}

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