# Frontend Type Fixes - Complete Guide

## Overview
This document provides comprehensive instructions to fix all type mismatches between the backend API and frontend TypeScript definitions. The main issues stem from inconsistent field naming conventions and missing type alignments.

## Critical Type Mismatches Identified

### 1. User Model Type Inconsistencies

**Backend User Model** (`src/models/User.ts`):
- Uses `first_name`, `last_name` (snake_case)  
- Uses `password_hash`, `is_verified`, `is_active`
- Uses `created_at`, `updated_at`

**Frontend User Types** (`frontend/src/features/auth/types/user.ts`):
- Uses both `firstName`/`first_name`, `lastName`/`last_name` (mixed)
- Missing `password_hash`, uses inconsistent boolean fields
- Uses `createdAt`, `updatedAt` (camelCase)

### 2. Property Model Type Inconsistencies

**Backend Property Model** (`src/models/Property.ts`):
- Field names: `property_type`, `listing_type`, `area_sqft`, `user_id`
- Enums: `PropertyType`, `ListingType`, `PropertyStatus` 
- Uses `is_active`, `is_featured`, `created_at`, `updated_at`

**Frontend Property Types**:
- Mixed naming: `propertyType`/`property_type`, `listingType`/`listing_type`
- Inconsistent enum usage and field mapping

### 3. Project Model Type Inconsistencies

**Backend Project Model** (`src/models/Project.ts`):
- Uses standard Sequelize model structure
- Field names: `builder_id`, `project_type`, `total_units`, `available_units`

**Frontend Project Types**:
- Uses different interface structure with mixed naming conventions

## Fix Instructions

### Step 1: Update User Types

**File**: `frontend/src/features/auth/types/user.ts`

Replace the entire content with:

```typescript
// User-related type definitions aligned with backend

export type UserRole = 'buyer' | 'owner' | 'agent' | 'builder' | 'admin';

export interface User {
  id: number;
  email: string;
  first_name: string;    // Backend field name
  last_name: string;     // Backend field name
  phone?: string;
  role: UserRole;
  profile_image?: string;
  is_verified: boolean;  // Backend field name
  is_active: boolean;    // Backend field name
  created_at: string;    // Backend field name (ISO string)
  updated_at: string;    // Backend field name (ISO string)
  
  // Computed properties for backward compatibility
  get firstName(): string { return this.first_name; }
  get lastName(): string { return this.last_name; }
  get isVerified(): boolean { return this.is_verified; }
  get isActive(): boolean { return this.is_active; }
  get createdAt(): string { return this.created_at; }
  get updatedAt(): string { return this.updated_at; }
}

// For form submissions - use frontend naming
export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profile_image?: string;
}

// API response format - matches backend exactly
export interface UserApiResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  profile_image?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Step 2: Update Property Types

**File**: `frontend/src/features/property/types/property.ts`

Update to match backend exactly:

```typescript
// Enums - must match backend exactly
export type PropertyType = 'apartment' | 'house' | 'villa' | 'plot' | 'commercial' | 'land';
export type ListingType = 'sale' | 'rent';
export type PropertyStatus = 'new' | 'resale' | 'under_construction' | 'rented' | 'sold' | 'pending' | 'active';

// Backend amenities interface
export interface PropertyAmenities {
  parking?: boolean;
  gym?: boolean;
  swimming_pool?: boolean;
  garden?: boolean;
  security?: boolean;
  elevator?: boolean;
  power_backup?: boolean;
  water_supply?: boolean;
  internet?: boolean;
  air_conditioning?: boolean;
  furnished?: boolean;
  pet_friendly?: boolean;
  balcony?: boolean;
  terrace?: boolean;
  club_house?: boolean;
  playground?: boolean;
  [key: string]: boolean | undefined;
}

// Core Property interface - matches backend API response
export interface Property {
  id: number;
  user_id: number;          // Backend field name
  title: string;
  description?: string;
  property_type: PropertyType;  // Backend field name
  listing_type: ListingType;    // Backend field name
  status: PropertyStatus;
  price: number;
  area_sqft?: number;       // Backend field name
  bedrooms?: number;
  bathrooms?: number;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  amenities: PropertyAmenities;  // JSON field in backend
  is_active: boolean;       // Backend field name
  is_featured: boolean;     // Backend field name
  created_at: string;       // Backend field name
  updated_at: string;       // Backend field name
  expires_at?: string;      // Backend field name
  
  // Related data
  images?: PropertyImage[];
  owner?: UserApiResponse;
  inquiries?: any[];
  
  // Computed properties for backward compatibility
  get userId(): number { return this.user_id; }
  get propertyType(): PropertyType { return this.property_type; }
  get listingType(): ListingType { return this.listing_type; }
  get areaSqft(): number | undefined { return this.area_sqft; }
  get isActive(): boolean { return this.is_active; }
  get isFeatured(): boolean { return this.is_featured; }
  get createdAt(): string { return this.created_at; }
  get updatedAt(): string { return this.updated_at; }
}

// Property Image - matches backend
export interface PropertyImage {
  id: number;
  property_id: number;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// For form submissions - uses frontend naming
export interface CreatePropertyRequest {
  title: string;
  description?: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  areaSqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  amenities: PropertyAmenities;
}
```

### Step 3: Update Project Types

**File**: `frontend/src/shared/types/index.ts`

Replace the Project interface:

```typescript
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
  
