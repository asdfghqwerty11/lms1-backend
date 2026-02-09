-- ============================================================================
-- DENTAL LAB MANAGEMENT SYSTEM - Common SQL Queries Reference
-- ============================================================================

-- ============================================================================
-- CASE MANAGEMENT QUERIES
-- ============================================================================

-- Get all active cases by dentist with due dates
SELECT 
    c.id,
    c.case_number,
    c.patient_name,
    c.procedure_type,
    c.urgency,
    c.status,
    c.due_date,
    d.clinic_name
FROM cases c
JOIN dentist_profiles d ON c.dentist_id = d.id
WHERE c.status NOT IN ('delivered', 'cancelled')
    AND c.deleted_at IS NULL
ORDER BY c.due_date ASC;

-- Get case workflow progress
SELECT 
    c.case_number,
    c.patient_name,
    ws.stage_name,
    ws.status,
    u.first_name || ' ' || u.last_name AS assigned_to,
    ws.started_at,
    ws.completed_at
FROM cases c
JOIN workflow_stages ws ON c.id = ws.case_id
LEFT JOIN users u ON ws.assigned_to = u.id
WHERE c.id = ?
    AND ws.deleted_at IS NULL
ORDER BY 
    CASE ws.stage_name
        WHEN 'receiving' THEN 1
        WHEN 'impression_scan' THEN 2
        WHEN 'design' THEN 3
        WHEN 'milling' THEN 4
        WHEN 'sintering' THEN 5
        WHEN 'quality_control' THEN 6
        WHEN 'delivery' THEN 7
    END;

-- Cases overdue
SELECT 
    c.case_number,
    c.patient_name,
    c.due_date,
    CURRENT_DATE - c.due_date AS days_overdue,
    c.status,
    d.clinic_name
FROM cases c
JOIN dentist_profiles d ON c.dentist_id = d.id
WHERE c.due_date < CURRENT_DATE
    AND c.status NOT IN ('delivered', 'cancelled')
    AND c.deleted_at IS NULL
ORDER BY c.due_date ASC;

-- ============================================================================
-- WORKFLOW & ASSIGNMENT QUERIES
-- ============================================================================

-- Get workflow stages awaiting action
SELECT 
    ws.id,
    c.case_number,
    c.patient_name,
    ws.stage_name,
    u.first_name || ' ' || u.last_name AS assigned_to,
    ws.started_at,
    CURRENT_TIMESTAMP - ws.started_at AS duration
FROM workflow_stages ws
JOIN cases c ON ws.case_id = c.id
LEFT JOIN users u ON ws.assigned_to = u.id
WHERE ws.status = 'in_progress'
    AND ws.deleted_at IS NULL
    AND c.deleted_at IS NULL
ORDER BY ws.started_at ASC;

-- Assign workflow stage to staff member
UPDATE workflow_stages
SET 
    assigned_to = ?,
    status = 'in_progress',
    started_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND deleted_at IS NULL
RETURNING *;

-- Complete workflow stage
UPDATE workflow_stages
SET 
    status = 'completed',
    completed_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND deleted_at IS NULL
RETURNING *;

-- ============================================================================
-- BILLING QUERIES
-- ============================================================================

-- Get unpaid invoices
SELECT 
    i.id,
    i.invoice_number,
    c.case_number,
    d.clinic_name,
    i.total,
    i.due_date,
    CURRENT_DATE - i.due_date AS days_overdue,
    i.status
FROM invoices i
JOIN cases c ON i.case_id = c.id
JOIN dentist_profiles d ON i.dentist_id = d.id
WHERE i.status IN ('sent', 'overdue')
    AND i.deleted_at IS NULL
ORDER BY i.due_date ASC;

-- Monthly revenue report
SELECT 
    DATE_TRUNC('month', i.created_at)::DATE AS month,
    COUNT(*) AS invoice_count,
    SUM(i.total) FILTER (WHERE i.status = 'paid') AS paid_amount,
    SUM(i.total) AS total_invoiced,
    SUM(i.total) FILTER (WHERE i.status = 'overdue') AS overdue_amount
FROM invoices i
WHERE i.deleted_at IS NULL
GROUP BY DATE_TRUNC('month', i.created_at)
ORDER BY month DESC;

-- Get dentist revenue
SELECT 
    d.clinic_name,
    COUNT(DISTINCT i.id) AS total_invoices,
    SUM(i.total) FILTER (WHERE i.status = 'paid') AS paid_total,
    SUM(i.total) AS total_invoiced
FROM invoices i
JOIN dentist_profiles d ON i.dentist_id = d.id
WHERE i.deleted_at IS NULL
GROUP BY d.id, d.clinic_name
ORDER BY total_invoiced DESC;

