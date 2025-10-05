// Export all models
export { User, UserRole } from './User';
export { Property, PropertyType, ListingType, PropertyStatus, PropertyAmenities } from './Property';
export { PropertyImage } from './PropertyImage';
export { Inquiry, InquiryStatus } from './Inquiry';
export { UserFavorite } from './UserFavorite';
export { SavedSearch, SearchCriteria } from './SavedSearch';

// Export database connection
export { default as sequelize, connectDatabase } from '../config/database';