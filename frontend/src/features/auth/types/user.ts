// User-related type definitions

export type UserRole = 'buyer' | 'owner' | 'agent' | 'builder' | 'admin';

export interface User {
  id: number;
  email: string;
  firstName?: string; // Legacy field name
  lastName?: string;  // Legacy field name
  first_name?: string; // Backend field name
  last_name?: string;  // Backend field name
  role: UserRole;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}