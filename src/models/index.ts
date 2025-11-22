// Core models - exported in proper loading order
export { User, UserRole } from './User';
export { Property, PropertyType, ListingType, PropertyStatus, PropertyAmenities } from './Property';
export { PropertyImage } from './PropertyImage';
export { Inquiry, InquiryStatus } from './Inquiry';
export { UserFavorite } from './UserFavorite';
export { SavedSearch, SearchCriteria } from './SavedSearch';
export { Message } from './Message';
export { Conversation } from './Conversation';
export { ConversationParticipant } from './ConversationParticipant';

// Optional models
export { default as Review } from './Review';
export { default as UrlRedirect } from './UrlRedirect';
export { default as CmsContent } from './CmsContent';

// Database configuration
export { default as sequelize, connectDatabase } from '../config/database';

// Associations
export { defineAssociations } from './associations';