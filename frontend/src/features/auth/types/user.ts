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
}

// Utility functions for backward compatibility
export const getUserDisplayName = (user: User): string => 
  `${user.first_name} ${user.last_name}`;

export const getUserFirstName = (user: User): string => user.first_name;
export const getUserLastName = (user: User): string => user.last_name;
export const getUserIsVerified = (user: User): boolean => user.is_verified;
export const getUserIsActive = (user: User): boolean => user.is_active;
export const getUserCreatedAt = (user: User): string => user.created_at;
export const getUserUpdatedAt = (user: User): string => user.updated_at;

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