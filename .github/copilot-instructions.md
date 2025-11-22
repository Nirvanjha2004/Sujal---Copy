# AI Coding Agent Instructions

## Project Overview
Full-stack real estate portal with Node.js/Express backend and React/Vite frontend. Multi-tenant system supporting agents, buyers, builders, and admins with property listings, project management, and communication features.

## Architecture & Key Patterns

### Backend Structure (`/src`)
- **Layered architecture**: Controllers → Services → Models → Database
- **Sequelize ORM** with TypeScript decorators in `/src/models/`
- **API versioning** via `/api/v1` prefix (see `src/routes/index.ts`)
- **JWT authentication** with role-based access (UserRole enum in `User.ts`)
- **Redis caching** for sessions and performance (`RedisConnection` singleton)
- **File uploads** in `/public/uploads/` with Multer middleware

### Frontend Structure (`/frontend/src`)  
- **Feature-based architecture**: `/features/{auth,property,builder,admin}/`
- **Redux Toolkit** state management (`/store/slices/`)
- **React Router v6** with protected routes (`ProtectedRoute` component)
- **Radix UI + Tailwind CSS** component system
- **Path aliases**: `@/` points to `src/`

### Database Patterns
- **Migration-first**: SQL migrations in `/src/migrations/` (numbered sequence)
- **Model relationships**: Defined in `src/models/associations.ts`
- **Property system**: Properties vs Projects (builders) with separate workflows

## Development Workflows

### Backend Development
```bash
# Start development server
npm run dev                    # Nodemon with TypeScript compilation

# Database operations  
npm run migrate                # Run pending migrations
npm run migrate:rollback       # Rollback last migration
npm run seed                   # Populate test data

# Build for production
npm run build                  # TypeScript → /dist
npm start                      # Production server
```

### Frontend Development
```bash
cd frontend
npm run dev                    # Vite dev server on port 3001
npm run build                  # Production build
npm run type-check             # TypeScript validation
```

### File Structure Conventions
- **Controllers**: Route handlers only, delegate to services
- **Services**: Business logic, database operations
- **Models**: Sequelize models with TypeScript decorators
- **Middleware**: Reusable request processing (`auth.ts`, `security.ts`)
- **Routes**: API endpoint definitions with versioning

## Critical Integration Points

### Authentication Flow
1. Login → JWT access + refresh tokens
2. Frontend stores tokens in Redux auth slice
3. Backend middleware validates via `authenticate()` in `middleware/auth.ts`
4. Role-based access: `UserRole.AGENT`, `UserRole.BUYER`, `UserRole.BUILDER`, `UserRole.ADMIN`

### Property vs Project Distinction
- **Properties**: Individual listings (agents/owners)
- **Projects**: Multi-unit developments (builders)
- **Models**: `Property.ts` vs `Project.ts` with `ProjectUnit.ts`
- **Routes**: Separate API endpoints and frontend features

### File Upload System
- **Backend**: Multer middleware in `middleware/upload.ts`
- **Storage**: `/public/uploads/{properties,projects,profiles}/`
- **Frontend**: Form handling with progress indicators
- **API**: `/api/v1/uploads` endpoints

## Environment Configuration

### Backend (`.env`)
```env
DB_HOST=localhost
DB_NAME=real_estate_portal
REDIS_HOST=localhost
JWT_SECRET=your-secret
NODE_ENV=development
```

### Frontend (`.env.local`)
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Real Estate Portal
```

## Testing & Debugging

### Database Debugging
- Use `DB_LOGGING=true` in development for SQL query logs
- Check `/src/config/database.ts` for connection pooling settings
- Migration rollback strategy: Always test down migrations

### API Testing
- Swagger UI available at `/api/docs`
- Use `npm run check-routes` to validate endpoint registration
- Redis CLI for cache debugging: `redis-cli monitor`

### Frontend State Management
- Redux DevTools integration enabled
- Auth state persistence across page refreshes
- Error boundaries in `shared/components/layout/ErrorBoundary`

## Common Tasks

### Adding New Features
1. **Backend**: Model → Migration → Controller → Service → Route
2. **Frontend**: Feature folder → API service → Components → Store slice
3. **Integration**: Update TypeScript types in `/src/types/`

### Property/Project Workflows
- Properties use `PropertyController` + `PropertyService`
- Projects use `ProjectController` with unit management
- Shared components in `/frontend/src/shared/components/`

### Role-Based Access
- Backend: Use `requireRole()` middleware with UserRole enum
- Frontend: Check `useSelector(state => state.auth.user.role)`
- Route guards: `ProtectedRoute` component with role prop