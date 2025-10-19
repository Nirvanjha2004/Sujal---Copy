// Re-export all hooks for easy importing
export { default as useProperties } from './useProperties';
export { default as useAuth } from './useAuth';
export { default as useLocalStorage } from './useLocalStorage';
export { default as useDebounce } from './useDebounce';
export { default as usePagination } from './usePagination';
export { default as useFileUpload } from './useFileUpload';
export { default as useVisits } from './useVisits';

// Dashboard hooks are now available from the dashboard feature module
// Import from: @/features/dashboard/hooks