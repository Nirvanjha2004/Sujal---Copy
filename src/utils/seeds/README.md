# Database Seeding Structure

This directory contains modular seed files for populating the database with test data.

## File Structure

```
seeds/
├── README.md                    # This file
├── seedUsers.ts                 # ✅ User seeding (21 users)
├── seedIndividualProperties.ts  # 🚧 TODO: Individual properties (23 properties)
├── seedProjects.ts              # 🚧 TODO: Projects (15 projects)
├── seedInquiries.ts             # 🚧 TODO: Inquiries
└── seedUserInteractions.ts      # 🚧 TODO: Favorites & saved searches
```

## Main Seed File

The main orchestrator is `src/utils/seed.ts` which imports and runs all seed functions in order.

## Usage

To run the complete database seeding:

```typescript
import { seedDatabase } from './utils/seed';

// In your migration or setup script
await seedDatabase();
```

## Completed Modules

### ✅ seedUsers.ts
Creates 21 users across all roles:
- 5 Buyers
- 5 Property Owners
- 4 Real Estate Agents
- 5 Builders/Developers
- 2 System Admins

## TODO Modules

### 🚧 seedIndividualProperties.ts
Should create 23 properties:
- 6 Apartments
- 5 Houses
- 3 Villas
- 4 Commercial
- 3 Plots
- 2 Land

**Helper function needed:**
```typescript
async function addPropertyImages(propertyId: number, propertyType: PropertyType)
```

### 🚧 seedProjects.ts
Should create 15 projects:
- 5 Residential projects
- 3 Apartment projects
- 2 Villa projects
- 3 Commercial/Office projects
- 2 Retail/Mixed-use projects

**Helper functions needed:**
```typescript
async function addProjectImages(projectId: number)
async function addProjectUnits(projectId: number, projectType: ProjectType)
```

### 🚧 seedInquiries.ts
Should create inquiries for both properties and projects.

### 🚧 seedUserInteractions.ts
Should create:
- User favorites
- Saved searches

## Migration from Old Structure

The old monolithic files have been backed up:
- `src/utils/seedProperties.backup.ts` - Original incomplete file
- `src/utils/seedProjects.ts` - Contains project seeding logic (needs to be moved to seeds/)

## Next Steps

1. Create `seedIndividualProperties.ts` with property data from backup file
2. Move project seeding logic from `seedProjects.ts` to `seeds/seedProjects.ts`
3. Create `seedInquiries.ts`
4. Create `seedUserInteractions.ts`
5. Uncomment the corresponding sections in `src/utils/seed.ts`
6. Delete backup files once everything is working
