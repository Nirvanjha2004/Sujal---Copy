// Buyer services exports
export { favoritesService } from './favoritesService';
export { savedSearchesService } from './savedSearchesService';
export { buyerService } from './buyerService';
export { propertySearchService } from './propertySearchService';

// Re-export types for convenience
export type { FavoritesResponse, FavoritesApiResponse } from './favoritesService';
export type { SavedSearchesResponse } from './savedSearchesService';
export type { 
  PropertySearchResponse, 
  SearchSuggestion, 
  FilterOption, 
  FilterOptions 
} from './propertySearchService';