-- ============================================================================
-- DENTAL LAB MANAGEMENT SYSTEM - PostgreSQL Database Schema
-- ============================================================================
-- Created: 2024
-- Database: PostgreSQL 13+
-- Purpose: Complete schema for dental lab workflow management
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS - Define all status types
-- ============================================================================

-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'technician', 'dentist', 'staff');

-- Case procedure types
CREATE TYPE procedure_type AS ENUM ('crowns', 'implants', 'veneers', 'dentures', 'partial_dentures', 'orthodontic', 'bridge', 'other');

-- Case urgency levels
CREATE TYPE urgency_level AS ENUM ('standard', 'rush', 'emergency');

-- Priority levels
CREATE TYPE priority_level AS ENUM ('high', 'medium', 'low');

-- Case status
CREATE TYPE case_status AS ENUM ('received', 'processing', 'designing', 'milling', 'qc', 'ready', 'delivered', 'cancelled', 'on_hold');

-- Workflow stages
CREATE TYPE workflow_stage_name AS ENUM ('receiving', 'impression_scan', 'design', 'milling', 'sintering', 'quality_control', 'delivery');

-- Workflow status
CREATE TYPE workflow_status AS ENUM ('pending', 'in_progress', 'completed', 'blocked', 'on_hold');

-- Invoice status
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded');

-- Payment methods
CREATE TYPE payment_method AS ENUM ('credit_card', 'bank_transfer', 'check', 'cash', 'other');

-- Inventory transaction types
CREATE TYPE inventory_transaction_type AS ENUM ('in', 'out', 'adjustment', 'damage', 'write_off');

-- Inventory item categories
CREATE TYPE inventory_category AS ENUM ('materials', 'tools', 'equipment', 'consumables', 'supplies');

-- Employment types
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'temporary', 'intern');

-- Department equipment status
CREATE TYPE equipment_status AS ENUM ('active', 'maintenance', 'inactive', 'broken', 'decommissioned');

-- Conversation types
CREATE TYPE conversation_type AS ENUM ('direct', 'group', 'case');

-- Notification types
CREATE TYPE notification_type AS ENUM ('case_update', 'assignment', 'message', 'invoice', 'appointment', 'system', 'alert');

-- Dentist status
CREATE TYPE dentist_status AS ENUM ('active', 'pending', 'inactive', 'suspended');

-- Application status
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');

-- Appointment types
CREATE TYPE appointment_type AS ENUM ('design_review', 'quality_check', 'delivery', 'meeting', 'training', 'other');

-- Appointment status
CREATE TYPE appointment_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');

-- Shipment types
CREATE TYPE shipment_type AS ENUM ('pickup', 'delivery');

-- Shipment status
CREATE TYPE shipment_status AS ENUM ('pending', 'in_transit', 'arrived', 'delivered', 'failed', 'cancelled');

-- Delivery route status
CREATE TYPE route_status AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');

-- Stop types in delivery routes
CREATE TYPE route_stop_type AS ENUM ('pickup', 'delivery', 'inspection');

-- User account status
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification', 'deleted');

-- ============================================================================
-- MODULE 1: AUTHENTICATION & USERS
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'staff',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    status account_status NOT NULL DEFAULT 'pending_verification',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

COMMENT ON TABLE users IS 'Core user accounts for all system users including staff, managers, admins, and dentists';

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Sessions table for authentication
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT token_hash_not_empty CHECK (token_hash != '')
);

COMMENT ON TABLE sessions IS 'User session management for authentication';

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    used_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE password_reset_tokens IS 'Token-based password reset mechanism';

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- ============================================================================
-- MODULE 12: ACCESS CONTROL
-- ============================================================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE roles IS 'System roles for permission management';

CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_deleted_at ON roles(deleted_at);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    module VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE permissions IS 'Individual permissions that can be assigned to roles';

CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_module ON permissions(module);
CREATE INDEX idx_permissions_deleted_at ON permissions(deleted_at);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(role_id, permission_id)
);

COMMENT ON TABLE role_permissions IS 'Junction table linking roles to permissions';

CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- ============================================================================
-- MODULE 6: DEPARTMENT MANAGEMENT
-- ============================================================================

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    head_id UUID REFERENCES users(id) ON DELETE SET NULL,
    budget DECIMAL(10, 2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE departments IS 'Lab departments (e.g., milling, design, quality control)';

CREATE INDEX idx_departments_name ON departments(name);
CREATE INDEX idx_departments_head_id ON departments(head_id);
CREATE INDEX idx_departments_deleted_at ON departments(deleted_at);

CREATE TABLE department_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    status equipment_status NOT NULL DEFAULT 'active',
    purchase_date DATE,
    maintenance_due DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE department_equipment IS 'Equipment inventory by department with maintenance tracking';

CREATE INDEX idx_department_equipment_department_id ON department_equipment(department_id);
CREATE INDEX idx_department_equipment_status ON department_equipment(status);
CREATE INDEX idx_department_equipment_maintenance_due ON department_equipment(maintenance_due);

-- ============================================================================
-- MODULE 6: STAFF MANAGEMENT
-- ============================================================================

CREATE TABLE staff_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    position VARCHAR(100),
    skills JSONB DEFAULT '[]'::jsonb,
    hourly_rate DECIMAL(8, 2),
    employment_type employment_type NOT NULL DEFAULT 'full_time',
    hire_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE staff_profiles IS 'Extended staff information linked to users';

CREATE INDEX idx_staff_profiles_user_id ON staff_profiles(user_id);
CREATE INDEX idx_staff_profiles_department_id ON staff_profiles(department_id);
CREATE INDEX idx_staff_profiles_employment_type ON staff_profiles(employment_type);

CREATE TABLE staff_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT valid_schedule CHECK (end_time > start_time),
    UNIQUE(staff_id, day_of_week)
);

COMMENT ON TABLE staff_schedules IS 'Weekly work schedules for staff members';

CREATE INDEX idx_staff_schedules_staff_id ON staff_schedules(staff_id);
CREATE INDEX idx_staff_schedules_day_of_week ON staff_schedules(day_of_week);

CREATE TABLE performance_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT valid_period CHECK (period_end > period_start)
);

COMMENT ON TABLE performance_reviews IS 'Performance evaluations for staff members';

CREATE INDEX idx_performance_reviews_staff_id ON performance_reviews(staff_id);
CREATE INDEX idx_performance_reviews_reviewer_id ON performance_reviews(reviewer_id);
CREATE INDEX idx_performance_reviews_period_start ON performance_reviews(period_start);

-- ============================================================================
-- MODULE 9: DENTIST NETWORK
-- ============================================================================

CREATE TABLE dentist_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    clinic_name VARCHAR(200) NOT NULL,
    specialty VARCHAR(100),
    address TEXT,
    rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
    total_cases INTEGER DEFAULT 0,
    monthly_revenue DECIMAL(12, 2) DEFAULT 0,
    status dentist_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE dentist_profiles IS 'Dentist partner information and metrics';

CREATE INDEX idx_dentist_profiles_user_id ON dentist_profiles(user_id);
CREATE INDEX idx_dentist_profiles_clinic_name ON dentist_profiles(clinic_name);
CREATE INDEX idx_dentist_profiles_status ON dentist_profiles(status);

CREATE TABLE dentist_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dentist_name VARCHAR(100) NOT NULL,
    clinic_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    specialty VARCHAR(100),
    notes TEXT,
    status application_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE dentist_applications IS 'Applications from dentists requesting partnership';

CREATE INDEX idx_dentist_applications_email ON dentist_applications(email);
CREATE INDEX idx_dentist_applications_status ON dentist_applications(status);
CREATE INDEX idx_dentist_applications_created_at ON dentist_applications(created_at);

-- ============================================================================
-- MODULE 3: CASE MANAGEMENT
-- ============================================================================

CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(50) NOT NULL UNIQUE,
    patient_name VARCHAR(150) NOT NULL,
    dentist_id UUID NOT NULL REFERENCES dentist_profiles(id) ON DELETE RESTRICT,
    procedure_type procedure_type NOT NULL,
    material VARCHAR(100),
    shade VARCHAR(50),
    urgency urgency_level NOT NULL DEFAULT 'standard',
    status case_status NOT NULL DEFAULT 'received',
    priority priority_level NOT NULL DEFAULT 'medium',
    due_date DATE NOT NULL,
    delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE cases IS 'Core case records with procedure details and scheduling';

CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_dentist_id ON cases(dentist_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_urgency ON cases(urgency);
CREATE INDEX idx_cases_priority ON cases(priority);
CREATE INDEX idx_cases_due_date ON cases(due_date);
CREATE INDEX idx_cases_created_at ON cases(created_at);
CREATE INDEX idx_cases_deleted_at ON cases(deleted_at);

CREATE TABLE case_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE case_files IS 'Attachments and documents associated with cases';

CREATE INDEX idx_case_files_case_id ON case_files(case_id);
CREATE INDEX idx_case_files_uploaded_by ON case_files(uploaded_by);
CREATE INDEX idx_case_files_created_at ON case_files(created_at);

CREATE TABLE case_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    note TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE case_notes IS 'Timestamped notes and comments on cases';

CREATE INDEX idx_case_notes_case_id ON case_notes(case_id);
CREATE INDEX idx_case_notes_user_id ON case_notes(user_id);
CREATE INDEX idx_case_notes_created_at ON case_notes(created_at);

-- ============================================================================
-- MODULE 2: LAB WORKFLOW
-- ============================================================================

CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    procedure_type procedure_type NOT NULL,
    description TEXT,
    stages JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    UNIQUE(procedure_type, is_default)
);

COMMENT ON TABLE workflow_templates IS 'Predefined workflow templates for different procedure types';

CREATE INDEX idx_workflow_templates_procedure_type ON workflow_templates(procedure_type);
CREATE INDEX idx_workflow_templates_is_default ON workflow_templates(is_default);

CREATE TABLE workflow_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    stage_name workflow_stage_name NOT NULL,
    status workflow_status NOT NULL DEFAULT 'pending',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT valid_timestamps CHECK (completed_at IS NULL OR completed_at >= started_at)
);

COMMENT ON TABLE workflow_stages IS 'Individual workflow stages for each case progressing through 7 stages';

CREATE INDEX idx_workflow_stages_case_id ON workflow_stages(case_id);
CREATE INDEX idx_workflow_stages_stage_name ON workflow_stages(stage_name);
CREATE INDEX idx_workflow_stages_status ON workflow_stages(status);
CREATE INDEX idx_workflow_stages_assigned_to ON workflow_stages(assigned_to);
CREATE INDEX idx_workflow_stages_started_at ON workflow_stages(started_at);
CREATE INDEX idx_workflow_stages_completed_at ON workflow_stages(completed_at);

-- ============================================================================
-- MODULE 4: BILLING & INVOICES
-- ============================================================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
    dentist_id UUID NOT NULL REFERENCES dentist_profiles(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL,
    tax DECIMAL(12, 2) DEFAULT 0,
    total DECIMAL(12, 2) NOT NULL,
    status invoice_status NOT NULL DEFAULT 'draft',
    due_date DATE NOT NULL,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT valid_amounts CHECK (amount >= 0 AND tax >= 0 AND total >= 0)
);

COMMENT ON TABLE invoices IS 'Invoice records for completed cases and services';

CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_case_id ON invoices(case_id);
CREATE INDEX idx_invoices_dentist_id ON invoices(dentist_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
    total DECIMAL(12, 2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE invoice_items IS 'Line items for invoices';

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    method payment_method NOT NULL,
    reference VARCHAR(255),
    paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE payments IS 'Payment records for invoices';

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);

-- ============================================================================
-- MODULE 5: INVENTORY MANAGEMENT
-- ============================================================================

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(150),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    notes TEXT,
    rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE suppliers IS 'Supplier information for inventory management';

CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_email ON suppliers(email);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    category inventory_category NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    min_stock INTEGER NOT NULL DEFAULT 10 CHECK (min_stock >= 0),
    max_stock INTEGER NOT NULL DEFAULT 100 CHECK (max_stock >= min_stock),
    unit VARCHAR(50) NOT NULL DEFAULT 'unit',
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    location VARCHAR(255),
    status account_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE inventory_items IS 'Inventory management for materials, tools, equipment, and consumables';

CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_supplier_id ON inventory_items(supplier_id);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
CREATE INDEX idx_inventory_items_quantity ON inventory_items(quantity);

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    type inventory_transaction_type NOT NULL,
    quantity INTEGER NOT NULL,
    reference VARCHAR(255),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE inventory_transactions IS 'Audit trail for all inventory movements';

CREATE INDEX idx_inventory_transactions_item_id ON inventory_transactions(item_id);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(type);
CREATE INDEX idx_inventory_transactions_user_id ON inventory_transactions(user_id);
CREATE INDEX idx_inventory_transactions_created_at ON inventory_transactions(created_at);

-- ============================================================================
-- MODULE 8: COMMUNICATIONS
-- ============================================================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    type conversation_type NOT NULL,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE conversations IS 'Communication threads for direct, group, or case-based discussions';

CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_case_id ON conversations(case_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);

CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(conversation_id, user_id)
);

