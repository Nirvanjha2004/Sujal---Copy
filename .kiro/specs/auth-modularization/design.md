# Design Document

## Overview

This design outlines the modularization of authentication-related code into a cohesive, maintainable architecture. The current auth system is scattered across multiple directories and files, making it difficult to maintain and extend. The new design will organize auth code using feature-based architecture on the frontend and layered architecture on the backend, with shared types and utilities.

## Architecture

### Frontend Architecture (Feature-Based)

The frontend will adopt a feature-based architecture where all auth-related code is co-located in a dedicated `features/auth` module:

```
frontend/src/features/auth/
├── components/           # Auth UI components
├── pages/               # Auth page components
├── hooks/               # Auth-related custom hooks
├── services/            # Auth API services
├── utils/               # Auth utility functions
├── types/               # Auth-specific types
├── constants/           # Auth constants
├── config/              # Auth configuration
└── index.ts             # Feature exports
```

### Backend Architecture (Layered)

The backend will use a layered architecture with clear separation of concerns:

```
src/features/auth/
├── controllers/         # HTTP request handlers
├── services/            # Business logic
├── middleware/          # Auth middleware
├── utils/               # Auth utilities
├── types/               # Auth types
├── constants/           # Auth constants
├── config/              # Auth configuration
└── index.ts             # Feature exports
```

### Shared Types

Common auth types will be defined in a shared location accessible by both frontend and backend:

```
shared/types/auth/
├── user.ts              # User-related types
├── tokens.ts            # Token-related types
├── requests.ts          # API request types
├── responses.ts         # API response types
└── index.ts             # Type exports
```

## Components and Interfaces

### Frontend Components

#### Core Auth Components
- **LoginForm**: Handles user login with validation
- **RegisterForm**: Handles user registration with validation
- **OTPVerification**: Handles email verification with OTP
- **ProfileForm**: Handles user profile updates
- **PasswordReset**: Handles password reset functionality
- **AuthGuard**: Protects routes based on authentication status
- **RoleGuard**: Protects routes based on user roles

#### Auth Pages
- **LoginPage**: Complete login page with layout
- **RegisterPage**: Complete registration page with layout
- **ProfilePage**: User profile management page
- **OTPVerificationPage**: Email verification page
- **PasswordResetPage**: Password reset page

#### Auth Hooks
- **useAuth**: Main auth hook providing auth state and actions
- **useAuthGuard**: Hook for route protection logic
- **useTokenRefresh**: Hook for automatic token refresh
- **useAuthValidation**: Hook for form validation logic

### Backend Services

#### AuthController
- Handles HTTP requests for auth endpoints
- Validates request data
- Delegates business logic to services
- Returns standardized responses

#### AuthService
- Contains core authentication business logic
- Handles user registration, login, logout
- Manages token generation and validation
- Handles password reset functionality

#### TokenService
- Manages JWT token operations
- Handles token generation, validation, refresh
- Manages token storage and cleanup

#### ValidationService
- Provides validation utilities for auth data
- Handles email, password, phone validation
- Provides sanitization functions

### Middleware

#### Authentication Middleware
- **authenticate**: Validates JWT tokens
- **optionalAuth**: Optional authentication for public endpoints
- **requireRole**: Enforces role-based access control
- **requireOwnership**: Ensures resource ownership

## Data Models

### User Model
```typescript
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Auth State Model
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}
```

### Token Models
```typescript
interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
```

### Request/Response Models
```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

interface AuthResponse {
  user: User;
  tokens: TokenPair;
}
```

## Error Handling

### Frontend Error Handling
- Centralized error handling in auth service
- User-friendly error messages
- Automatic token refresh on 401 errors
- Graceful degradation for network issues

### Backend Error Handling
- Standardized error response format
- Proper HTTP status codes
- Detailed error logging
- Security-conscious error messages

### Error Types
```typescript
enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  ACCOUNT_DEACTIVATED = 'ACCOUNT_DEACTIVATED'
}
```

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Test individual components and hooks
- **Integration Tests**: Test auth flows and API integration
- **E2E Tests**: Test complete authentication workflows
- **Mock Services**: Mock auth API for isolated testing

### Backend Testing
- **Unit Tests**: Test services, controllers, and middleware
- **Integration Tests**: Test database operations and external services
- **API Tests**: Test auth endpoints and responses
- **Security Tests**: Test authentication and authorization

### Test Structure
```
tests/
├── unit/
│   ├── frontend/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── backend/
│       ├── controllers/
│       ├── services/
│       └── middleware/
├── integration/
│   ├── auth-flows/
│   └── api-endpoints/
└── e2e/
    └── auth-workflows/
```

## Security Considerations

### Token Security
- JWT tokens with appropriate expiration times
- Secure token storage (httpOnly cookies for refresh tokens)
- Token rotation on refresh
- Blacklist for revoked tokens

### Password Security
- Strong password requirements
- Bcrypt hashing with appropriate rounds
- Password reset with secure tokens
- Rate limiting for auth endpoints

### Session Management
- Automatic token refresh
- Secure logout (token invalidation)
- Session timeout handling
- Multi-device session management

## Configuration Management

### Frontend Configuration
```typescript
interface AuthConfig {
  apiBaseUrl: string;
  tokenStorageKey: string;
  refreshThreshold: number;
  maxRetries: number;
}
```

### Backend Configuration
```typescript
interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
  bcryptRounds: number;
  otpExpiresIn: number;
}
```

## Migration Strategy

### Phase 1: Create New Structure
- Create new feature directories
- Define shared types and interfaces
- Set up configuration files

### Phase 2: Move Core Services
- Migrate auth services to new structure
- Update imports and dependencies
- Maintain backward compatibility

### Phase 3: Move Components and Pages
- Migrate auth components to feature module
- Update routing and imports
- Test component functionality

### Phase 4: Update Middleware and Utils
- Migrate auth middleware to new structure
- Update utility functions
- Test authentication flows

### Phase 5: Cleanup and Optimization
- Remove old auth files
- Update documentation
- Optimize imports and exports

## Performance Considerations

### Frontend Performance
- Lazy loading of auth components
- Memoization of auth state
- Efficient token refresh logic
- Minimal re-renders on auth state changes

### Backend Performance
- Efficient token validation
- Caching of user data
- Connection pooling for database
- Rate limiting for auth endpoints

## Monitoring and Logging

### Auth Events to Log
- User registration attempts
- Login/logout events
- Token refresh operations
- Failed authentication attempts
- Password reset requests

### Metrics to Track
- Authentication success/failure rates
- Token refresh frequency
- Session duration
- Auth endpoint response times