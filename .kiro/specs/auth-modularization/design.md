# Design Document

## Overview

The auth modularization feature will reorganize the existing authentication system from a scattered structure across multiple directories into a cohesive, feature-based module. This design follows the established patterns used in the agent, admin, buyer, and builder features, creating a consistent and maintainable architecture.

The current authentication system includes:
- Auth context and Redux slice for state management
- Token utilities for JWT management
- Auth components (LoginPage, RegisterPage, ProfilePage, ProtectedRoute, OTPVerificationPage)
- Backend auth service integration
- API authentication methods

## Architecture

### Current State Analysis

**Existing Structure:**
```
frontend/src/
├── shared/
│   ├── contexts/AuthContext.tsx
│   └── utils/tokenUtils.ts
├── store/slices/authSlice.ts
├── components/auth/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ProfilePage.tsx
│   ├── ProtectedRoute.tsx
│   └── OTPVerificationPage.tsx
└── shared/lib/api.ts (auth methods)
```

**Target Modular Structure:**
```
frontend/src/features/auth/
├── components/
│   ├── forms/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ProfileForm.tsx
│   │   ├── PasswordResetForm.tsx
│   │   └── OTPVerificationForm.tsx
│   ├── guards/
│   │   ├── ProtectedRoute.tsx
│   │   ├── AuthGuard.tsx
│   │   └── RoleGuard.tsx
│   ├── ui/
│   │   ├── AuthCard.tsx
│   │   ├── AuthHeader.tsx
│   │   └── SocialLoginButtons.tsx
│   └── index.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ProfilePage.tsx
│   ├── OTPVerificationPage.tsx
│   ├── PasswordResetPage.tsx
│   └── index.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useLogin.ts
│   ├── useRegister.ts
│   ├── useProfile.ts
│   └── index.ts
├── services/
│   ├── authService.ts
│   ├── tokenService.ts
│   └── index.ts
├── utils/
│   ├── validation.ts
│   ├── tokenUtils.ts
│   └── index.ts
├── types/
│   ├── auth.ts
│   ├── user.ts
│   └── index.ts
├── constants/
│   ├── authConstants.ts
│   └── index.ts
└── index.ts
```

### Integration Points

The auth feature will integrate with:
1. **Redux Store**: Maintain compatibility with existing authSlice
2. **React Router**: Continue to work with existing routing structure
3. **API Layer**: Preserve existing API authentication methods
4. **Shared Components**: Maintain access to UI components
5. **Other Features**: Provide auth hooks and guards for other features

## Components and Interfaces

### Core Components

#### 1. Form Components
- **LoginForm**: Extracted form logic from LoginPage
- **RegisterForm**: Extracted form logic from RegisterPage  
- **ProfileForm**: User profile management form
- **PasswordResetForm**: Password reset functionality
- **OTPVerificationForm**: Email/phone verification

#### 2. Guard Components
- **ProtectedRoute**: Enhanced version of current ProtectedRoute
- **AuthGuard**: Higher-order component for auth protection
- **RoleGuard**: Role-based access control component

#### 3. UI Components
- **AuthCard**: Reusable card wrapper for auth forms
- **AuthHeader**: Consistent header for auth pages
- **SocialLoginButtons**: Social authentication buttons

#### 4. Page Components
- **LoginPage**: Composed using LoginForm and UI components
- **RegisterPage**: Composed using RegisterForm and UI components
- **ProfilePage**: User profile management page
- **OTPVerificationPage**: Email/phone verification page
- **PasswordResetPage**: Password reset flow

### Service Layer

#### AuthService
```typescript
interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>
  register(userData: RegisterData): Promise<AuthResponse>
  logout(): Promise<void>
  refreshToken(): Promise<TokenPair>
  verifyEmail(email: string, otp: string): Promise<void>
  resetPassword(token: string, password: string): Promise<void>
  sendPasswordReset(email: string): Promise<void>
}
```

#### TokenService
```typescript
interface TokenService {
  getValidToken(): string | null
  setToken(token: string): boolean
  clearToken(): void
  validateToken(token: string): TokenValidation
  isTokenExpiringSoon(token?: string): boolean
  getTokenTimeToExpiry(token?: string): number | null
}
```

### Hook Layer

#### useAuth Hook
```typescript
interface UseAuthReturn {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<void>
  clearError: () => void
}
```

#### Specialized Hooks
- **useLogin**: Login-specific logic and state
- **useRegister**: Registration-specific logic and state  
- **useProfile**: Profile management logic and state

## Data Models

### User Interface
```typescript
interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: UserRole
  phone?: string
  avatar?: string
  isVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type UserRole = 'buyer' | 'owner' | 'agent' | 'builder' | 'admin'
```

