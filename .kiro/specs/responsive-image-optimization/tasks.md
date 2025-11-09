# Implementation Plan

- [ ] 1. Update PropertyGallery component for responsive images



  - Update main image display to use `large_url` with srcset
  - Update thumbnail strip to use `thumbnail_url` with srcset
  - Update lightbox modal to use `large_url` with srcset
  - Add proper fallback handling using imageUtils functions
  - Ensure lazy loading is enabled




  - _Requirements: 1.4, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4_

- [ ] 2. Update high-priority property list components
- [ ] 2.1 Update FeaturedProperties component
  - Import imageUtils helper functions
  - Update image rendering to use `large_url` via getContextualImage with 'detail' context


  - Add srcset using getImageSrcSet function
  - Add sizes attribute using getImageSizes function
  - Ensure lazy loading attribute is present
  - _Requirements: 1.3, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2_

- [x] 2.2 Update SearchResults component

  - Import imageUtils helper functions
  - Update image rendering to use `medium_url` via getContextualImage with 'grid' context
  - Add srcset using getImageSrcSet function
  - Add sizes attribute using getImageSizes function
  - Ensure lazy loading attribute is present
  - _Requirements: 1.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2_




- [ ] 2.3 Update PropertyOverview component
  - Import imageUtils helper functions
  - Update main image to use `large_url` via getContextualImage with 'detail' context
  - Update gallery thumbnails to use `thumbnail_url` via getContextualImage with 'thumbnail' context
  - Add srcset and sizes attributes
  - Ensure lazy loading is enabled

  - _Requirements: 1.4, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2_

- [ ] 3. Update landing page components
- [ ] 3.1 Update PropertyListingPage component
  - Import imageUtils helper functions
  - Update property card images to use `medium_url` via getContextualImage with 'grid' context
  - Add srcset using getImageSrcSet function

  - Add sizes attribute using getImageSizes function
  - Ensure lazy loading is enabled
  - _Requirements: 2.1, 2.5, 2.6, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 3.2 Update PropertyListingGrid component
  - Import imageUtils helper functions
  - Update grid item images to use `medium_url` via getContextualImage with 'grid' context

  - Add srcset using getImageSrcSet function
  - Add sizes attribute using getImageSizes function
  - Ensure lazy loading is enabled
  - _Requirements: 2.2, 2.5, 2.6, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 3.3 Update PropertyListingGrid2 component



  - Import imageUtils helper functions
  - Update grid item images to use `medium_url` via getContextualImage with 'grid' context
  - Add srcset using getImageSrcSet function
  - Add sizes attribute using getImageSizes function
  - Ensure lazy loading is enabled
  - _Requirements: 2.3, 2.5, 2.6, 5.1, 5.2, 5.3, 5.4, 5.5_


- [ ] 3.4 Update RealEstateLandingPage2 component
  - Import imageUtils helper functions
  - Update property images to use appropriate sizes based on context
  - Add srcset using getImageSrcSet function
  - Add sizes attribute using getImageSizes function
  - Ensure lazy loading is enabled
  - _Requirements: 2.4, 2.5, 2.6, 5.1, 5.2, 5.3, 5.4, 5.5_