-- ============================================================================
-- INVENTORY QUERIES
-- ============================================================================

-- Low stock items
SELECT 
    id,
    name,
    sku,
    quantity,
    min_stock,
    min_stock - quantity AS shortage,
    category,
    supplier_id
FROM inventory_items
WHERE quantity < min_stock
    AND status = 'active'
    AND deleted_at IS NULL
ORDER BY shortage DESC;

-- Inventory by category
SELECT 
    category,
    COUNT(*) AS item_count,
    SUM(quantity * unit_price) AS total_value,
    AVG(quantity) AS avg_quantity
FROM inventory_items
WHERE status = 'active' AND deleted_at IS NULL
GROUP BY category
ORDER BY total_value DESC;

-- Add inventory transaction
INSERT INTO inventory_transactions (id, item_id, type, quantity, reference, user_id, notes, created_at)
VALUES (
    uuid_generate_v4(),
    ?,
    'in',
    ?,
    ?,
    ?,
    ?,
    CURRENT_TIMESTAMP
)
RETURNING *;

-- Update inventory quantity after transaction
UPDATE inventory_items
SET 
    quantity = quantity + ?,
    updated_at = CURRENT_TIMESTAMP
WHERE id = ?
RETURNING *;

-- ============================================================================
-- STAFF & SCHEDULING QUERIES
-- ============================================================================

-- Get staff availability
SELECT 
    sp.id,
    u.first_name || ' ' || u.last_name AS name,
    d.name AS department,
    sp.position,
    COUNT(DISTINCT ws.id) AS active_assignments,
    sp.hourly_rate
FROM staff_profiles sp
JOIN users u ON sp.user_id = u.id
LEFT JOIN departments d ON sp.department_id = d.id
LEFT JOIN workflow_stages ws ON sp.user_id = ws.assigned_to 
    AND ws.status = 'in_progress'
    AND ws.deleted_at IS NULL
WHERE sp.deleted_at IS NULL
    AND u.deleted_at IS NULL
GROUP BY sp.id, u.first_name, u.last_name, d.name, sp.position, sp.hourly_rate
ORDER BY active_assignments DESC;

-- Get staff schedule for specific date
SELECT 
    u.first_name || ' ' || u.last_name AS name,
    ss.start_time,
    ss.end_time,
    d.name AS department,
    sp.position
FROM staff_profiles sp
JOIN users u ON sp.user_id = u.id
JOIN staff_schedules ss ON sp.id = ss.staff_id
LEFT JOIN departments d ON sp.department_id = d.id
WHERE EXTRACT(DOW FROM ?) = ss.day_of_week
    AND sp.deleted_at IS NULL
    AND u.deleted_at IS NULL
ORDER BY ss.start_time ASC;

-- ============================================================================
-- COMMUNICATIONS QUERIES
-- ============================================================================

-- Get unread messages for user
SELECT 
    m.id,
    m.sender_id,
    u.first_name || ' ' || u.last_name AS sender_name,
    c.title,
    c.type,
    m.content,
    m.created_at
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
JOIN conversation_participants cp ON c.id = cp.conversation_id
JOIN users u ON m.sender_id = u.id
WHERE cp.user_id = ?
    AND m.read_at IS NULL
    AND m.deleted_at IS NULL
ORDER BY m.created_at DESC;

-- Get notifications for user
SELECT 
    id,
    type,
    title,
    message,
    data,
    created_at
FROM notifications
WHERE user_id = ?
    AND read = FALSE
    AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 50;

-- Mark messages as read
UPDATE messages
SET read_at = CURRENT_TIMESTAMP
WHERE conversation_id = ?
    AND read_at IS NULL
    AND deleted_at IS NULL;

-- ============================================================================
-- REPORTING QUERIES
-- ============================================================================

-- Case completion rates
SELECT 
    procedure_type,
    COUNT(*) AS total_cases,
    COUNT(*) FILTER (WHERE status = 'delivered') AS completed_cases,
    ROUND(
        COUNT(*) FILTER (WHERE status = 'delivered')::NUMERIC / 
        COUNT(*)::NUMERIC * 100, 2
    ) AS completion_percentage,
    AVG(EXTRACT(DAY FROM updated_at - created_at)) AS avg_days_to_completion
FROM cases
WHERE deleted_at IS NULL
GROUP BY procedure_type
ORDER BY completion_percentage DESC;

