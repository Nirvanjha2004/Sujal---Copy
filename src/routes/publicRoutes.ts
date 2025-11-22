import { Router } from 'express';

const router = Router();

// Health check for public routes
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Public routes are working',
    timestamp: new Date().toISOString(),
  });
});

// CORS test endpoint
router.get('/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working correctly',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

// Simple properties endpoint for testing
router.get('/properties', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: 'Sample Property',
        description: 'A beautiful sample property',
        price: 500000,
        location: 'Sample City',
        bedrooms: 3,
        bathrooms: 2,
        area: 1200,
        property_type: 'apartment',
        listing_type: 'sale',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ],
    total: 1,
    page: 1,
    limit: 10,
    timestamp: new Date().toISOString(),
  });
});

export default router;