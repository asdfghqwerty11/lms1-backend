# Dental Lab Management System - Database Schema Summary

## File Location
`/sessions/magical-relaxed-galileo/lms1-backend/database/schema.sql`

## Schema Statistics
- **Total Lines**: 1,049 lines
- **Tables**: 34 tables
- **Views**: 5 analytical views
- **Enums**: 16 custom PostgreSQL types
- **Indexes**: 100+ indexes for optimal performance
- **Triggers**: 7 automatic timestamp update triggers

## Modules Implemented (13 Total)

### 1. **Authentication & Users**
- `users` - Core user accounts with roles and status
- `sessions` - Session management with token authentication
- `password_reset_tokens` - Secure password reset workflow

### 2. **Lab Workflow (7-Stage Process)**
- `workflow_stages` - Tracks progression through 7 workflow stages
- `workflow_templates` - Predefined workflows by procedure type
- Stages: receiving → impression_scan → design → milling → sintering → quality_control → delivery

### 3. **Case Management**
- `cases` - Core case records with procedure types and urgency levels
- `case_files` - Document and image attachments
- `case_notes` - Timestamped notes and comments

### 4. **Billing & Invoices**
- `invoices` - Invoice records with status tracking
- `invoice_items` - Line items for invoices
- `payments` - Payment records with multiple methods

### 5. **Inventory Management**
- `suppliers` - Supplier directory with ratings
- `inventory_items` - Materials, tools, equipment, and consumables
- `inventory_transactions` - Complete audit trail of movements

### 6. **Staff Management**
- `staff_profiles` - Extended staff information
- `staff_schedules` - Weekly work schedules
- `performance_reviews` - Employee performance evaluations

### 7. **Department Management**
- `departments` - Lab departments with budget tracking
- `department_equipment` - Equipment by department with maintenance dates

### 8. **Communications**
- `conversations` - Direct, group, and case-based discussions
- `conversation_participants` - Thread participants
- `messages` - Individual messages with read status
- `notifications` - User notifications with custom data

### 9. **Dentist Network**
- `dentist_profiles` - Partner information and metrics
- `dentist_applications` - Partnership applications with approval workflow

### 10. **Calendar & Appointments**
- `appointments` - Case reviews, deliveries, meetings, and training

### 11. **Reports & Analytics**
Five materialized views:
- `monthly_revenue` - Revenue analysis by month
- `case_completion_rates` - Completion metrics by procedure type
- `department_efficiency` - Department performance metrics
- `staff_performance` - Individual staff metrics and ratings
- `inventory_turnover` - Stock status and movement analysis

### 12. **Access Control**
- `roles` - System roles (Admin, Manager, Technician, Dentist, Staff)
- `permissions` - Granular permissions by module
- `role_permissions` - Role-to-permission mapping

### 13. **Logistics**
- `shipments` - Pickup and delivery tracking
- `delivery_routes` - Route management
- `route_stops` - Individual stops with addresses and timing

### 14. **Settings & Audit**
- `settings` - System configuration management
- `audit_log` - Complete audit trail of all changes

## Key Features

### Primary Keys
- All tables use UUID (uuid_generate_v4()) for primary keys
- Distributed architecture friendly

### Soft Deletes
- `deleted_at` timestamp on all major tables
- Preserves data integrity while allowing logical deletion
- Filtered by default in views

### Timestamps
- `created_at` - Record creation time
- `updated_at` - Last modification time
- Automatic updates via triggers

### Constraints
- Foreign key relationships with ON DELETE CASCADE/SET NULL
- CHECK constraints for data validation (e.g., end_time > start_time)
- UNIQUE constraints on business keys (email, case_number, invoice_number)
- NOT NULL constraints where data is mandatory

### Indexes
- 100+ indexes for optimal query performance
- Status fields indexed for filtering
- Foreign key columns indexed for joins
- Date fields indexed for range queries
- Business keys indexed for lookups

