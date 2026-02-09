# Database Deployment Checklist

## Pre-Deployment

- [ ] PostgreSQL 13+ installed
- [ ] psql CLI tool available
- [ ] Backup strategy planned
- [ ] Database name decided: ____________
- [ ] Database user created or ready
- [ ] All files downloaded to `/sessions/magical-relaxed-galileo/lms1-backend/database/`

## Installation Steps

### Step 1: Create Database
```bash
createdb YOUR_DATABASE_NAME
```
- [ ] Database created successfully
- [ ] Connection verified with: `psql -d YOUR_DATABASE_NAME -c "SELECT 1;"`

### Step 2: Import Schema
```bash
psql -U postgres -d YOUR_DATABASE_NAME -f schema.sql
```
- [ ] Schema import completed without errors
- [ ] Check output for any warnings

### Step 3: Verify Installation

#### Table Count
```bash
psql -d YOUR_DATABASE_NAME -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"
```
- [ ] Result should be: 34 tables

#### View Count
```bash
psql -d YOUR_DATABASE_NAME -c "SELECT COUNT(*) as view_count FROM information_schema.views WHERE table_schema = 'public';"
```
- [ ] Result should be: 5 views

#### Enum Count
```bash
psql -d YOUR_DATABASE_NAME -c "SELECT COUNT(*) FROM pg_type WHERE typtype = 'e';"
```
- [ ] Result should be: 16 enums

#### All Tables List
```bash
psql -d YOUR_DATABASE_NAME -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
```
- [ ] All 34 tables visible

### Step 4: Check Indexes
```bash
psql -d YOUR_DATABASE_NAME -c "SELECT COUNT(*) as index_count FROM pg_indexes WHERE schemaname = 'public';"
```
- [ ] Result should be: 100+ indexes

### Step 5: Verify Triggers
```bash
psql -d YOUR_DATABASE_NAME -c "SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public';"
```
- [ ] Result should be: 7 triggers

## Data Validation

### Check Seed Data

#### Roles
```bash
psql -d YOUR_DATABASE_NAME -c "SELECT name FROM roles ORDER BY name;"
```
- [ ] Should see 5 roles: Admin, Manager, Staff, Technician, Dentist

#### Permissions
```bash
psql -d YOUR_DATABASE_NAME -c "SELECT COUNT(*) FROM permissions;"
```
- [ ] Should see 30+ permissions

### Test Basic Inserts

#### Create test user
```sql
INSERT INTO users (email, password_hash, role, first_name, last_name, status)
VALUES ('test@example.com', 'hash', 'admin', 'Test', 'User', 'active');
```
- [ ] Insert succeeds

#### Verify timestamp trigger
```sql
SELECT created_at, updated_at FROM users WHERE email = 'test@example.com';
```
- [ ] Both timestamps populated automatically

#### Test soft delete
```sql
UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE email = 'test@example.com';
SELECT * FROM users WHERE email = 'test@example.com' AND deleted_at IS NULL;
```
- [ ] Record hidden from query with `deleted_at IS NULL`

## Security Setup

- [ ] Change default app_user password in schema
- [ ] Create additional application users as needed
- [ ] Set up authentication credentials in application
- [ ] Configure connection pooling
- [ ] Set up automated backups
- [ ] Review access permissions
- [ ] Enable query logging (optional)

## Performance Tuning

### Check Index Usage
```bash
psql -d YOUR_DATABASE_NAME -c "
SELECT indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;"
```
- [ ] Review index effectiveness

### Analyze Tables
```bash
psql -d YOUR_DATABASE_NAME -c "ANALYZE;"
```
- [ ] Run after large data loads
- [ ] Schedule periodic ANALYZE

### Monitor Query Performance
```bash
psql -d YOUR_DATABASE_NAME -c "
EXPLAIN ANALYZE
SELECT c.* FROM cases c
JOIN dentist_profiles d ON c.dentist_id = d.id
WHERE c.status = 'pending';"
```
- [ ] Check execution plan uses indexes
- [ ] Adjust if necessary

## Backup & Recovery

