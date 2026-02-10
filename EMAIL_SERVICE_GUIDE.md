# Email Notification Service - DentalKart LMS

## Overview

A production-ready email notification system for DentalKart LMS backend using **Resend**, a modern email API with a generous free tier (100 emails/day). The service is graceful - it works without email configuration but sends emails when the API key is set.

## Architecture

### Key Components

1. **Email Service** (`src/services/email.service.ts`)
   - Core service handling all email operations
   - Graceful fallback to simulation mode if Resend API key not configured
   - Comprehensive logging for debugging

2. **Email Templates** (`src/utils/emailTemplates.ts`)
   - Professional, responsive HTML templates
   - DentalKart branding with gradient colors (#667eea, #764ba2)
   - Mobile-friendly design
   - Clear call-to-action buttons

3. **Authentication Service** (`src/services/auth.service.ts`)
   - Password reset flow with secure token generation
   - Welcome emails on user registration
   - Token expiration handling (1 hour)

4. **Users Service** (`src/services/users.service.ts`)
   - Welcome emails for newly created users
   - Temporary password handling

## Setup Instructions

### 1. Install Resend Package

```bash
cd /sessions/magical-relaxed-galileo/lms1-backend
npm install resend
```

### 2. Configure Environment Variables

Add to `.env`:

```env
# Resend Email Configuration
RESEND_API_KEY="re_xxx_your_resend_api_key"
FROM_EMAIL="noreply@dentalkart.com"
FRONTEND_URL="http://localhost:3001"  # For password reset links
```

**Getting a Resend API Key:**
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Copy your API key
5. Add to `.env` file

### 3. Database Migration

The schema includes two new fields on the User model for password reset functionality:

```prisma
resetPasswordToken    String?   @unique
resetPasswordExpires  DateTime?
```

Run migrations:

```bash
npm run prisma:migrate
```

### 4. Build and Test

```bash
npm run build
```

## Email Templates

### 1. Password Reset Email
- **Method**: `sendPasswordResetEmail(to, resetToken, userName)`
- **Trigger**: User requests password reset via forgot-password endpoint
- **Features**:
  - Reset link valid for 1 hour
  - Backup text link for email clients that don't support anchor tags
  - Professional styling with DentalKart branding

### 2. Welcome Email
- **Method**: `sendWelcomeEmail(to, userName, tempPassword?)`
- **Trigger**: User registration or admin creates new user
- **Features**:
  - Features overview of DentalKart platform
  - Optional temporary password display
  - Login instructions
  - Call-to-action button

### 3. Case Status Update Email
- **Method**: `sendCaseStatusUpdate(to, dentistName, caseNumber, newStatus, patientName)`
- **Trigger**: Case status changes in the system
- **Features**:
  - Case details summary
  - Status badge
  - Direct link to view case

### 4. Case Submission Confirmation
- **Method**: `sendCaseSubmissionConfirmation(to, dentistName, caseNumber, patientName)`
- **Trigger**: Dentist submits a case
- **Features**:
  - Success confirmation
  - Case reference numbers
  - Next steps information

### 5. Invoice Notification
- **Method**: `sendInvoiceEmail(to, dentistName, invoiceNumber, amount, dueDate)`
- **Trigger**: Invoice is generated or sent to dentist
- **Features**:
  - Invoice amount and due date
  - Professional invoice styling
  - Direct link to view full invoice

### 6. Low Stock Alert
- **Method**: `sendLowStockAlert(to, itemName, currentQuantity, minQuantity)`
- **Trigger**: Inventory drops below minimum threshold
- **Features**:
  - Warning style with yellow accent
  - Current vs. minimum stock levels
  - Link to inventory management

### 7. Shipment Update Email
- **Method**: `sendShipmentUpdate(to, recipientName, trackingNumber, status, estimatedDelivery?)`
- **Trigger**: Shipment status changes
- **Features**:
  - Tracking number and status
  - Estimated delivery date
  - Real-time tracking link

## API Endpoints

### Password Reset Flow

#### 1. Request Password Reset
**Endpoint**: `POST /api/auth/forgot-password`

**Request**:
```json
{
  "email": "user@dentalkart.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset link has been sent.",
  "data": null
}
```

**Note**: Returns same message whether email exists or not (security best practice)

#### 2. Reset Password with Token
**Endpoint**: `POST /api/auth/reset-password`

**Request**:
```json
{
  "token": "reset_token_from_email_link",
  "newPassword": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": null
}
```

### User Registration (with Welcome Email)
**Endpoint**: `POST /api/auth/register`

**Request**:
```json
{
  "email": "newuser@dentalkart.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response** (includes authentication tokens):
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "user": {
      "id": "user_id",
      "email": "newuser@dentalkart.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["USER"]
    }
  }
}
```

**Action**: Welcome email automatically sent to provided email address

## Usage Examples

### Send Case Status Update

```typescript
import { emailService } from '../services/email.service';

// When case status changes
await emailService.sendCaseStatusUpdate(
  'dentist@clinic.com',
  'Dr. Smith',
  'CASE-2024-001',
  'In Progress',
  'John Patient'
);
```

### Send Invoice Notification

```typescript
await emailService.sendInvoiceEmail(
  'dentist@clinic.com',
  'Dr. Smith',
  'INV-2024-042',
  1500.00,
  '2024-02-28'
);
```

### Send Shipment Update

```typescript
await emailService.sendShipmentUpdate(
  'dentist@clinic.com',
  'Dr. Smith',
  'TRACK-123456789',
  'In Transit',
  '2024-02-12'
);
```

### Send Low Stock Alert

```typescript
await emailService.sendLowStockAlert(
  'lab-manager@dentalkart.com',
  'Crown Material - Zirconia',
  5,
  20
);
```

## Error Handling

The email service is graceful:

1. **Without RESEND_API_KEY**:
   - Logs warning: `[EMAIL] Resend API key not configured. Email simulation mode.`
   - Emails are simulated and logged to console
   - Application continues normally
   - No failure or crashes

2. **With Invalid RESEND_API_KEY**:
   - Resend API returns error
   - Error is logged to console
   - Exception is thrown (caught in controller/service)
   - Appropriate HTTP error response returned

3. **Email Send Failures**:
   - Auth service: Welcome/password reset emails are non-blocking
   - User creation proceeds even if email fails
   - Error logged for debugging
   - Admin can manually retry email sending

## Rate Limiting

Password reset endpoints have rate limiting applied:

- **Rate Limit**: 100 requests per 15 minutes
- **Applied to**: `/api/auth/forgot-password`, `/api/auth/reset-password`
- **Purpose**: Prevent abuse and brute force attacks

## Security Features

1. **Secure Token Generation**
   - Uses `crypto.randomBytes(32)` for reset tokens
   - Tokens are hashed with SHA-256 before storage
   - Only hash is stored in database (raw token in email)

2. **Token Expiration**
   - Reset tokens expire after 1 hour
   - Expired tokens are validated before use
   - Auto-cleanup on successful reset

3. **Email Security**
   - Never expose whether email exists
   - Same response for existing/non-existing emails in forgot-password
   - Tokens in URLs are single-use

4. **Data Protection**
   - Password resets require secure password
   - Minimum 8 characters enforced
   - Password confirmation required

## Free Tier Limits

Resend free tier includes:
- **100 emails/day**
- **Unlimited domains** (single domain in free tier: resend.dev)
- **Full API access**
- **No credit card required**
- **No expiration**

Upgrade options available for higher volume needs.

## Monitoring & Logs

All email operations are logged with consistent format:

```
[EMAIL] Email sent successfully: { to: 'user@email.com', subject: 'Subject' }
[EMAIL] Resend API key not configured. Email simulation mode.
[AUTH] Password reset email sent to user@email.com
[USERS] Welcome email sent to newuser@email.com
[EMAIL] Failed to send email: Error details...
```

## Testing Email Functionality

### Test Mode (Without API Key)

1. Remove or comment out `RESEND_API_KEY` in `.env`
2. Emails will be logged to console instead of sent
3. Useful for development and testing

Example log output:
```
[EMAIL] Simulated email sent: {
  to: 'user@example.com',
  subject: 'Welcome to DentNode!',
  timestamp: '2024-02-10T10:30:00.000Z'
}
```

### Production Mode (With API Key)

1. Add valid `RESEND_API_KEY` to `.env`
2. Emails are sent immediately
3. Check Resend dashboard for delivery status

## Troubleshooting

### Emails not sending
1. Check `RESEND_API_KEY` is valid and set
2. Review email logs in console
3. Verify `FROM_EMAIL` and `FRONTEND_URL` are set
4. Check Resend dashboard for API errors

### Password reset link not working
1. Verify `FRONTEND_URL` matches frontend deployment
2. Check token hasn't expired (1 hour limit)
3. Ensure token is correctly passed in URL parameter

### Welcome emails not received
1. Check spam folder
2. Verify `FROM_EMAIL` is correct
3. Review Resend bounce logs
4. Ensure email service didn't throw (non-blocking)

## Future Enhancements

- SMS notifications (Twilio integration)
- Email templates in database
- Scheduled email batch processing
- Email delivery tracking
- Unsubscribe management
- Email preview/testing UI
- Multi-language email templates
- Custom branding per organization
- Email analytics dashboard

## References

- **Resend Documentation**: https://resend.com/docs
- **Email Best Practices**: https://resend.com/guides
- **Node.js Crypto**: https://nodejs.org/api/crypto.html
- **Prisma Migrations**: https://www.prisma.io/docs/guides/migrate