- [ ] 4. Update dashboard components
- [ ] 4.1 Update MyPropertiesPage component
  - Import imageUtils helper functions
  - Update property thumbnails to use `thumbnail_url` via getContextualImage with 'thumbnail' context
  - Add srcset using getImageSrcSet function
  - Add sizes attribute using getImageSizes function

  - Ensure consistent aspect ratios
  - _Requirements: 3.1, 3.5, 3.6, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 4.2 Update BuyerDashboardContent component
  - Import imageUtils helper functions
  - Update favorite property thumbnails to use `thumbnail_url` via getContextualImage with 'thumbnail' context



  - Add srcset using getImageSrcSet function
  - Add sizes attribute using getImageSizes function
  - Ensure consistent aspect ratios
  - _Requirements: 3.2, 3.5, 3.6, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4.3 Update AgentDashboardContent component

  - Import imageUtils helper functions
  - Update listing thumbnails to use `thumbnail_url` via getContextualImage with 'thumbnail' context
  - Add srcset using getImageSrcSet function
  - Add sizes attribute using getImageSizes function
  - Ensure consistent aspect ratios



  - _Requirements: 3.3, 3.5, 3.6, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 4.4 Update OwnerDashboardContent component
  - Import imageUtils helper functions
  - Update property thumbnails to use `thumbnail_url` via getContextualImage with 'thumbnail' context
  - Add srcset using getImageSrcSet function

  - Add sizes attribute using getImageSizes function
  - Ensure consistent aspect ratios
  - _Requirements: 3.4, 3.5, 3.6, 5.1, 5.2, 5.3, 5.4, 5.5_




- [ ] 5. Update admin and moderation components
- [ ] 5.1 Update PropertyModerationPage component
  - Import imageUtils helper functions
  - Update moderation queue thumbnails to use `thumbnail_url` via getContextualImage with 'thumbnail' context
  - Add srcset using getImageSrcSet function
  - Add appropriate fallback handling
  - _Requirements: 4.1, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 5.2 Update BulkUploadPage component
  - Import imageUtils helper functions
  - Update upload preview thumbnails to use `thumbnail_url` via getContextualImage with 'thumbnail' context
  - Add srcset using getImageSrcSet function
  - Add appropriate fallback handling
  - _Requirements: 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6. Update any remaining PropertyCard variants
- [ ] 6.1 Verify all PropertyCard components use contextual images
  - Check PropertyCard in features/property/components/common
  - Check PropertyCard in components/property (if exists)
  - Ensure all variants (grid, list) use appropriate image sizes
  - Verify srcset and sizes attributes are present
  - _Requirements: 1.1, 1.2, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6.2 Update ProjectImageUpload component if needed
  - Check if component displays property images
  - Update to use `thumbnail_url` for previews if applicable
  - Add appropriate fallback handling
  - _Requirements: 5.1, 5.2, 5.6, 6.1, 6.2, 6.3_

- [ ] 7. Verify and test implementation
- [ ] 7.1 Test high-priority components
  - Test PropertyGallery on property detail pages
  - Test FeaturedProperties on home page
  - Test SearchResults on search page
  - Test PropertyOverview on detail pages
  - Verify images load correctly on desktop and mobile
  - Verify srcset provides appropriate images
  - Verify fallback works for legacy data
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 7.2 Test landing page components
  - Test PropertyListingPage
  - Test PropertyListingGrid
  - Test PropertyListingGrid2
  - Test RealEstateLandingPage2
  - Verify lazy loading works
  - Verify performance improvements
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 7.3 Test dashboard components
  - Test MyPropertiesPage
  - Test BuyerDashboardContent
  - Test AgentDashboardContent
  - Test OwnerDashboardContent
  - Verify thumbnails load quickly
  - Verify consistent aspect ratios
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 7.1, 7.2, 7.3, 7.4_

- [ ] 7.4 Test admin components
  - Test PropertyModerationPage
  - Test BulkUploadPage
  - Verify thumbnails load correctly
  - Verify fallback handling works
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.3, 6.4_

- [ ] 7.5 Perform cross-browser testing
  - Test in Chrome (latest)
  - Test in Firefox (latest)
  - Test in Safari (latest)
  - Test in Edge (latest)
  - Test on mobile browsers (iOS Safari, Chrome Mobile)
  - Verify consistent behavior across browsers
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 7.6 Verify performance improvements
  - Measure page load times before and after
  - Check Lighthouse performance scores
  - Verify bandwidth reduction in Network tab
  - Verify LCP improvements
  - Verify smaller images served on mobile
  - Document performance metrics
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