### Create Full Backup
```bash
pg_dump YOUR_DATABASE_NAME > backup_$(date +%Y%m%d_%H%M%S).sql
```
- [ ] Backup file created
- [ ] Backup size reasonable (~5-10MB for empty schema)

### Test Restore
```bash
# Create test database
createdb YOUR_DATABASE_NAME_test

# Restore backup
psql YOUR_DATABASE_NAME_test < backup_20240209_120000.sql

# Verify
psql YOUR_DATABASE_NAME_test -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```
- [ ] Restore successful
- [ ] All tables present in restored database

### Setup Backup Schedule
```bash
# Example cron job (daily at 2 AM)
0 2 * * * pg_dump YOUR_DATABASE_NAME | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```
- [ ] Cron job configured
- [ ] Backup directory exists with sufficient space

## Application Integration

### Connection String
```
postgresql://username:password@localhost:5432/YOUR_DATABASE_NAME
```
- [ ] Connection string noted
- [ ] Tested with application

### Connection Pool Settings
- [ ] Min connections: 5
- [ ] Max connections: 20
- [ ] Connection timeout: 30 seconds
- [ ] Idle timeout: 900 seconds

### Application Configuration
- [ ] Database URL configured
- [ ] Credentials in environment variables
- [ ] Connection pooling enabled
- [ ] Query logging configured

## Monitoring

### Enable Query Logging
```sql
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1 second
SELECT pg_reload_conf();
```
- [ ] Configured

### Monitor Disk Space
```bash
psql -d YOUR_DATABASE_NAME -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```
- [ ] Monitored regularly
- [ ] Alerts set up for low disk space

### Monitor Connections
```bash
psql -d YOUR_DATABASE_NAME -c "SELECT count(*) FROM pg_stat_activity;"
```
- [ ] Monitored for connection leaks
- [ ] Max connections appropriate

## Documentation

- [ ] README.md reviewed by team
- [ ] SCHEMA_SUMMARY.md shared with developers
- [ ] TABLE_REFERENCE.md bookmarked
- [ ] COMMON_QUERIES.sql added to project repository
- [ ] CONNECTION_STRING documented in team docs
- [ ] BACKUP_SCHEDULE documented
- [ ] DISASTER_RECOVERY plan created

## Post-Deployment

### Week 1
- [ ] Monitor for errors in logs
- [ ] Test all critical queries
- [ ] Verify backup completion
- [ ] Check performance metrics

### Month 1
- [ ] Review slow query logs
- [ ] Optimize as needed
- [ ] Test disaster recovery
- [ ] Document any issues

### Ongoing
- [ ] Weekly backup verification
- [ ] Monthly ANALYZE runs
- [ ] Quarterly index maintenance
- [ ] Annual schema review

## Troubleshooting

If import fails:
1. [ ] Check PostgreSQL version: `psql --version` (need 13+)
2. [ ] Check available disk space: `df -h`
3. [ ] Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql.log`
4. [ ] Try importing specific components separately
5. [ ] Contact database administrator

Common issues:
- [ ] Permission denied → Check PostgreSQL user roles
- [ ] Table already exists → Database not empty, use clean database
- [ ] UUID extension error → PostgreSQL extension not available
- [ ] Connection refused → PostgreSQL service not running

## Deployment Sign-Off

- [ ] All checklist items completed
- [ ] All tests passed
- [ ] Backup verified
- [ ] Application integration tested
- [ ] Documentation updated
- [ ] Team trained on new schema

**Deployment Date**: ____________
**Deployed By**: ________________
**Approved By**: ________________

## Next Steps After Deployment

1. Add application-specific views if needed
2. Create stored procedures for common operations
3. Set up monitoring dashboards
4. Schedule maintenance windows
5. Plan for schema versioning and migrations

---

## Files Reference

- `schema.sql` - Main schema file (use for deployment)
- `README.md` - Getting started guide
- `SCHEMA_SUMMARY.md` - Feature overview
- `TABLE_REFERENCE.md` - Complete table catalog
- `COMMON_QUERIES.sql` - Query examples
- `INDEX.md` - Navigation guide
- `DEPLOYMENT_CHECKLIST.md` - This file

All files located in: `/sessions/magical-relaxed-galileo/lms1-backend/database/`

---

**Status: Ready for Production Deployment**
