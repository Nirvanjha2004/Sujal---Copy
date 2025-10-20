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

// Import LocationData for use in Project interface
import type { LocationData } from '@/features/property/types';

// Re-export dashboard types from dedicated dashboard feature module
export * from '@/features/dashboard/types';

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