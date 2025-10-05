import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import config from './config';
import { connectDatabase } from './config/database';
import RedisConnection from './config/redis';
import {
  helmetConfig,
  corsConfig,
  rateLimitConfig,
  xssProtection,
  sqlInjectionProtection,
} from './middleware/security';
import apiRoutes from './routes';
import PropertyExpirationService from './services/propertyExpirationService';
import CacheManagementService from './services/cacheManagementService';

class App {
  public app: Application;
  private redis: RedisConnection;
  private expirationService: PropertyExpirationService;
  private cacheManagementService: CacheManagementService;

  constructor() {
    this.app = express();
    this.redis = RedisConnection.getInstance();
    this.expirationService = new PropertyExpirationService();
    this.cacheManagementService = new CacheManagementService();

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Basic CORS middleware for development
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const origin = req.headers.origin;
      if (config.server.nodeEnv === 'development') {
        res.header('Access-Control-Allow-Origin', origin || '*');
      }
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
      res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,X-File-Name');

      if (req.method === 'OPTIONS') {
        res.status(204).send();
        return;
      }
      next();
    });

    // Security middlewares
    this.app.use(helmetConfig);
    this.app.use(corsConfig);
    this.app.use(rateLimitConfig);
    this.app.use(xssProtection);
    this.app.use(sqlInjectionProtection);

    // Body parsing middlewares
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Static files
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // Request logging middleware (only in development)
    if (config.server.nodeEnv === 'development') {
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        // Only log API requests, not static files
        if (req.path.startsWith('/api/')) {
          console.log(`📡 ${req.method} ${req.path}`);
        }
        next();
      });
    }
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: config.server.nodeEnv,
        version: '1.0.0',
        documentation: '/api/docs',
      });
    });

    // API routes
    this.app.use('/api', apiRoutes);

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${req.originalUrl} not found`,
          suggestion: 'Check the API documentation at /api/docs',
        },
        timestamp: new Date().toISOString(),
      });
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Global error handler:', error);

      // Handle specific error types
      if (error.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (error.name === 'UnauthorizedError') {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Default server error
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: config.server.nodeEnv === 'production'
            ? 'Something went wrong'
            : error.message,
        },
        timestamp: new Date().toISOString(),
      });
    });
  }

  public async initializeDatabase(): Promise<void> {
    try {
      await connectDatabase();
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  public async initializeRedis(): Promise<void> {
    try {
      await this.redis.connect();
    } catch (error) {
      console.error('Redis initialization failed:', error);
      // Redis is not critical for basic functionality, so we don't throw
      console.warn('⚠️ Continuing without Redis cache');
    }
  }

  public async start(): Promise<void> {
    try {
      // Initialize database connection
      await this.initializeDatabase();

      // Initialize Redis connection
      await this.initializeRedis();

      // Initialize cache management
      await this.cacheManagementService.initialize();

      // Start property expiration service
      this.expirationService.start();

      // Start server
      this.app.listen(config.server.port, () => {
        console.log(`🚀 Server running on port ${config.server.port}`);
        console.log(`📊 Environment: ${config.server.nodeEnv}`);
        console.log(`🔗 Health check: http://localhost:${config.server.port}/health`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async shutdown(): Promise<void> {
    console.log('🛑 Shutting down server...');

    try {
      this.expirationService.stop();
      await this.cacheManagementService.shutdown();
      await this.redis.disconnect();
      console.log('✅ Server shutdown complete');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }
}

export default App;