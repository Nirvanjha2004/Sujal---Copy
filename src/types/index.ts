// Common response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Re-export shared auth types
export * from '../shared/types/auth';

// Property related types
export interface Property {
  id: number;
  userId: number;
  title: string;
  description?: string;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  price: number;
  areaSqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  isFeatured: boolean;
  isActive: boolean;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  COMMERCIAL = 'commercial',
  LAND = 'land',
  VILLA = 'villa',
  OFFICE = 'office',
  SHOP = 'shop',
  WAREHOUSE = 'warehouse',
}

export enum ListingType {
  SALE = 'sale',
  RENT = 'rent',
}

export enum PropertyStatus {
  NEW = 'new',
  RESALE = 'resale',
  UNDER_CONSTRUCTION = 'under_construction',
  ACTIVE = 'active',
  SOLD = 'sold',
  RENTED = 'rented',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

// Database connection types
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// JWT payload types are now imported from shared auth types

// Request types with user context
import { Request } from 'express';
import { JwtPayload } from '../shared/types/auth';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// Search and filter types
export interface PropertySearchFilters {
  propertyType?: PropertyType;
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  state?: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  sortBy?: 'price' | 'date' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  userId?: number; // For tracking search history
  keywords?: string; // For keyword search
  isActive?: boolean; // For filtering active/inactive properties
  status?: PropertyStatus; // For filtering by property status
}

// File upload types
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}