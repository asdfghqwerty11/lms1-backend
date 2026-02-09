# Quick Start Guide

## 1. Initial Setup

### Clone and Install

```bash
cd lms1-backend
npm install
```

### Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dental_lab_db"
JWT_SECRET="your-secret-key-min-16-characters"
PORT=3000
NODE_ENV="development"
```

### Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate

# Seed with initial data (optional)
npm run prisma:seed
```

### Start Development Server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

## 2. Testing the API

### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600,
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["USER"]
    }
  }
}
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Current User (Authenticated)

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <your-access-token>"
```

## 3. Create Your First Case

```bash
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>" \
  -d '{
    "dentistId": "dentist-id",
    "patientName": "Jane Smith",
    "patientEmail": "jane@example.com",
    "patientPhone": "+1234567890",
    "description": "Crown restoration for tooth #11",
    "specifications": "All ceramic crown, shade A1",
    "priority": "HIGH",
    "dueDate": "2024-02-01T00:00:00Z"
  }'
```

## 4. List Cases

```bash
curl http://localhost:3000/api/cases \
  -H "Authorization: Bearer <your-access-token>"
```

### With Filters and Pagination

```bash
curl "http://localhost:3000/api/cases?status=IN_PROGRESS&priority=HIGH&page=1&limit=20" \
  -H "Authorization: Bearer <your-access-token>"
```

## 5. Create an Invoice

```bash
curl -X POST http://localhost:3000/api/billing/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>" \
  -d '{
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
    ]
  }'
```

## 6. Create Inventory Item

```bash
curl -X POST http://localhost:3000/api/inventory/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>" \
  -d '{
    "sku": "CROWN-CERAMIC-001",
    "name": "All Ceramic Crown",
    "category": "Materials",
    "quantity": 50,
    "minStock": 10,
    "maxStock": 100,
    "unitPrice": 75.00,
    "supplier": "Dental Supplies Co",
    "location": "Shelf A1"
  }'
```

## 7. File Uploads

### Upload Case File

```bash
curl -X POST http://localhost:3000/api/cases/:caseId/files \
  -H "Authorization: Bearer <your-access-token>" \
  -F "file=@/path/to/file.pdf"
```

Files are stored in the `uploads/` directory.

## 8. Development Tools

### Open Prisma Studio

```bash
npm run prisma:studio
```

This opens an interactive database browser at `http://localhost:5555`

### Run Linting

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

## 9. Build for Production

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Start Production Server

```bash
npm start
```

## 10. Common Issues

### Port Already in Use

Change the PORT in `.env`:
```env
PORT=3001
```

### Database Connection Error

1. Check DATABASE_URL in `.env`
2. Verify PostgreSQL is running
3. Check database credentials
4. Create database if it doesn't exist:
   ```bash
   createdb dental_lab_db
   ```

### Prisma Client Not Found

```bash
npm run prisma:generate
```

### Migration Issues

Reset database (deletes all data):
```bash
npm run prisma:migrate reset
```

## 11. Project Structure Guide

```
src/
├── config/          # Configuration (database, env)
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/          # API endpoints
├── services/        # Business logic
├── types/          # TypeScript types
├── utils/          # Helper functions
└── index.ts        # App entry point
```

## 12. Next Steps

1. Read the full README.md for detailed documentation
2. Check the Prisma schema in `prisma/schema.prisma`
3. Review existing controllers for patterns
4. Implement remaining modules (staff, departments, etc.)
5. Add unit and integration tests
6. Set up CI/CD pipeline

## 13. API Documentation

Once running, the API follows RESTful conventions:

- `GET /api/resource` - List items
- `POST /api/resource` - Create item
- `GET /api/resource/:id` - Get specific item
- `PUT /api/resource/:id` - Update item
- `DELETE /api/resource/:id` - Delete item

All responses follow a standard format:
```json
{
  "success": true|false,
  "message": "Optional message",
  "data": {},
  "code": "ERROR_CODE (on error)"
}
```

## 14. Adding New Features

### Add a New Route

1. Create controller in `src/controllers/`
2. Create service in `src/services/`
3. Create route file in `src/routes/`
4. Import in `src/routes/index.ts`

Example:
```typescript
// src/controllers/example.controller.ts
export class ExampleController {
  getAll = asyncHandler(async (req, res) => {
    const data = await exampleService.getAll();
    res.json({ success: true, data });
  });
}

// src/routes/example.routes.ts
router.get('/', exampleController.getAll);
```

## 15. Deployment Checklist

- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Build the project
- [ ] Test all endpoints
- [ ] Set up logging
- [ ] Configure CORS_ORIGIN for production domain
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure backup strategy
- [ ] Set up monitoring

## Support

For more information, see:
- README.md - Comprehensive documentation
- prisma/schema.prisma - Database schema
- .env.example - Configuration template