COMMENT ON TABLE conversation_participants IS 'Participants in conversations';

CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE messages IS 'Individual messages within conversations';

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_read_at ON messages(read_at);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE notifications IS 'User notifications for case updates, assignments, and system alerts';

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================================================
-- MODULE 10: CALENDAR & APPOINTMENTS
-- ============================================================================

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    type appointment_type NOT NULL,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    dentist_id UUID REFERENCES dentist_profiles(id) ON DELETE SET NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT valid_appointment_times CHECK (end_time > start_time)
);

COMMENT ON TABLE appointments IS 'Calendar appointments for cases, reviews, deliveries, and meetings';

CREATE INDEX idx_appointments_case_id ON appointments(case_id);
CREATE INDEX idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX idx_appointments_dentist_id ON appointments(dentist_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_type ON appointments(type);

-- ============================================================================
-- MODULE 13: LOGISTICS
-- ============================================================================

CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
    type shipment_type NOT NULL,
    status shipment_status NOT NULL DEFAULT 'pending',
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    pickup_address TEXT,
    delivery_address TEXT,
    scheduled_date DATE,
    completed_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE shipments IS 'Shipment tracking for case pickups and deliveries';

CREATE INDEX idx_shipments_case_id ON shipments(case_id);
CREATE INDEX idx_shipments_type ON shipments(type);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX idx_shipments_scheduled_date ON shipments(scheduled_date);

CREATE TABLE delivery_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    driver_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    route_date DATE NOT NULL,
    status route_status NOT NULL DEFAULT 'planned',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE delivery_routes IS 'Delivery routes for logistics management';

CREATE INDEX idx_delivery_routes_driver_id ON delivery_routes(driver_id);
CREATE INDEX idx_delivery_routes_route_date ON delivery_routes(route_date);
CREATE INDEX idx_delivery_routes_status ON delivery_routes(status);

CREATE TABLE route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES delivery_routes(id) ON DELETE CASCADE,
    order_sequence SMALLINT NOT NULL,
    address TEXT NOT NULL,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    type route_stop_type NOT NULL,
    estimated_time TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    UNIQUE(route_id, order_sequence)
);

COMMENT ON TABLE route_stops IS 'Individual stops on delivery routes';

CREATE INDEX idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX idx_route_stops_case_id ON route_stops(case_id);
CREATE INDEX idx_route_stops_order_sequence ON route_stops(order_sequence);

-- ============================================================================
-- MODULE 14: SETTINGS & AUDIT
-- ============================================================================

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    category VARCHAR(50),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE settings IS 'System configuration and settings management';

CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_category ON settings(category);

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE audit_log IS 'Complete audit trail of all system changes';

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX idx_audit_log_entity_id ON audit_log(entity_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ============================================================================
-- MODULE 11: REPORTS & ANALYTICS - VIEWS
-- ============================================================================

-- Monthly Revenue Report
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT
    DATE_TRUNC('month', i.created_at)::DATE AS month,
    COUNT(DISTINCT i.id) AS invoice_count,
    SUM(i.total) FILTER (WHERE i.status = 'paid') AS paid_amount,
    SUM(i.total) AS total_amount,
    SUM(i.total) FILTER (WHERE i.status = 'overdue') AS overdue_amount,
    COUNT(DISTINCT i.dentist_id) AS unique_dentists
FROM invoices i
WHERE i.deleted_at IS NULL
GROUP BY DATE_TRUNC('month', i.created_at);

COMMENT ON VIEW monthly_revenue IS 'Monthly revenue analysis across all invoices';

-- Case Completion Rates
CREATE OR REPLACE VIEW case_completion_rates AS
SELECT
    c.procedure_type,
    COUNT(DISTINCT c.id) AS total_cases,
    COUNT(DISTINCT CASE WHEN c.status = 'delivered' THEN c.id END) AS completed_cases,
    COUNT(DISTINCT CASE WHEN c.status IN ('processing', 'designing', 'milling', 'qc') THEN c.id END) AS in_progress_cases,
    COUNT(DISTINCT CASE WHEN c.status = 'cancelled' THEN c.id END) AS cancelled_cases,
    ROUND(
        COUNT(DISTINCT CASE WHEN c.status = 'delivered' THEN c.id END)::NUMERIC /
        NULLIF(COUNT(DISTINCT c.id), 0) * 100, 2
    ) AS completion_percentage,
    AVG(EXTRACT(DAY FROM c.updated_at - c.created_at)) AS avg_days_to_completion
FROM cases c
WHERE c.deleted_at IS NULL
GROUP BY c.procedure_type;

COMMENT ON VIEW case_completion_rates IS 'Case completion analysis by procedure type';

-- Department Efficiency
CREATE OR REPLACE VIEW department_efficiency AS
SELECT
    d.id,
    d.name,
    COUNT(DISTINCT sp.id) AS staff_count,
    COUNT(DISTINCT ws.id) AS total_stages,
    COUNT(DISTINCT CASE WHEN ws.status = 'completed' THEN ws.id END) AS completed_stages,
    ROUND(
        COUNT(DISTINCT CASE WHEN ws.status = 'completed' THEN ws.id END)::NUMERIC /
        NULLIF(COUNT(DISTINCT ws.id), 0) * 100, 2
    ) AS completion_rate
FROM departments d
LEFT JOIN staff_profiles sp ON d.id = sp.department_id AND sp.deleted_at IS NULL
LEFT JOIN workflow_stages ws ON sp.user_id = ws.assigned_to AND ws.deleted_at IS NULL
WHERE d.deleted_at IS NULL
GROUP BY d.id, d.name;

COMMENT ON VIEW department_efficiency IS 'Department-level efficiency metrics';

-- Staff Performance
CREATE OR REPLACE VIEW staff_performance AS
SELECT
    sp.id,
    u.first_name || ' ' || u.last_name AS staff_name,
    d.name AS department,
    COUNT(DISTINCT ws.id) AS stages_assigned,
    COUNT(DISTINCT CASE WHEN ws.status = 'completed' THEN ws.id END) AS stages_completed,
    ROUND(
        COUNT(DISTINCT CASE WHEN ws.status = 'completed' THEN ws.id END)::NUMERIC /
        NULLIF(COUNT(DISTINCT ws.id), 0) * 100, 2
    ) AS completion_rate,
    AVG(pr.rating) AS avg_review_rating
FROM staff_profiles sp
JOIN users u ON sp.user_id = u.id
LEFT JOIN departments d ON sp.department_id = d.id
LEFT JOIN workflow_stages ws ON sp.user_id = ws.assigned_to AND ws.deleted_at IS NULL
LEFT JOIN performance_reviews pr ON sp.id = pr.staff_id AND pr.deleted_at IS NULL
WHERE sp.deleted_at IS NULL AND u.deleted_at IS NULL
GROUP BY sp.id, u.first_name, u.last_name, d.name;

COMMENT ON VIEW staff_performance IS 'Individual staff performance metrics and ratings';

-- Inventory Turnover
CREATE OR REPLACE VIEW inventory_turnover AS
SELECT
    ii.id,
    ii.sku,
    ii.name,
    ii.category,
    ii.quantity,
    ii.min_stock,
    COUNT(DISTINCT it.id) AS transaction_count,
    SUM(CASE WHEN it.type = 'in' THEN it.quantity ELSE 0 END) AS total_in,
    SUM(CASE WHEN it.type = 'out' THEN it.quantity ELSE 0 END) AS total_out,
    CASE
        WHEN ii.quantity < ii.min_stock THEN 'LOW_STOCK'
        WHEN ii.quantity > ii.max_stock THEN 'OVERSTOCKED'
        ELSE 'NORMAL'
    END AS stock_status
FROM inventory_items ii
LEFT JOIN inventory_transactions it ON ii.id = it.item_id AND it.deleted_at IS NULL
WHERE ii.deleted_at IS NULL
GROUP BY ii.id, ii.sku, ii.name, ii.category, ii.quantity, ii.min_stock, ii.max_stock;

COMMENT ON VIEW inventory_turnover IS 'Inventory turnover and stock status analysis';

-- ============================================================================
-- SEED DATA - Roles and Permissions
-- ============================================================================

-- Insert base roles
INSERT INTO roles (id, name, description) VALUES
    (uuid_generate_v4(), 'Admin', 'System administrator with full access'),
    (uuid_generate_v4(), 'Manager', 'Lab manager with workflow and staff oversight'),
    (uuid_generate_v4(), 'Technician', 'Lab technician with case workflow access'),
    (uuid_generate_v4(), 'Dentist', 'Dentist partner with case submission and tracking'),
    (uuid_generate_v4(), 'Staff', 'General staff member with limited access')
ON CONFLICT DO NOTHING;

-- Insert permissions by module
INSERT INTO permissions (id, name, description, module) VALUES
    -- Authentication module
    (uuid_generate_v4(), 'auth.login', 'User login', 'authentication'),
    (uuid_generate_v4(), 'auth.logout', 'User logout', 'authentication'),
    (uuid_generate_v4(), 'auth.reset_password', 'Password reset', 'authentication'),

    -- Case Management module
    (uuid_generate_v4(), 'cases.create', 'Create new case', 'case_management'),
    (uuid_generate_v4(), 'cases.read', 'View case details', 'case_management'),
    (uuid_generate_v4(), 'cases.update', 'Update case information', 'case_management'),
    (uuid_generate_v4(), 'cases.delete', 'Delete case', 'case_management'),
    (uuid_generate_v4(), 'cases.add_notes', 'Add notes to case', 'case_management'),
    (uuid_generate_v4(), 'cases.upload_files', 'Upload case files', 'case_management'),

    -- Workflow module
    (uuid_generate_v4(), 'workflow.start_stage', 'Start workflow stage', 'workflow'),
    (uuid_generate_v4(), 'workflow.complete_stage', 'Complete workflow stage', 'workflow'),
    (uuid_generate_v4(), 'workflow.view', 'View workflow progress', 'workflow'),

    -- Billing module
    (uuid_generate_v4(), 'invoices.create', 'Create invoices', 'billing'),
    (uuid_generate_v4(), 'invoices.read', 'View invoices', 'billing'),
    (uuid_generate_v4(), 'invoices.update', 'Update invoices', 'billing'),
    (uuid_generate_v4(), 'invoices.mark_paid', 'Mark invoice as paid', 'billing'),
    (uuid_generate_v4(), 'payments.record', 'Record payments', 'billing'),

    -- Inventory module
    (uuid_generate_v4(), 'inventory.manage', 'Manage inventory', 'inventory'),
    (uuid_generate_v4(), 'inventory.view', 'View inventory', 'inventory'),
    (uuid_generate_v4(), 'inventory.adjust', 'Adjust stock levels', 'inventory'),

    -- Staff Management module
    (uuid_generate_v4(), 'staff.manage', 'Manage staff profiles', 'staff'),
    (uuid_generate_v4(), 'staff.view', 'View staff information', 'staff'),
    (uuid_generate_v4(), 'staff.schedule', 'Manage schedules', 'staff'),
    (uuid_generate_v4(), 'staff.review', 'Create performance reviews', 'staff'),

    -- Communications module
    (uuid_generate_v4(), 'messages.send', 'Send messages', 'communications'),
    (uuid_generate_v4(), 'messages.read', 'Read messages', 'communications'),
    (uuid_generate_v4(), 'notifications.manage', 'Manage notifications', 'communications'),

    -- Reports module
    (uuid_generate_v4(), 'reports.view', 'View reports and analytics', 'reports'),
    (uuid_generate_v4(), 'reports.export', 'Export reports', 'reports'),

    -- Access Control module
    (uuid_generate_v4(), 'roles.manage', 'Manage roles and permissions', 'access_control'),
    (uuid_generate_v4(), 'roles.view', 'View roles and permissions', 'access_control'),

    -- Settings module
    (uuid_generate_v4(), 'settings.manage', 'Manage system settings', 'settings'),
    (uuid_generate_v4(), 'audit.view', 'View audit logs', 'settings')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_stages_updated_at BEFORE UPDATE ON workflow_stages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_profiles_updated_at BEFORE UPDATE ON staff_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function for soft delete (set deleted_at)
CREATE OR REPLACE FUNCTION soft_delete_record()
RETURNS TRIGGER AS $$
BEGIN
    NEW.deleted_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANTS & PERMISSIONS (Optional - Customize based on your user structure)
-- ============================================================================

-- Revoke public access
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

-- Create application role (customize as needed)
CREATE ROLE app_user WITH LOGIN PASSWORD 'change_me';
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
