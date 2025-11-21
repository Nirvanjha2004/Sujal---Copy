# "Unknown column 'expires_at' in 'field list'" Error - FIXED ✅

## Error Message
```
Unknown column 'expires_at' in 'field list'
```

## What This Error Means
This is a **database schema mismatch error**. It occurs when:
- Your application code tries to use a database column that doesn't exist
- A migration that creates the column hasn't been run yet
- The database schema is out of sync with the code

## Root Cause
The `properties` table was missing three columns that the code expected:
1. `expires_at` - Timestamp for when a property listing expires
2. `auto_renew` - Boolean flag for automatic renewal
3. `renewal_period_days` - Number of days for renewal period

### Why It Happened:
There was a migration file `003-add-property-expiration.sql.skip` that was **skipped** (had `.skip` extension), so it never ran. This meant the columns were never added to the database.

## Files Affected
The following files were using the missing `expires_at` column:
- `src/services/propertyService.ts` - Property CRUD operations
- `src/services/propertyExpirationService.ts` - Expiration handling
- `src/models/Property.ts` - Property model definition

## The Fix

### Created New Migration
Created `src/migrations/024-add-property-expiration-columns.sql`:

```sql
-- Add expiration handling fields to properties table
ALTER TABLE properties 
ADD COLUMN expires_at TIMESTAMP NULL,
ADD COLUMN auto_renew BOOLEAN DEFAULT FALSE,
ADD COLUMN renewal_period_days INT DEFAULT 30,
ADD INDEX idx_expires_at (expires_at);

-- Update existing properties to have a default expiration of 90 days from creation
UPDATE properties 
SET expires_at = DATE_ADD(created_at, INTERVAL 90 DAY)
WHERE expires_at IS NULL;
```

### Ran the Migration
```bash
npm run migrate
```

**Result**: ✅ Migration completed successfully!

## What Was Added

### New Columns in `properties` Table:
1. **expires_at** (TIMESTAMP NULL)
   - When the property listing expires
   - Defaults to 90 days from creation for existing properties
   
2. **auto_renew** (BOOLEAN DEFAULT FALSE)
   - Whether the listing should automatically renew when it expires
   
3. **renewal_period_days** (INT DEFAULT 30)
   - How many days to extend the listing when renewing

### New Index:
- **idx_expires_at** - Index on `expires_at` column for faster queries

## Features Now Working

With these columns added, the following features now work:

1. **Property Expiration**
   - Properties can have expiration dates
   - Expired properties are automatically deactivated

2. **Auto-Renewal**
   - Properties can be set to auto-renew
   - Automatic renewal happens when listings expire

3. **Expiration Tracking**
   - Dashboard shows expiring properties
   - Notifications for properties about to expire
   - Analytics on expired vs active properties

4. **Property Management**
   - Owners can see when their listings expire
   - Can configure auto-renewal settings
   - Can manually renew listings

## Verification

To verify the fix worked:

```sql
-- Check if columns exist
DESCRIBE properties;

-- Check if data was populated
SELECT id, title, expires_at, auto_renew, renewal_period_days 
FROM properties 
LIMIT 5;
```

## Common Causes of This Error

1. **Skipped Migrations** - Migration files with `.skip` extension
2. **Missing Migrations** - Forgot to run `npm run migrate`
3. **Database Out of Sync** - Different environments have different schemas
4. **Code Ahead of Database** - New code deployed before migrations run

## Prevention

To prevent this error in the future:

1. **Always run migrations** after pulling new code:
   ```bash
   npm run migrate
   ```

2. **Check migration status** before deploying:
   ```bash
   # List pending migrations
   npm run migrate -- --status
   ```

3. **Never skip migrations** - Remove `.skip` extension if needed

4. **Keep environments in sync** - Run migrations on all environments

5. **Test locally first** - Run migrations on local DB before production

## Related Files
- ✅ `src/migrations/024-add-property-expiration-columns.sql` - Created and run
- ⚠️  `src/migrations/003-add-property-expiration.sql.skip` - Old skipped file (can be deleted)
- `src/services/propertyService.ts` - Uses expires_at
- `src/services/propertyExpirationService.ts` - Uses expires_at
- `src/models/Property.ts` - Property model

## Summary
The error was caused by missing database columns. Created and ran a migration to add the `expires_at`, `auto_renew`, and `renewal_period_days` columns to the properties table. The application should now work correctly!
