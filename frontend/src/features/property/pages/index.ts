// Property Pages - Main exports for the property feature
export { PropertyListingPage } from './PropertyListingPage';
export { PropertyListingGrid } from './PropertyListingGrid';
export { PropertySearchPage } from './PropertySearchPage';
export { PropertyDetailsPage } from './PropertyDetailsPage';
export { AddPropertyPage } from './AddPropertyPage';
export { EditPropertyPage } from './EditPropertyPage';
export { MyPropertiesPage } from './MyPropertiesPage';
export { PropertyComparisonPage } from './PropertyComparisonPage';

// Backward compatibility exports - maintain existing import paths
// These allow existing code to continue working while we migrate
export { PropertyListingPage as PropertyListing } from './PropertyListingPage';
export { PropertyListingGrid as PropertyGrid } from './PropertyListingGrid';
export { PropertySearchPage as PropertySearch } from './PropertySearchPage';
export { PropertyDetailsPage as PropertyDetails } from './PropertyDetailsPage';
export { AddPropertyPage as AddProperty } from './AddPropertyPage';
export { EditPropertyPage as EditProperty } from './EditPropertyPage';
export { MyPropertiesPage as MyProperties } from './MyPropertiesPage';
export { PropertyComparisonPage as PropertyComparison } from './PropertyComparisonPage';

// Type exports for pages
export type { Property } from '../types/property';
export type { PropertyFilters } from '../types/filters';
export type { PropertySearchCriteria } from '../types/search';