# Dental Lab Management System - Database Schema

## Overview
Complete PostgreSQL database schema for a comprehensive Dental Lab Management System with 13+ modules covering workflow, billing, inventory, communications, and analytics.

## Files Included

1. **schema.sql** (44KB)
   - Complete database schema with all 34 tables
   - 5 analytical views
   - 16 custom PostgreSQL enums
   - 100+ performance indexes
   - 7 automatic timestamp triggers
   - Seed data for roles and permissions

2. **SCHEMA_SUMMARY.md**
   - High-level overview of all modules
   - Statistics and feature highlights
   - Relationship diagrams
   - Import instructions

3. **TABLE_REFERENCE.md**
   - Complete table listing by module
   - Column descriptions
   - Data types and constraints
   - Common query patterns

4. **COMMON_QUERIES.sql**
   - 40+ ready-to-use SQL queries
   - Examples for every major module
   - Reporting queries
   - Maintenance operations

## Quick Start

### Prerequisites
- PostgreSQL 13 or later
- psql command-line tool
- Standard Unix tools (bash, grep, sed)

### Installation

#### Option 1: Direct Database Import
```bash
# Create database
createdb dental_lab_db

# Import schema
psql -U postgres -d dental_lab_db -f schema.sql
```

#### Option 2: With Docker
```bash
# Start PostgreSQL container
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=dental_lab_db \
  -p 5432:5432 \
  postgres:15

# Wait for container to be ready, then import schema
docker exec -i postgres psql -U postgres -d dental_lab_db < schema.sql
```

#### Option 3: Connection String
```bash
psql postgresql://username:password@localhost:5432/dental_lab_db < schema.sql
```

### Verification
```bash
# Verify tables were created
psql -d dental_lab_db -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

# Count objects
psql -d dental_lab_db -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"
psql -d dental_lab_db -c "SELECT COUNT(*) as view_count FROM information_schema.views WHERE table_schema = 'public';"
```

## Schema Highlights

### 13 Functional Modules
1. Authentication & Users (3 tables)
2. Lab Workflow - 7 stages (2 tables)
3. Case Management (3 tables)
4. Billing & Invoices (3 tables)
5. Inventory Management (3 tables)
6. Staff Management (3 tables)
7. Department Management (2 tables)
8. Communications (4 tables)
9. Dentist Network (2 tables)
10. Calendar & Appointments (1 table)
11. Reports & Analytics (5 views)
12. Access Control (3 tables)
13. Logistics (3 tables)
14. Settings & Audit (2 tables)

### Key Features

**UUID Primary Keys**
- All tables use uuid_generate_v4()
- Better for distributed systems
- Improved security and privacy

**Soft Deletes**
- `deleted_at` timestamp on all major tables
- Data preserved for audit and recovery
- Indexed for efficient filtering

**Automatic Timestamps**
- `created_at` - Record creation time
- `updated_at` - Last modification (auto-updated via trigger)
- Applied to 7 main tables

**Comprehensive Indexes**
- 100+ strategic indexes
- Status fields for filtering
- Foreign keys for joins
- Date fields for range queries
- Business keys for lookups

**Custom Enum Types**
- Type-safe status values
- Prevents invalid data
- PostgreSQL native (no strings)
- 16 different enum types

**JSONB Support**
- `skills` in staff_profiles
- `data` in notifications
- `old_values`/`new_values` in audit_log
- Allows schema flexibility

### Data Validation

- NOT NULL constraints on required fields
- CHECK constraints for valid value ranges
- UNIQUE constraints on business keys
- Email format validation
- Time range validation (end_time > start_time)
- Numeric range validation (0-5 star ratings)

### Foreign Key Relationships

All relationships use:
- CASCADE delete for child records
- SET NULL for optional references
- RESTRICT where deletion is not allowed

## Modules Explained

### 1. Authentication & Users
Manages user accounts, sessions, and password recovery.
- User roles: admin, manager, technician, dentist, staff
- Session tokens for authentication
- Secure password reset workflow

### 2. Lab Workflow
7-stage production workflow:
1. Receiving - Case intake
2. Impression Scan - Digital scanning
3. Design - CAD design
4. Milling - CNC milling
5. Sintering - Heat treatment
6. Quality Control - Inspection
7. Delivery - Final handoff

### 3. Case Management
Core case records with:
- Patient information
- Procedure types (crowns, implants, veneers, dentures, etc.)
- Urgency levels (standard, rush, emergency)
- Priority and due dates
- File attachments and notes

### 4. Billing & Invoices
Complete billing system:
- Invoice generation
- Line item management
- Multiple payment methods
- Payment tracking and reconciliation

### 5. Inventory Management
Warehouse management:
- Materials, tools, equipment, consumables
- Stock level tracking with min/max alerts
- Supplier management
- Complete transaction audit trail

### 6. Staff Management
Employee management:
- Staff profiles with skills (JSONB)
- Work schedules by day of week
- Performance reviews and ratings
- Employment type tracking