### Enums (Custom PostgreSQL Types)
1. `user_role` - admin, manager, technician, dentist, staff
2. `procedure_type` - crowns, implants, veneers, dentures, etc.
3. `urgency_level` - standard, rush, emergency
4. `priority_level` - high, medium, low
5. `case_status` - received, processing, designing, milling, qc, ready, delivered, cancelled, on_hold
6. `workflow_stage_name` - 7 stages of production
7. `workflow_status` - pending, in_progress, completed, blocked, on_hold
8. `invoice_status` - draft, sent, paid, overdue, cancelled, refunded
9. `payment_method` - credit_card, bank_transfer, check, cash, other
10. `inventory_transaction_type` - in, out, adjustment, damage, write_off
11. `inventory_category` - materials, tools, equipment, consumables, supplies
12. `employment_type` - full_time, part_time, contract, temporary, intern
13. `equipment_status` - active, maintenance, inactive, broken, decommissioned
14. `conversation_type` - direct, group, case
15. `notification_type` - case_update, assignment, message, invoice, appointment, system, alert
16. Plus more for dentist_status, appointment_type, shipment_type, etc.

### JSONB Columns
- `skills` in staff_profiles - Store array of skills
- `data` in notifications - Store custom notification data
- `old_values` / `new_values` in audit_log - Store change history

### Seed Data
- 5 predefined roles with descriptions
- 30+ permissions grouped by module
- Ready for role_permissions mapping

### Helper Functions
- `update_updated_at_column()` - Automatic timestamp updates
- Applied to 7 main tables via triggers
- Includes soft delete capability

## Table Relationships Overview

```
users (core)
  ├── sessions (1:N)
  ├── password_reset_tokens (1:N)
  ├── staff_profiles (1:1)
  │   ├── department (1:N)
  │   ├── staff_schedules (1:N)
  │   ├── performance_reviews (1:N)
  │   └── delivery_routes (driver)
  ├── dentist_profiles (1:1)
  │   └── cases (dentist_id 1:N)
  ├── case_notes (1:N)
  ├── case_files (uploaded_by 1:N)
  ├── workflow_stages (assigned_to 1:N)
  ├── appointments (created_by 1:N)
  └── audit_log (1:N)

cases (core workflow)
  ├── workflow_stages (1:N)
  ├── case_files (1:N)
  ├── case_notes (1:N)
  ├── invoices (1:N)
  ├── appointments (1:N)
  ├── shipments (1:N)
  └── route_stops (1:N)

invoices (billing)
  ├── invoice_items (1:N)
  ├── payments (1:N)
  └── audit_log

inventory_items (warehouse)
  ├── suppliers (1:N)
  ├── inventory_transactions (1:N)
  └── audit_log

conversations (communications)
  ├── conversation_participants (1:N)
  ├── messages (1:N)
  └── audit_log
```

## Usage Instructions

### Import the Schema
```bash
psql -U postgres -d your_database -f schema.sql
```

### Create Database First
```bash
createdb dental_lab_db
psql -U postgres -d dental_lab_db -f schema.sql
```

### With Docker
```bash
docker exec -i postgres_container psql -U postgres -d dental_lab_db < schema.sql
```

### Verify Installation
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

## Performance Considerations

1. **UUID vs Integer**: UUIDs allow distributed inserts without coordination
2. **Indexes**: Over 100 strategic indexes for common queries
3. **Soft Deletes**: Efficient filtering with deleted_at INDEX
4. **Materialized Views**: Pre-computed analytics for reporting
5. **JSONB**: Flexible schema for nested data (skills, notification data)

## Security Features

1. **Soft Deletes**: No permanent data loss
2. **Audit Log**: Complete change history with user and IP tracking
3. **Role-Based Access**: Granular permission system
4. **Password Hashing**: Passwords stored as hashes only
5. **Session Management**: Token-based authentication
6. **Data Validation**: CHECK constraints and NOT NULL enforcements

## Future Enhancements

- Add row-level security (RLS) policies for multi-tenant support
- Create stored procedures for common business logic
- Add full-text search indexes for case notes and messages
- Implement change data capture (CDC) for real-time syncing
- Add materialized view refresh schedules
- Create database backup and recovery procedures

## Notes

- All timestamps are in UTC (no timezone conversion)
- Soft deletes are not cascaded by design (prevents accidental deletions)
- UUIDs provide better security and distributed system compatibility
- JSONB columns allow schema flexibility without migrations
- Comprehensive indexes reduce query times but increase write overhead