  // Computed properties for backward compatibility  
  get builderId(): number { return this.builder_id; }
  get projectType(): ProjectType { return this.project_type; }
  get totalUnits(): number { return this.total_units; }
  get availableUnits(): number { return this.available_units; }
  get soldUnits(): number { return this.sold_units; }
  get blockedUnits(): number { return this.blocked_units; }
  get isActive(): boolean { return this.is_active; }
  get createdAt(): string { return this.created_at; }
  get updatedAt(): string { return this.updated_at; }
}
```

### Step 4: Update API Response Types

**File**: `frontend/src/shared/types/index.ts`

Add standardized API response types:

```typescript
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
  
  // Related data
  property?: Property;
  project?: Project;
  inquirer?: UserApiResponse;
}
```

### Step 5: Update Shared API Library

**File**: `frontend/src/shared/lib/api.ts`

Replace the Property interface (lines 6-32) with:

```typescript
// Import standardized types
import type { Property, PropertyImage, Project, ProjectUnit, UserApiResponse, ApiResponse } from '@/shared/types';

// Remove duplicate Property interface definition
// Use the one from shared types instead

// Update any API functions to use correct field names
export const api = {
  // Login function - handle backend response format
  async login(email: string, password: string) {
    const response = await apiRequest<ApiResponse<{
      user: UserApiResponse;
      tokens: { accessToken: string; refreshToken: string; };
    }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    return response.data;
  },
  
  // Get properties - handle backend response format
  async getProperties(filters?: any) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiRequest<ApiResponse<Property[]>>(`/properties?${queryParams}`);
    return response.data || [];
  },
  
  // Create property - transform frontend data to backend format
  async createProperty(propertyData: CreatePropertyRequest) {
    const backendData = {
      title: propertyData.title,
      description: propertyData.description,
      property_type: propertyData.propertyType,
      listing_type: propertyData.listingType,
      price: propertyData.price,
      area_sqft: propertyData.areaSqft,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      address: propertyData.address,
      city: propertyData.city,
      state: propertyData.state,
      pincode: propertyData.pincode,
      latitude: propertyData.latitude,
      longitude: propertyData.longitude,
      amenities: propertyData.amenities
    };
    
    const response = await apiRequest<ApiResponse<Property>>('/properties', {
      method: 'POST',
      body: JSON.stringify(backendData)
    });
    
    return response.data;
  }
};
```

### Step 6: Fix File Extensions for JSX

Rename these files to have `.tsx` extensions:

1. `src/shared/hooks/useKeyboardShortcuts.ts` → `useKeyboardShortcuts.tsx`
2. `src/shared/utils/lazyImports.ts` → `lazyImports.tsx`  
3. `src/shared/utils/performance.ts` → `performance.tsx`

### Step 7: Update Auth Slice

**File**: `frontend/src/store/slices/authSlice.ts`

Update to handle backend response format:

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/shared/lib/api';
import { UserApiResponse } from '@/shared/types';
import { setToken, clearToken, getValidToken } from '@/features/auth/utils';

interface AuthState {
  user: UserApiResponse | null;  // Use backend format
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Update async thunks to handle backend response format
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.login(email, password);
      setToken(response.tokens.accessToken);
      return {
        user: response.user,
        token: response.tokens.accessToken
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);
```

### Step 8: Update Component Prop Types

For any components that use User or Property data, update their prop types:

```typescript
// Example component update
interface PropertyCardProps {
  property: Property;  // Now uses backend-aligned Property type
  onFavorite?: (id: number) => void;
}

// Access fields using backend naming
const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <div>
      <h3>{property.title}</h3>
      <p>Type: {property.property_type}</p>  {/* Backend field name */}
      <p>Price: {property.price}</p>
      <p>Area: {property.area_sqft} sqft</p>  {/* Backend field name */}
    </div>
  );
};
```

## Validation Commands

After implementing all fixes:

1. **Type Check**: `npm run type-check`
2. **Build Check**: `npm run build`  
3. **Linting**: `npm run lint`

## Migration Strategy

1. **Phase 1**: Update all type definitions (Steps 1-4)
2. **Phase 2**: Fix file extensions (Step 6)  
3. **Phase 3**: Update API layer (Step 5)
4. **Phase 4**: Update state management (Step 7)
5. **Phase 5**: Update components (Step 8)
6. **Phase 6**: Test and validate

## Common Patterns

### Data Transformation Utilities

Create utility functions for transforming between frontend/backend formats:

```typescript
// frontend/src/utils/dataTransforms.ts
export const transformUserForDisplay = (user: UserApiResponse): DisplayUser => ({
  id: user.id,
  email: user.email,
  name: `${user.first_name} ${user.last_name}`,
  role: user.role,
  isVerified: user.is_verified
});

export const transformPropertyForAPI = (property: PropertyFormData): PropertyApiData => ({
  title: property.title,
  property_type: property.propertyType,
  listing_type: property.listingType,
  area_sqft: property.areaSqft,
  // ... rest of transformations
});
```

This approach maintains clean separation between frontend display logic and backend API contracts while ensuring type safety throughout the application.