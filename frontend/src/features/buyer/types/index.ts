// Buyer types exports
export * from './buyer';
export * from './favorites';
export * from './savedSearches';

// Re-export commonly used types from shared API
export type { User } from '@/shared/lib/api';
export type { Property, PropertyImage } from '@/features/property/types';