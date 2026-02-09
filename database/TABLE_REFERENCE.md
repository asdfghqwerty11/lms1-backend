# Database Tables Reference Guide

## Complete Table Listing by Module

### Module 1: Authentication & Users
| Table | Columns | Purpose |
|-------|---------|---------|
| `users` | id, email, password_hash, role, first_name, last_name, phone, avatar_url, status, last_login_at, created_at, updated_at, deleted_at | Core user accounts |
| `sessions` | id, user_id, token_hash, ip_address, user_agent, expires_at, created_at | Authentication sessions |
| `password_reset_tokens` | id, user_id, token_hash, used_at, expires_at, created_at | Password recovery |

### Module 2: Lab Workflow
| Table | Columns | Purpose |
|-------|---------|---------|
| `workflow_stages` | id, case_id, stage_name, status, assigned_to, started_at, completed_at, notes, created_at, updated_at, deleted_at | 7-stage case workflow |
| `workflow_templates` | id, name, procedure_type, description, stages (JSONB), is_default, created_at, updated_at, deleted_at | Reusable workflow templates |

### Module 3: Case Management
| Table | Columns | Purpose |
|-------|---------|---------|
| `cases` | id, case_number, patient_name, dentist_id, procedure_type, material, shade, urgency, status, priority, due_date, delivery_date, notes, created_at, updated_at, deleted_at | Core case records |
| `case_files` | id, case_id, file_url, file_type, file_name, file_size, uploaded_by, created_at, deleted_at | Case attachments |
| `case_notes` | id, case_id, user_id, note, created_at, updated_at, deleted_at | Case comments |

### Module 4: Billing & Invoices
| Table | Columns | Purpose |
|-------|---------|---------|
| `invoices` | id, invoice_number, case_id, dentist_id, amount, tax, total, status, due_date, paid_at, created_at, updated_at, deleted_at | Invoice records |
| `invoice_items` | id, invoice_id, description, quantity, unit_price, total, created_at, deleted_at | Line items |
| `payments` | id, invoice_id, amount, method, reference, paid_at, created_at, deleted_at | Payment records |

### Module 5: Inventory Management
| Table | Columns | Purpose |
|-------|---------|---------|
| `suppliers` | id, name, contact_name, email, phone, address, city, state, postal_code, country, notes, rating, is_active, created_at, updated_at, deleted_at | Supplier directory |
| `inventory_items` | id, name, sku, category, quantity, min_stock, max_stock, unit, unit_price, supplier_id, location, status, created_at, updated_at, deleted_at | Inventory stock |
| `inventory_transactions` | id, item_id, type, quantity, reference, user_id, notes, created_at, deleted_at | Movement audit trail |

### Module 6: Staff Management
| Table | Columns | Purpose |
|-------|---------|---------|
| `staff_profiles` | id, user_id, department_id, position, skills (JSONB), hourly_rate, employment_type, hire_date, created_at, updated_at, deleted_at | Employee profiles |
| `staff_schedules` | id, staff_id, day_of_week, start_time, end_time, created_at, updated_at, deleted_at | Work schedules |
| `performance_reviews` | id, staff_id, reviewer_id, rating, feedback, period_start, period_end, created_at, updated_at, deleted_at | Performance reviews |

### Module 7: Department Management
| Table | Columns | Purpose |
|-------|---------|---------|
| `departments` | id, name, description, head_id, budget, created_at, updated_at, deleted_at | Lab departments |
| `department_equipment` | id, department_id, name, status, purchase_date, maintenance_due, notes, created_at, updated_at, deleted_at | Equipment inventory |

### Module 8: Communications
| Table | Columns | Purpose |
|-------|---------|---------|
| `conversations` | id, title, type, case_id, created_at, updated_at, deleted_at | Chat threads |
| `conversation_participants` | id, conversation_id, user_id, created_at | Thread members |
| `messages` | id, conversation_id, sender_id, content, read_at, created_at, updated_at, deleted_at | Messages |
| `notifications` | id, user_id, type, title, message, read, data (JSONB), created_at, deleted_at | User notifications |

### Module 9: Dentist Network
| Table | Columns | Purpose |
|-------|---------|---------|
| `dentist_profiles` | id, user_id, clinic_name, specialty, address, rating, total_cases, monthly_revenue, status, created_at, updated_at, deleted_at | Partner profiles |
| `dentist_applications` | id, dentist_name, clinic_name, email, phone, specialty, notes, status, created_at, updated_at, reviewed_by, reviewed_at, deleted_at | Partnership applications |

### Module 10: Calendar & Appointments
| Table | Columns | Purpose |
|-------|---------|---------|
| `appointments` | id, title, type, case_id, staff_id, dentist_id, start_time, end_time, status, notes, created_by, created_at, updated_at, deleted_at | Calendar events |

### Module 11: Reports & Analytics (Views)
| View | Purpose |
|------|---------|
| `monthly_revenue` | Monthly revenue analysis |
| `case_completion_rates` | Case completion by procedure type |
| `department_efficiency` | Department performance metrics |
| `staff_performance` | Individual staff metrics |
| `inventory_turnover` | Stock movement analysis |