-- Department efficiency
SELECT 
    d.name,
    COUNT(DISTINCT sp.id) AS staff_count,
    COUNT(DISTINCT ws.id) AS total_stages,
    COUNT(DISTINCT ws.id) FILTER (WHERE ws.status = 'completed') AS completed_stages,
    ROUND(
        COUNT(DISTINCT ws.id) FILTER (WHERE ws.status = 'completed')::NUMERIC /
        NULLIF(COUNT(DISTINCT ws.id), 0)::NUMERIC * 100, 2
    ) AS completion_rate
FROM departments d
LEFT JOIN staff_profiles sp ON d.id = sp.department_id 
    AND sp.deleted_at IS NULL
LEFT JOIN workflow_stages ws ON sp.user_id = ws.assigned_to 
    AND ws.deleted_at IS NULL
WHERE d.deleted_at IS NULL
GROUP BY d.id, d.name
ORDER BY completion_rate DESC NULLS LAST;

-- Staff performance
SELECT 
    u.first_name || ' ' || u.last_name AS staff_name,
    d.name AS department,
    COUNT(DISTINCT ws.id) AS stages_assigned,
    COUNT(DISTINCT ws.id) FILTER (WHERE ws.status = 'completed') AS stages_completed,
    ROUND(
        COUNT(DISTINCT ws.id) FILTER (WHERE ws.status = 'completed')::NUMERIC /
        NULLIF(COUNT(DISTINCT ws.id), 0)::NUMERIC * 100, 2
    ) AS completion_rate,
    AVG(pr.rating)::NUMERIC(3,2) AS avg_review_rating
FROM staff_profiles sp
JOIN users u ON sp.user_id = u.id
LEFT JOIN departments d ON sp.department_id = d.id
LEFT JOIN workflow_stages ws ON sp.user_id = ws.assigned_to 
    AND ws.deleted_at IS NULL
LEFT JOIN performance_reviews pr ON sp.id = pr.staff_id 
    AND pr.deleted_at IS NULL
WHERE sp.deleted_at IS NULL
    AND u.deleted_at IS NULL
GROUP BY sp.id, u.first_name, u.last_name, d.name
ORDER BY completion_rate DESC NULLS LAST;

-- Inventory turnover
SELECT 
    ii.name,
    ii.sku,
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
LEFT JOIN inventory_transactions it ON ii.id = it.item_id 
    AND it.deleted_at IS NULL
WHERE ii.deleted_at IS NULL
GROUP BY ii.id, ii.name, ii.sku, ii.category, ii.quantity, ii.min_stock, ii.max_stock
ORDER BY transaction_count DESC;

-- ============================================================================
-- ACCESS CONTROL QUERIES
-- ============================================================================

-- Get user permissions
SELECT 
    p.name,
    p.description,
    p.module
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON rp.role_id = r.id
JOIN users u ON u.role::TEXT = r.name
WHERE u.id = ?
    AND p.deleted_at IS NULL
    AND r.deleted_at IS NULL
ORDER BY p.module, p.name;

-- Get role with all permissions
SELECT 
    r.id,
    r.name,
    r.description,
    ARRAY_AGG(p.name) AS permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id 
    AND p.deleted_at IS NULL
WHERE r.id = ?
    AND r.deleted_at IS NULL
GROUP BY r.id, r.name, r.description;

-- ============================================================================
-- AUDIT & LOGGING QUERIES
-- ============================================================================

-- Get recent changes for entity
SELECT 
    al.id,
    u.first_name || ' ' || u.last_name AS changed_by,
    al.action,
    al.old_values,
    al.new_values,
    al.created_at
FROM audit_log al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.entity_type = ?
    AND al.entity_id = ?
ORDER BY al.created_at DESC;

-- Get user activity
SELECT 
    al.action,
    al.entity_type,
    COUNT(*) AS count,
    MAX(al.created_at) AS last_activity
FROM audit_log al
WHERE al.user_id = ?
GROUP BY al.action, al.entity_type
ORDER BY last_activity DESC;

-- ============================================================================
-- UTILITIES
-- ============================================================================

-- Create audit log entry (to be called from application)
INSERT INTO audit_log (
    id, user_id, action, entity_type, entity_id, 
    old_values, new_values, ip_address, user_agent, created_at
) VALUES (
    uuid_generate_v4(),
    ?,
    ?,
    ?,
    ?,
    ?::JSONB,
    ?::JSONB,
    ?,
    ?,
    CURRENT_TIMESTAMP
)
RETURNING *;

-- Soft delete record
UPDATE cases
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = ? AND deleted_at IS NULL
RETURNING *;

-- Restore deleted record
UPDATE cases
SET deleted_at = NULL
WHERE id = ?
RETURNING *;

-- Get deleted records
SELECT * FROM cases
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

