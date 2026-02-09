# API Reference - Dental Lab Management System

## Base URL

```
http://localhost:3000
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

### Success Response

```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

## HTTP Status Codes

- `200` - OK (successful GET, PUT, DELETE)
- `201` - Created (successful POST)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (auth required or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Endpoints

### Authentication Module

#### Register User

```http
POST /api/auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600,
    "user": {
      "id": "clxxx123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["USER"]
    }
  }
}
```

#### Login

```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:** Same as register

#### Get Current User

```http
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["USER"]
  }
}
```

#### Logout

```http
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <access-token>
```

#### Refresh Token

```http
POST /api/auth/refresh-token
```

**Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

#### Update Password

```http
POST /api/auth/update-password
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Body:**
```json
{
  "oldPassword": "CurrentPassword123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

#### Reset Password

```http
POST /api/auth/reset-password
```

**Body:**
```json
{
  "email": "user@example.com",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

---

### Cases Module

#### Create Case

```http
POST /api/cases
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Body:**
```json
{
  "dentistId": "dentist-id",
  "patientName": "Jane Smith",
  "patientEmail": "jane@example.com",
  "patientPhone": "+1234567890",
  "patientDOB": "1990-01-15T00:00:00Z",
  "description": "Crown restoration",
  "specifications": "All ceramic crown, shade A1",
  "priority": "HIGH",
  "dueDate": "2024-02-01T00:00:00Z",
  "departmentId": "dept-id"
}
```

#### List Cases

```http
GET /api/cases?page=1&limit=20&status=IN_PROGRESS&priority=HIGH
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `status` - Filter by status (RECEIVED, IN_PROGRESS, COMPLETED, DELIVERED, CANCELLED)
- `priority` - Filter by priority (LOW, MEDIUM, HIGH, URGENT)
- `dentistId` - Filter by dentist
- `assignedToId` - Filter by assigned user
- `departmentId` - Filter by department
- `search` - Search in patient name, case number, description
- `startDate` - Filter cases created after this date
- `endDate` - Filter cases created before this date

#### Get Case

```http
GET /api/cases/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "case-123",
    "caseNumber": "CASE-2024-ABC123",
    "dentistId": "dentist-id",
    "patientName": "Jane Smith",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2024-02-01T00:00:00Z",
    "completedDate": null,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-16T10:00:00Z",
    "dentist": { /* dentist details */ },
    "files": [ /* case files */ ],
    "notes_rel": [ /* case notes */ ],
    "workflowStages": [ /* workflow stages */ ],
    "appointments": [ /* appointments */ ]
  }
}
```

#### Update Case

```http
PUT /api/cases/:id
```

**Body:** (All fields optional)
```json
{
  "patientName": "Jane Smith",
  "description": "Updated description",
  "status": "COMPLETED",
  "priority": "MEDIUM",
  "assignedToId": "user-id",
  "departmentId": "dept-id"
}
```

#### Delete Case

```http
DELETE /api/cases/:id
```

#### Search Cases

```http
GET /api/cases/search?q=crown&page=1&limit=20
```

#### Upload Case File

```http
POST /api/cases/:id/files
```

**Content-Type:**
```
multipart/form-data
```

**Form Data:**
- `file` - The file to upload (PDF, JPG, PNG, GIF, DOC, DOCX)

#### Get Case Files

```http
GET /api/cases/:id/files
```

#### Delete Case File

```http
DELETE /api/cases/:id/files/:fileId
```

#### Add Case Note

```http
POST /api/cases/:id/notes
```

**Body:**
```json
{
  "content": "Note content here",
  "isInternal": false
}
```

#### Get Case Notes

```http
GET /api/cases/:id/notes?includeInternal=false
```

#### Get Case Workflow

```http
GET /api/cases/:id/workflow
```

---

### Workflow Module

#### Create Workflow Stage

```http
POST /api/workflow/case/:caseId/stages
```

**Body:**
```json
{
  "stageName": "Design Review",
  "description": "Initial design review",
  "sequence": 1,
  "assignedTo": "user-id"
}
```

#### Get Workflow Stages

```http
GET /api/workflow/case/:caseId
```

#### Get Stage

```http
GET /api/workflow/stages/:stageId
```

#### Update Stage

```http
PUT /api/workflow/stages/:stageId
```

**Body:**
```json
{
  "stageName": "Design Review",
  "status": "IN_PROGRESS",
  "assignedTo": "user-id",
  "notes": "Progress notes"
}
```

#### Complete Stage

```http
PUT /api/workflow/stages/:stageId/complete
```

**Body:**
```json
{
  "notes": "Stage completed successfully"
}
```

#### Delete Stage

```http
DELETE /api/workflow/stages/:stageId
```

#### Get Workflow Statistics

```http
GET /api/workflow/case/:caseId/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "pending": 2,
    "inProgress": 1,
    "completed": 2,
    "blocked": 0,
    "progress": 40
  }
}
```

---

### Billing Module

#### Create Invoice

```http
POST /api/billing/invoices
```

**Body:**
```json
{
  "caseId": "case-id",
  "dentistId": "dentist-id",
  "amount": 500.00,
  "tax": 50.00,
  "dueDate": "2024-02-15T00:00:00Z",
  "items": [
    {
      "description": "Crown restoration",
      "quantity": 1,
      "unitPrice": 500.00
    }
  ],
  "description": "Invoice for case #123",
  "notes": "Payment due within 30 days"
}
```

#### List Invoices

```http
GET /api/billing/invoices?page=1&limit=20&status=ISSUED&dentistId=dentist-id
```

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `status` - DRAFT, ISSUED, SENT, PAID, OVERDUE, CANCELLED
- `dentistId` - Filter by dentist
- `caseId` - Filter by case

#### Get Invoice

```http
GET /api/billing/invoices/:id
```

#### Update Invoice

```http
PUT /api/billing/invoices/:id
```

**Body:**
```json
{
  "status": "SENT",
  "dueDate": "2024-02-20T00:00:00Z",
  "notes": "Updated payment terms"
}
```

#### Delete Invoice

```http
DELETE /api/billing/invoices/:id
```

#### Record Payment

```http
POST /api/billing/invoices/:invoiceId/payments
```

**Body:**
```json
{
  "amount": 250.00,
  "method": "BANK_TRANSFER",
  "reference": "TXN-123456",
  "notes": "Partial payment"
}
```

#### Get Payments

```http
GET /api/billing/invoices/:invoiceId/payments
```

#### Get Billing Statistics

```http
GET /api/billing/stats/billing?dentistId=dentist-id
```

---

### Inventory Module

#### Create Inventory Item

```http
POST /api/inventory/items
```

**Body:**
```json
{
  "sku": "CROWN-CERAMIC-001",
  "name": "All Ceramic Crown",
  "description": "High-quality ceramic crown",
  "category": "Materials",
  "quantity": 50,
  "minStock": 10,
  "maxStock": 100,
  "unitPrice": 75.00,
  "supplier": "Dental Supplies Co",
  "location": "Shelf A1",
  "expiryDate": "2025-12-31T00:00:00Z"
}
```

#### List Inventory Items

```http
GET /api/inventory/items?page=1&limit=20&category=Materials&search=crown
```

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `category` - Filter by category
- `search` - Search by SKU or name
- `lowStock` - true to show only low stock items

#### Get Inventory Item

```http
GET /api/inventory/items/:id
```

#### Update Inventory Item

```http
PUT /api/inventory/items/:id
```

**Body:**
```json
{
  "name": "All Ceramic Crown",
  "quantity": 45,
  "minStock": 15,
  "unitPrice": 80.00
}
```

#### Delete Inventory Item

```http
DELETE /api/inventory/items/:id
```

#### Record Transaction

```http
POST /api/inventory/items/:id/transactions
```

**Body:**
```json
{
  "type": "USAGE",
  "quantity": 5,
  "reference": "CASE-123",
  "notes": "Used for crown restoration"
}
```

**Types:** PURCHASE, USAGE, ADJUSTMENT, RETURN, DAMAGE, EXPIRY

#### Get Transactions

```http
GET /api/inventory/items/:id/transactions?page=1&limit=20
```

#### Get Low Stock Items

```http
GET /api/inventory/items/low-stock
```

#### Get Inventory Statistics

```http
GET /api/inventory/stats/inventory
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalItems": 150,
    "totalValue": 25000.00,
    "lowStockCount": 8,
    "overstockCount": 3,
    "categories": 12
  }
}
```

---

## Rate Limiting

### Limits

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes (for login/register)
- **File Uploads**: 100 uploads per hour

### Rate Limit Headers

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1234567890
```

### Exceeded Response

```json
{
  "success": false,
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests, please try again later"
}
```

---

## Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `INVALID_CREDENTIALS` - Wrong email or password
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `DUPLICATE_SKU` - SKU already exists
- `INSUFFICIENT_STOCK` - Not enough inventory
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error

---

## Query Parameters

### Pagination

All list endpoints support:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

### Filtering

Endpoints support filters specific to each resource. Check individual endpoint docs.

### Sorting

Most endpoints sort by `createdAt` descending by default.

---

## Example Workflows

### Complete Case Workflow

1. **Create Case**
   ```
   POST /api/cases
   ```

2. **Upload Files**
   ```
   POST /api/cases/:id/files
   ```

3. **Add Notes**
   ```
   POST /api/cases/:id/notes
   ```

4. **Create Workflow Stages**
   ```
   POST /api/workflow/case/:caseId/stages
   ```

5. **Update Stage Status**
   ```
   PUT /api/workflow/stages/:stageId
   ```

6. **Complete Stage**
   ```
   PUT /api/workflow/stages/:stageId/complete
   ```

7. **Create Invoice**
   ```
   POST /api/billing/invoices
   ```

8. **Record Payment**
   ```
   POST /api/billing/invoices/:invoiceId/payments
   ```

9. **Update Case Status to COMPLETED**
   ```
   PUT /api/cases/:id
   ```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All amounts are in decimal format (e.g., 100.50)
- Required fields must be provided in requests
- Optional fields can be omitted
- Empty responses return null instead of empty arrays
- Deleted resources return 204 No Content (no response body)

---

## Support

For more information, refer to:
- README.md - Full API documentation
- QUICKSTART.md - Quick reference
- SETUP.md - Setup instructions
