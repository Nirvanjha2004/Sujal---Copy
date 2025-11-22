// Environment configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 30000,
    retryAttempts: 3,
  },

  // App Configuration
  app: {
    name: 'Real Estate Portal',
    version: '1.0.0',
    description: 'Your trusted partner in real estate',
    supportEmail: 'support@realestate-portal.com',
    supportPhone: '(555) 123-4567',
  },

  // Feature Flags
  features: {
    enableVisitScheduling: true,
    enableBulkUpload: true,
    enableAnalytics: true,
    enableNotifications: true,
    enableChat: true,
    enablePropertyComparison: true,
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    acceptedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxImagesPerProperty: 10,
    maxImagesPerProject: 20,
  },

  // Pagination Configuration
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // Map Configuration
  map: {
    defaultCenter: { lat: 28.6139, lng: 77.2090 }, // Delhi
    defaultZoom: 10,
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  },

  // Theme Configuration
  theme: {
    defaultTheme: 'light',
    availableThemes: ['light', 'dark'],
  },

  // Validation Rules
  validation: {
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    phone: {
      pattern: /^[6-9]\d{9}$/, // Indian mobile number pattern
    },
    pincode: {
      pattern: /^\d{6}$/, // Indian pincode pattern
    },
  },

  // Cache Configuration
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxSize: 100, // Maximum number of cached items
  },

  // Development Configuration
  dev: {
    enableDebugLogs: import.meta.env.DEV,
    enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
    showPerformanceMetrics: import.meta.env.DEV,
  },
} as const;

export default config;