# Dental Lab Management System - Backend API

A production-ready Express.js + TypeScript backend API for managing a comprehensive dental laboratory system with case management, workflow automation, billing, inventory, staff management, and more.

## Features

### Core Modules

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Case Management**: Complete case lifecycle management with file uploads and notes
- **Workflow Management**: Multi-stage workflow automation with status tracking
- **Billing System**: Invoice generation, payment tracking, and financial reporting
- **Inventory Management**: Stock tracking with low-stock alerts and transaction history
- **Staff Management**: Employee profiles, scheduling, and performance reviews
- **Department Management**: Department organization and equipment tracking
- **Communications**: Internal messaging, conversations, and notifications
- **Dentist Management**: Dentist profiles, verification, and applications
- **Calendar & Appointments**: Appointment scheduling and management
- **Reporting**: Business intelligence and analytics
- **Logistics**: Shipment tracking and delivery management
- **Settings**: System configuration and audit logging

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL (with Prisma ORM)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **API Documentation**: Swagger/OpenAPI ready

## Project Structure

```
lms1-backend/
├── src/
│   ├── config/
│   │   ├── database.ts       # Prisma configuration
│   │   └── env.ts           # Environment variables validation
│   ├── middleware/
│   │   ├── auth.ts          # JWT authentication
│   │   ├── validate.ts      # Zod validation middleware
│   │   ├── errorHandler.ts  # Global error handling
│   │   └── rateLimiter.ts   # Rate limiting
│   ├── routes/
│   │   ├── index.ts         # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── cases.routes.ts
│   │   ├── workflow.routes.ts
│   │   ├── billing.routes.ts
│   │   ├── inventory.routes.ts
│   │   └── [other modules]
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── cases.controller.ts
│   │   ├── workflow.controller.ts
│   │   ├── billing.controller.ts
│   │   └── inventory.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── cases.service.ts
│   │   └── email.service.ts
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── utils/
│   │   └── helpers.ts       # Utility functions
│   └── index.ts             # Express app setup
├── prisma/
│   └── schema.prisma        # Database schema
├── package.json
├── tsconfig.json
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 13+ (or Supabase PostgreSQL)
- Git

### Installation

1. Clone the repository and navigate to the project:

```bash
cd lms1-backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Then edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dental_lab_db"
JWT_SECRET="your-super-secret-key-change-in-production"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3001"
```

4. Set up the database:

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed the database
npm run prisma:seed
```

5. Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Available Scripts

```bash
npm run dev                    # Start development server with hot reload
npm run build                  # Build TypeScript to JavaScript
npm start                      # Start production server
npm run prisma:generate        # Generate Prisma client
npm run prisma:migrate         # Run database migrations
npm run prisma:migrate:prod    # Run migrations in production
npm run prisma:seed            # Seed database with initial data
npm run prisma:studio          # Open Prisma Studio
npm run lint                   # Run ESLint
npm run format                 # Format code with Prettier
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/update-password` - Update password
- `POST /api/auth/reset-password` - Reset password

### Cases

- `GET /api/cases` - List cases (with pagination & filtering)
- `POST /api/cases` - Create new case
- `GET /api/cases/:id` - Get case details
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case
- `GET /api/cases/search` - Search cases
- `POST /api/cases/:id/files` - Upload case file
- `GET /api/cases/:id/files` - List case files
- `DELETE /api/cases/:id/files/:fileId` - Delete case file
- `POST /api/cases/:id/notes` - Add case note
- `GET /api/cases/:id/notes` - Get case notes
- `GET /api/cases/:id/workflow` - Get case workflow

### Workflow

- `GET /api/workflow/case/:caseId` - Get workflow stages
- `POST /api/workflow/case/:caseId/stages` - Create stage
- `PUT /api/workflow/stages/:stageId` - Update stage
- `PUT /api/workflow/stages/:stageId/complete` - Complete stage
- `DELETE /api/workflow/stages/:stageId` - Delete stage
- `GET /api/workflow/case/:caseId/stats` - Get workflow statistics

### Billing

- `GET /api/billing/invoices` - List invoices
- `POST /api/billing/invoices` - Create invoice
- `GET /api/billing/invoices/:id` - Get invoice details
- `PUT /api/billing/invoices/:id` - Update invoice
- `DELETE /api/billing/invoices/:id` - Delete invoice
- `POST /api/billing/invoices/:invoiceId/payments` - Record payment
- `GET /api/billing/invoices/:invoiceId/payments` - Get payments
- `GET /api/billing/stats/billing` - Get billing statistics

### Inventory

- `GET /api/inventory/items` - List inventory items
- `POST /api/inventory/items` - Create inventory item
- `GET /api/inventory/items/:id` - Get item details
- `PUT /api/inventory/items/:id` - Update item
- `DELETE /api/inventory/items/:id` - Delete item
- `POST /api/inventory/items/:id/transactions` - Record transaction
- `GET /api/inventory/items/:id/transactions` - Get transactions
- `GET /api/inventory/items/low-stock` - Get low stock items
- `GET /api/inventory/stats/inventory` - Get inventory statistics

## Error Handling

All errors are returned in a consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- File uploads: 100 uploads per hour

## Database Schema

The complete database schema is defined in `prisma/schema.prisma` and includes models for:

- User management and authentication
- Case and case file management
- Workflow and process automation
- Invoices and payments
- Inventory and transactions
- Staff profiles and scheduling
- Departments and equipment
- Communications and notifications
- Dentist management
- Appointments and scheduling
- Shipments and delivery
- Settings and audit logs

## Development

### Adding a New Route

1. Create a controller in `src/controllers/`
2. Create a service in `src/services/` (optional)
3. Create routes in `src/routes/`
4. Import and add to `src/routes/index.ts`

### Adding a New Database Model

1. Add the model to `prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Update TypeScript types if needed

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Configuration

Make sure to set proper environment variables in production:

```env
NODE_ENV=production
DATABASE_URL="production-database-url"
JWT_SECRET="production-jwt-secret"
CORS_ORIGIN="https://yourdomain.com"
```

### Database Migrations

Before deploying, run migrations:

```bash
npm run prisma:migrate:prod
```

## Security Considerations

- All passwords are hashed using bcryptjs
- JWT tokens have expiration times
- Rate limiting prevents brute force attacks
- CORS is configured to allow only trusted origins
- Helmet protects against common vulnerabilities
- Input validation using Zod
- SQL injection prevention through Prisma ORM
- File upload restrictions

## Testing

```bash
npm test
```

(Testing infrastructure to be implemented)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and formatting
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
