// Re-export all services for easy importing
export { default as PropertyService } from './propertyService';
export { default as UserService } from './userService';
export { default as AuthService } from './authService';
export { default as VisitService } from './visitService';
export { default as ProjectService } from './projectService';
export { default as AdminService } from './adminService';
export { default as FileUploadService } from './fileUploadService';

// Dashboard services are now available from the dashboard feature module
// Import from: @/features/dashboard/services