### 7. Department Management
Organizational structure:
- Department hierarchy
- Equipment inventory by department
- Budget tracking
- Maintenance scheduling

### 8. Communications
Internal messaging system:
- Direct and group conversations
- Case-specific discussions
- Message read status
- User notifications with custom data

### 9. Dentist Network
Partner management:
- Dentist profiles with metrics
- Clinic information
- Partnership applications
- Case history and revenue tracking

### 10. Calendar & Appointments
Appointment scheduling:
- Design reviews
- Quality checks
- Deliveries
- Training and meetings

### 11. Reports & Analytics
Pre-built views:
- Monthly revenue analysis
- Case completion rates by procedure
- Department efficiency metrics
- Staff performance ratings
- Inventory turnover analysis

### 12. Access Control
Role-based permissions:
- 5 predefined roles
- 30+ granular permissions
- Permission grouping by module
- User authentication

### 13. Logistics
Shipment management:
- Pickup and delivery tracking
- Route planning
- Driver assignment
- Stop sequencing

### 14. Settings & Audit
System configuration:
- Global settings
- Complete audit trail
- Change history with JSONB
- User and IP tracking

## Performance Considerations

### Indexes
- Over 100 strategic indexes
- Reduces query time significantly
- Increases write overhead slightly
- Monitor for unused indexes

### Soft Deletes
- Efficient with indexed deleted_at
- Avoids cascading deletes
- Maintains referential integrity
- Allows data recovery

### Materialized Views
- Pre-computed analytics
- Faster reporting queries
- Requires periodic refresh
- Can be indexed

### UUID vs Serial
- UUIDs: Better for distributed systems
- UUIDs: No coordination required
- UUIDs: Larger index size
- UUIDs: Better privacy

## Security Features

- Password hashing (application responsibility)
- Session tokens (time-limited)
- Audit logging (all changes tracked)
- Role-based access control
- Data validation constraints
- SQL injection prevention (prepared statements)

## Backup & Recovery

### Backup
```bash
pg_dump dental_lab_db > backup.sql
```

### Restore
```bash
psql dental_lab_db < backup.sql
```

### Partial Restore (specific table)
```bash
pg_dump -t cases dental_lab_db | psql other_db
```

## Maintenance

### Regular Tasks
1. **VACUUM** - Reclaim storage (auto-vacuum enabled)
2. **ANALYZE** - Update query statistics
3. **REINDEX** - Rebuild fragmented indexes
4. **Monitor** - Check slow queries

### Cleanup Soft-Deleted Data
```sql
-- Permanently delete data older than 1 year
DELETE FROM cases WHERE deleted_at < NOW() - INTERVAL '1 year';
DELETE FROM invoices WHERE deleted_at < NOW() - INTERVAL '1 year';
-- etc.
```

### Analyze Performance
```sql
-- Find slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC;

-- Check index usage
SELECT * FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;

-- Table size
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Customization

### Add New Status Type
```sql
ALTER TYPE case_status ADD VALUE 'custom_status';
```

### Add New Column
```sql
ALTER TABLE cases ADD COLUMN custom_field VARCHAR(255);
```

### Create Index
```sql
CREATE INDEX idx_cases_custom_field ON cases(custom_field) WHERE deleted_at IS NULL;
```

### Add Permission
```sql
INSERT INTO permissions (id, name, description, module) 
VALUES (uuid_generate_v4(), 'custom.permission', 'Description', 'custom_module');
```

## Troubleshooting

### Connection Issues
```bash
# Check connection
psql -h localhost -U postgres -d dental_lab_db -c "SELECT 1;"

# View PostgreSQL logs
tail -f /var/log/postgresql/postgresql.log
```

### Performance Issues
```sql
-- Explain query plan
EXPLAIN ANALYZE SELECT * FROM cases WHERE status = 'pending';

-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE idx_blks_read > 0;
```

### Constraint Violations
```sql
-- Check constraint definitions
SELECT * FROM information_schema.table_constraints WHERE table_name = 'cases';
```

## Integration

### Python
```python
import psycopg2
conn = psycopg2.connect("dbname=dental_lab_db user=postgres")
```

### Node.js
```javascript
const { Pool } = require('pg');
const pool = new Pool({ database: 'dental_lab_db' });
```

### Java
```java
String url = "jdbc:postgresql://localhost:5432/dental_lab_db";
Connection conn = DriverManager.getConnection(url, "postgres", "password");
```

### Docker Compose
```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: dental_lab_db
      POSTGRES_PASSWORD: password
    volumes:
      - ./schema.sql:/docker-entrypoint-initdb.d/schema.sql
```

## Support

For issues or questions:
1. Check SCHEMA_SUMMARY.md for module details
2. Review TABLE_REFERENCE.md for column information
3. See COMMON_QUERIES.sql for query examples
4. Check PostgreSQL documentation for database-specific issues

## License

This schema is provided as-is for the Dental Lab Management System project.

## Version
- Created: 2024
- PostgreSQL: 13+
- Status: Production-Ready
