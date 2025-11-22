# Migration Files - Fixed Issues

## Changes Made

### 1. Fixed Duplicate Migration Numbers
- Renamed `006-create-saved-searches-table.sql` → `007-create-saved-searches-table.sql`
- Renamed `009-update-property-status-enum.sql` → `018-update-property-status-enum.sql`
- Renamed `012-update-property-type-enum.sql` → `019-update-property-type-enum.sql`

### 2. Converted JavaScript Migration to SQL
- Deleted `20241029000001-add-project-id-to-inquiries.js`
- Created `020-add-project-id-to-inquiries.sql` with equivalent SQL statements

### 3. Added Missing ENGINE Specifications
- Added `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` to:
  - `006-create-messages-table.sql`
  - `008-create-seo-settings-table.sql`
  - `009-create-cms-content-table.sql`

## Current Migration Order

1. `001-create-users-table.sql` - Base users table
2. `002-create-properties-table.sql` - Properties table (depends on users)
3. `003-create-property-images-table.sql` - Property images (depends on properties)
4. `004-create-inquiries-table.sql` - Inquiries (depends on properties, users)
5. `005-create-user-favorites-table.sql` - Favorites (depends on users, properties)
6. `006-create-messages-table.sql` - Messages (depends on users, properties, inquiries)
7. `007-create-saved-searches-table.sql` - Saved searches (depends on users)
8. `008-create-seo-settings-table.sql` - SEO settings
9. `009-create-cms-content-table.sql` - CMS content (depends on users)
10. `010-create-reviews-table.sql` - Reviews (depends on properties, users)
11. `011-create-url-redirects-table.sql` - URL redirects (depends on users)
12. `013-create-projects-table.sql` - Projects (depends on users)
13. `014-create-project-units-table.sql` - Project units (depends on projects)
14. `015-create-project-images-table.sql` - Project images (depends on projects)
15. `016-create-conversations-table.sql` - Conversations (depends on properties)
16. `017-create-conversation-participants-table.sql` - Conversation participants (depends on conversations, users)
17. `018-update-property-status-enum.sql` - Update property status enum (depends on properties)
18. `019-update-property-type-enum.sql` - Update property type enum (depends on properties)
19. `020-add-project-id-to-inquiries.sql` - Add project support to inquiries (depends on inquiries, projects)

## Notes

- File `003-add-property-expiration.sql.skip` is skipped (has .skip extension)
- All foreign key dependencies are now properly ordered
- All ALTER TABLE statements run after their target tables are created
- All tables now have consistent ENGINE and CHARSET specifications