### Module 12: Access Control
| Table | Columns | Purpose |
|-------|---------|---------|
| `roles` | id, name, description, created_at, updated_at, deleted_at | User roles |
| `permissions` | id, name, description, module, created_at, deleted_at | System permissions |
| `role_permissions` | id, role_id, permission_id, created_at | Role-permission mapping |

### Module 13: Logistics
| Table | Columns | Purpose |
|-------|---------|---------|
| `shipments` | id, case_id, type, status, tracking_number, carrier, pickup_address, delivery_address, scheduled_date, completed_date, created_at, updated_at, deleted_at | Shipment tracking |
| `delivery_routes` | id, name, driver_id, route_date, status, created_at, updated_at, deleted_at | Route planning |
| `route_stops` | id, route_id, order_sequence, address, case_id, type, estimated_time, completed_at, created_at, updated_at, deleted_at | Route stops |

### Module 14: Settings & Audit
| Table | Columns | Purpose |
|-------|---------|---------|
| `settings` | id, key, value, category, updated_by, updated_at | System configuration |
| `audit_log` | id, user_id, action, entity_type, entity_id, old_values (JSONB), new_values (JSONB), ip_address, user_agent, created_at | Change audit trail |

## Total Count: 34 Tables + 5 Views = 39 Objects

## Key Field Types Used

### Enums (PostgreSQL Custom Types)
- `user_role` - admin, manager, technician, dentist, staff
- `procedure_type` - crowns, implants, veneers, dentures, partial_dentures, orthodontic, bridge, other
- `urgency_level` - standard, rush, emergency
- `priority_level` - high, medium, low
- `case_status` - received, processing, designing, milling, qc, ready, delivered, cancelled, on_hold
- `workflow_stage_name` - receiving, impression_scan, design, milling, sintering, quality_control, delivery
- `workflow_status` - pending, in_progress, completed, blocked, on_hold
- `invoice_status` - draft, sent, paid, overdue, cancelled, refunded
- `payment_method` - credit_card, bank_transfer, check, cash, other
- `inventory_transaction_type` - in, out, adjustment, damage, write_off
- `inventory_category` - materials, tools, equipment, consumables, supplies
- `employment_type` - full_time, part_time, contract, temporary, intern
- `equipment_status` - active, maintenance, inactive, broken, decommissioned
- `conversation_type` - direct, group, case
- `notification_type` - case_update, assignment, message, invoice, appointment, system, alert
- `dentist_status` - active, pending, inactive, suspended
- `application_status` - pending, approved, rejected
- `appointment_type` - design_review, quality_check, delivery, meeting, training, other
- `appointment_status` - scheduled, in_progress, completed, cancelled, no_show
- `shipment_type` - pickup, delivery
- `shipment_status` - pending, in_transit, arrived, delivered, failed, cancelled
- `route_status` - planned, in_progress, completed, cancelled
- `route_stop_type` - pickup, delivery, inspection
- `account_status` - active, inactive, suspended, pending_verification, deleted

### Standard Columns
- `id` - UUID primary key (uuid_generate_v4())
- `created_at` - Record creation timestamp
- `updated_at` - Last modification timestamp (auto-updated)
- `deleted_at` - Soft delete timestamp

### Foreign Keys
- All foreign keys use UUID references
- CASCADE delete for child records
- SET NULL for optional references

## Indexes Summary

### By Category
- **Primary Keys**: 34 (one per table)
- **Foreign Keys**: 40+ (on all relationship fields)
- **Status Fields**: 20+ (for filtering by status)
- **Date Fields**: 15+ (for range queries)
- **Business Keys**: 10+ (email, case_number, invoice_number, sku, etc.)
- **Lookup Fields**: 15+ (names, IDs for common queries)

**Total Indexes: 100+** for optimal query performance

## Common Query Patterns

### Get Active Cases by Dentist
```sql
SELECT * FROM cases 
WHERE dentist_id = ? AND status != 'cancelled' AND deleted_at IS NULL
ORDER BY due_date ASC;
```

### Get Case Workflow Progress
```sql
SELECT stage_name, status, assigned_to, started_at, completed_at
FROM workflow_stages
WHERE case_id = ? AND deleted_at IS NULL
ORDER BY stage_name;
```

### Get Unpaid Invoices
```sql
SELECT i.*, d.clinic_name
FROM invoices i
JOIN dentist_profiles d ON i.dentist_id = d.id
WHERE i.status IN ('sent', 'overdue') AND i.deleted_at IS NULL
ORDER BY i.due_date ASC;
```

### Inventory Low Stock
```sql
SELECT * FROM inventory_items
WHERE quantity < min_stock AND status = 'active' AND deleted_at IS NULL
ORDER BY name;
```

### Staff Schedule for Date
```sql
SELECT sp.*, ss.start_time, ss.end_time
FROM staff_profiles sp
JOIN staff_schedules ss ON sp.id = ss.staff_id
WHERE EXTRACT(DOW FROM ?) = ss.day_of_week AND sp.deleted_at IS NULL;
```

## Notes
- All PRIMARY KEYs are UUID for distributed system compatibility
- All timestamps stored in UTC
- JSONB columns used for flexible data structures (skills, notification data, audit changes)
- Soft deletes maintained via deleted_at column with indexes
- 100+ strategic indexes for query performance
- Triggers automatically update updated_at timestamps
