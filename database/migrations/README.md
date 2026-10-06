# Database Migrations

## Overview

All past migrations have been consolidated into `schema.sql`. This file contains the complete, up-to-date database schema and is the source of truth for database structure.

## Migration History

### Applied Migrations (Merged into schema.sql)
1. ✅ Initial schema creation (users, products, orders, reviews, etc.)
2. ✅ `add_buyer_id.sql` - Added buyer_id column to users table
3. ✅ `add_delivered_at_column.sql` - Added delivered_at timestamp to order_items table
4. ✅ `assign_seller_ids.sql` - Initial seller_id assignment and defaults

## Future Migrations

### Naming Convention
Use numbered format: `NNN_description.sql`
- `001_add_column_x.sql`
- `002_create_table_y.sql`
- `003_add_index_z.sql`

### Steps for New Migrations

1. **Create migration file** in this directory: `database/migrations/NNN_description.sql`
2. **Add comments** describing what the migration does
3. **Make it idempotent** (use `IF NOT EXISTS`, `IF EXISTS` checks)
4. **Test thoroughly** before applying
5. **Apply to database** manually or via deployment script
6. **Update schema.sql** if structural changes (for fresh setup)
7. **Document in this README**

### Example Migration

```sql
-- 001_add_status_audit_columns.sql
-- Add audit columns to track order status changes

-- Add columns if they don't exist (PostgreSQL)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS status_changed_by INT,
ADD CONSTRAINT fk_orders_changed_by FOREIGN KEY (status_changed_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create index for query performance
CREATE INDEX IF NOT EXISTS idx_orders_status_changed_at ON orders(status_changed_at);
```

## Database Setup

### Fresh Install
```bash
psql -U <user> -d <database> -f schema.sql
```

### With Migrations
```bash
# Apply schema
psql -U <user> -d <database> -f schema.sql

# Then apply migrations in order
psql -U <user> -d <database> -f migrations/001_*.sql
psql -U <user> -d <database> -f migrations/002_*.sql
# ... and so on
```

## Schema Version
- **Current Version:** 1.0 (consolidated)
- **Last Updated:** 2024
- **Database:** PostgreSQL 10+

## Important Notes

1. **schema.sql is authoritative** - Always reflect structural changes here
2. **Migrations are cumulative** - Each migration builds on previous state
3. **Test migrations locally first** - Before applying to production
4. **Keep separate from deployment** - Don't auto-run in production without approval
5. **Document breaking changes** - Any schema changes affecting application logic

## Troubleshooting

### Schema Mismatch
If schema doesn't match expectations:
```sql
-- List all tables
\dt

-- Check table structure
\d+ table_name

-- Check indexes
\di

-- Check constraints
\dx
```

### Migration Rollback
Document any reverse migrations needed:
```sql
-- Reverse migration template
-- DROP COLUMN IF EXISTS column_name;
-- DROP INDEX IF EXISTS index_name;
```

## Contact
For database schema questions or migration assistance, refer to database documentation or project maintainers.
