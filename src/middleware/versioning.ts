import { Request, Response, NextFunction } from 'express';
import { ApiResponseUtil } from '../utils/apiResponse';

export interface VersionedRequest extends Request {
  apiVersion: string;
}

/**
 * API versioning configuration
 */
export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2', // For future versions
} as const;

export type ApiVersion = typeof API_VERSIONS[keyof typeof API_VERSIONS];

/**
 * Supported API versions
 */
export const SUPPORTED_VERSIONS: ApiVersion[] = [API_VERSIONS.V1];

/**
 * Default API version
 */
export const DEFAULT_VERSION: ApiVersion = API_VERSIONS.V1;

/**
 * Version extraction strategies
 */
export enum VersionStrategy {
  URL_PATH = 'url_path',        // /api/v1/users
  HEADER = 'header',            // Accept-Version: v1
  QUERY_PARAM = 'query_param',  // ?version=v1
}

/**
 * API versioning middleware
 */
export class ApiVersioning {
  private strategy: VersionStrategy;
  private headerName: string;
  private queryParamName: string;

  constructor(
    strategy: VersionStrategy = VersionStrategy.URL_PATH,
    headerName: string = 'Accept-Version',
    queryParamName: string = 'version'
  ) {
    this.strategy = strategy;
    this.headerName = headerName;
    this.queryParamName = queryParamName;
  }

  /**
   * Extract version from request
   */
  private extractVersion(req: Request): string | null {
    switch (this.strategy) {
      case VersionStrategy.URL_PATH:
        // Extract from URL path: /api/v1/users -> v1
        const pathMatch = req.path.match(/^\/api\/(v\d+)/);
        return pathMatch ? pathMatch[1] : null;

      case VersionStrategy.HEADER:
        // Extract from header
        return req.headers[this.headerName.toLowerCase()] as string || null;

      case VersionStrategy.QUERY_PARAM:
        // Extract from query parameter
        return req.query[this.queryParamName] as string || null;

      default:
        return null;
    }
  }

  /**
   * Validate if version is supported
   */
  private isVersionSupported(version: string): boolean {
    return SUPPORTED_VERSIONS.includes(version as ApiVersion);
  }

  /**
   * Version validation middleware
   */
  public validateVersion() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const extractedVersion = this.extractVersion(req);
      const version = extractedVersion || DEFAULT_VERSION;

      // Check if version is supported
      if (!this.isVersionSupported(version)) {
        ApiResponseUtil.error(
          res,
          'UNSUPPORTED_API_VERSION',
          `API version '${version}' is not supported. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`,
          400,
          {
            requestedVersion: version,
            supportedVersions: SUPPORTED_VERSIONS,
            defaultVersion: DEFAULT_VERSION,
          }
        );
        return;
      }

      // Add version to request object
      (req as VersionedRequest).apiVersion = version;

      // Add version info to response headers
      res.setHeader('API-Version', version);
      res.setHeader('Supported-Versions', SUPPORTED_VERSIONS.join(', '));

      next();
    };
  }

  /**
   * Version-specific route handler
   */
  public versionHandler(handlers: Partial<Record<ApiVersion, any>>) {
    return (req: VersionedRequest, res: Response, next: NextFunction): void => {
      const version = req.apiVersion as ApiVersion;
      const handler = handlers[version];

      if (!handler) {
        ApiResponseUtil.error(
          res,
          'VERSION_HANDLER_NOT_FOUND',
          `No handler found for API version '${version}'`,
          501
        );
        return;
      }

      // Execute version-specific handler
      handler(req, res, next);
    };
  }

  /**
   * Deprecation warning middleware
   */
  public deprecationWarning(version: ApiVersion, deprecationDate?: string, sunsetDate?: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const requestVersion = (req as VersionedRequest).apiVersion;

      if (requestVersion === version) {
        let warningMessage = `API version '${version}' is deprecated`;
        
        if (deprecationDate) {
          warningMessage += ` since ${deprecationDate}`;
        }
        
        if (sunsetDate) {
          warningMessage += ` and will be sunset on ${sunsetDate}`;
        }

        res.setHeader('Warning', `299 - "${warningMessage}"`);
        res.setHeader('Deprecation', deprecationDate || 'true');
        
        if (sunsetDate) {
          res.setHeader('Sunset', sunsetDate);
        }
      }

      next();
    };
  }
}

/**
 * Default versioning middleware instance
 */
export const defaultVersioning = new ApiVersioning();

/**
 * Version-aware route wrapper
 */
export const versionedRoute = (handlers: Partial<Record<ApiVersion, any>>) => {
  return defaultVersioning.versionHandler(handlers);
};

/**
 * Utility function to get current API version from request
 */
export const getApiVersion = (req: Request): ApiVersion => {
  return (req as VersionedRequest).apiVersion as ApiVersion || DEFAULT_VERSION;
};

/**
 * Utility function to check if request is using specific version
 */
export const isVersion = (req: Request, version: ApiVersion): boolean => {
  return getApiVersion(req) === version;
};

/**
 * Version compatibility checker
 */
export class VersionCompatibility {
  /**
   * Check if feature is available in the requested version
   */
  static isFeatureAvailable(req: Request, feature: string, introducedIn: ApiVersion): boolean {
    const currentVersion = getApiVersion(req);
    const versionOrder = [API_VERSIONS.V1, API_VERSIONS.V2];
    
    const currentIndex = versionOrder.indexOf(currentVersion);
    const introducedIndex = versionOrder.indexOf(introducedIn);
    
    return currentIndex >= introducedIndex;
  }

  /**
   * Get version-specific response format
   */
  static getResponseFormat(req: Request): 'standard' | 'legacy' {
    const version = getApiVersion(req);
    return version === API_VERSIONS.V1 ? 'standard' : 'standard';
  }
}

export default {
  ApiVersioning,
  defaultVersioning,
  versionedRoute,
  getApiVersion,
  isVersion,
  VersionCompatibility,
  API_VERSIONS,
  SUPPORTED_VERSIONS,
  DEFAULT_VERSION,
};