### Auth State Interface
```typescript
interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}
```

### Form Data Interfaces
```typescript
interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: UserRole
  phone?: string
}

interface ProfileUpdateData {
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
}
```

### Token Interfaces
```typescript
interface TokenPayload {
  userId: number
  email: string
  role: string
  iat: number
  exp: number
}

interface TokenValidation {
  isValid: boolean
  payload?: TokenPayload
  error?: string
}

interface TokenPair {
  accessToken: string
  refreshToken: string
}
```

## Error Handling

### Error Types
```typescript
enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN'
}

interface AuthError {
  type: AuthErrorType
  message: string
  field?: string
}
```

### Error Handling Strategy
1. **Service Level**: Catch and transform API errors into AuthError objects
2. **Hook Level**: Provide error state and clearing mechanisms
3. **Component Level**: Display user-friendly error messages
4. **Global Level**: Handle authentication failures and token expiration

## Testing Strategy

### Unit Testing
- **Services**: Mock API calls and test business logic
- **Hooks**: Test state management and side effects using React Testing Library
- **Utils**: Test token validation and utility functions
- **Components**: Test rendering and user interactions

### Integration Testing
- **Auth Flow**: Test complete login/register/logout flows
- **Route Protection**: Test ProtectedRoute and role-based access
- **Token Management**: Test token refresh and expiration handling
- **Form Validation**: Test form validation and error handling

### Test Structure
```
frontend/src/features/auth/__tests__/
├── services/
│   ├── authService.test.ts
│   └── tokenService.test.ts
├── hooks/
│   ├── useAuth.test.ts
│   ├── useLogin.test.ts
│   └── useRegister.test.ts
├── components/
│   ├── forms/
│   │   ├── LoginForm.test.tsx
│   │   └── RegisterForm.test.tsx
│   └── guards/
│       └── ProtectedRoute.test.tsx
├── utils/
│   └── validation.test.ts
└── integration/
    ├── authFlow.test.tsx
    └── routeProtection.test.tsx
```

### Testing Utilities
- **Mock Auth Provider**: For testing components that use auth
- **Mock API Responses**: For testing service layer
- **Test Helpers**: For common auth testing scenarios

## Migration Strategy

### Phase 1: Structure Setup
1. Create the new feature directory structure
2. Set up index files for clean exports
3. Create type definitions and constants

### Phase 2: Service Layer Migration
1. Extract auth API methods from shared/lib/api.ts
2. Create dedicated authService and tokenService
3. Move and enhance tokenUtils

### Phase 3: Component Migration
1. Extract form logic from existing page components
2. Create reusable form and UI components
3. Enhance ProtectedRoute with better error handling

### Phase 4: Hook Layer Creation
1. Create useAuth hook that wraps the existing AuthContext
2. Create specialized hooks for login, register, and profile
3. Maintain backward compatibility with existing AuthContext

### Phase 5: Page Refactoring
1. Refactor existing pages to use new components and hooks
2. Move pages to the auth feature directory
3. Update routing imports in App.tsx

### Phase 6: Integration and Testing
1. Update all import statements across the application
2. Ensure backward compatibility is maintained
3. Add comprehensive tests for the new structure

### Backward Compatibility
- Maintain existing AuthContext export for gradual migration
- Keep existing Redux authSlice unchanged
- Preserve all existing API interfaces
- Ensure no breaking changes to existing components

## Security Considerations

### Token Security
- Secure token storage in localStorage with validation
- Automatic token refresh before expiration
- Token cleanup on logout and errors
- Protection against XSS attacks

### Route Protection
- Enhanced role-based access control
- Proper error handling for unauthorized access
- Redirect handling for authentication flows
- Protection against route manipulation

### Form Security
- Input validation and sanitization
- CSRF protection for form submissions
- Rate limiting for authentication attempts
- Secure password handling

### API Security
- Proper error handling without information leakage
- Request/response validation
- Timeout handling for network requests
- Secure header management

## Performance Considerations

### Code Splitting
- Lazy load auth pages to reduce initial bundle size
- Split auth components for better caching
- Optimize imports to prevent unnecessary bundling

### State Management
- Efficient Redux state updates
- Minimize re-renders with proper memoization
- Optimize hook dependencies

### Network Optimization
- Token refresh optimization
- Request deduplication
- Proper caching strategies
- Error retry mechanisms

## Accessibility

### Form Accessibility
- Proper ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Error Handling
- Accessible error announcements
- Clear error messaging
- Proper error association with form fields
- Visual and programmatic error indication

### Navigation
- Proper heading structure
- Skip links for auth forms
- Logical tab order
- High contrast support