# Email Service - Quick Start Guide

## Installation (2 minutes)

### Step 1: Install Package
```bash
npm install resend
```

### Step 2: Add Environment Variables
Create/update `.env`:
```env
RESEND_API_KEY="re_xxx_your_api_key_from_resend.com"
FROM_EMAIL="noreply@dentalkart.com"
FRONTEND_URL="http://localhost:3001"
```

### Step 3: Database Migration
```bash
npm run prisma:migrate
```

### Step 4: Build
```bash
npm run build
```

## Testing (No API Key Needed)

### Test Without Resend API Key
1. Remove `RESEND_API_KEY` from `.env`
2. Emails will be logged to console
3. Perfect for development/testing

**Example Console Output**:
```
[EMAIL] Simulated email sent: {
  to: 'user@example.com',
  subject: 'Welcome to DentNode!',
  timestamp: '2024-02-10T10:30:00.000Z'
}
```

### Test With Real Emails
1. Sign up at https://resend.com (free)
2. Get your API key
3. Add `RESEND_API_KEY` to `.env`
4. Emails now sent for real
5. Check Resend dashboard for delivery status

## Available API Endpoints

### Password Reset Flow

**1. Request Reset** (Public)
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@dentalkart.com"}'
```

**2. Reset Password** (Public)
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"token_from_email",
    "newPassword":"NewPassword123!",
    "confirmPassword":"NewPassword123!"
  }'
```

### User Registration (With Welcome Email)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@dentalkart.com",
    "password":"SecurePassword123!",
    "firstName":"John",
    "lastName":"Doe",
    "phone":"+1234567890"
  }'
```

## Send Emails from Code

### Example 1: Send Welcome Email
```typescript
import { emailService } from './services/email.service';

await emailService.sendWelcomeEmail(
  'user@dentalkart.com',
  'John Doe',
  'TempPassword123!' // optional
);
```

### Example 2: Send Case Status Update
```typescript
await emailService.sendCaseStatusUpdate(
  'dentist@clinic.com',
  'Dr. Smith',
  'CASE-2024-001',
  'In Progress',
  'John Patient'
);
```

### Example 3: Send Invoice Email
```typescript
await emailService.sendInvoiceEmail(
  'dentist@clinic.com',
  'Dr. Smith',
  'INV-2024-042',
  1500.00,
  '2024-02-28'
);
```

### Example 4: Send Low Stock Alert
```typescript
await emailService.sendLowStockAlert(
  'lab-manager@dentalkart.com',
  'Crown Material - Zirconia',
  5,      // current quantity
  20      // minimum quantity
);
```

### Example 5: Send Shipment Update
```typescript
await emailService.sendShipmentUpdate(
  'dentist@clinic.com',
  'Dr. Smith',
  'TRACK-123456789',
  'In Transit',
  '2024-02-12' // optional
);
```

## Email Templates Included

| Template | Method | Use Case |
|----------|--------|----------|
| Password Reset | `sendPasswordResetEmail()` | User resets forgotten password |
| Welcome | `sendWelcomeEmail()` | New user registration |
| Case Status | `sendCaseStatusUpdate()` | Case status changes |
| Case Submission | `sendCaseSubmissionConfirmation()` | Dentist submits case |
| Invoice | `sendInvoiceEmail()` | Invoice generated |
| Low Stock | `sendLowStockAlert()` | Inventory below minimum |
| Shipment | `sendShipmentUpdate()` | Shipment status changes |

## Features

✅ **Professional HTML Templates**
- DentalKart branding and colors
- Fully responsive (mobile-friendly)
- Clear call-to-action buttons
- Professional footer with company info

✅ **Graceful Degradation**
- Works with or without API key
- No crashes on email failures
- Logs all operations for debugging
- Non-blocking email operations

✅ **Secure Password Reset**
- Cryptographically secure tokens
- 1-hour token expiration
- Hashed token storage
- Double password confirmation

✅ **Rate Limiting**
- Password reset endpoints protected
- 100 requests per 15 minutes per IP
- Prevents abuse and brute force

✅ **Comprehensive Logging**
- All email sends logged with timestamp
- Error logging for debugging
- Console output shows what's happening
- Production-ready error handling

## Troubleshooting

### Emails not sending?
```bash
# Check if API key is set
echo $RESEND_API_KEY

# Check logs in console
npm run dev 2>&1 | grep "\[EMAIL\]"

# Verify email configuration
cat .env | grep RESEND
```

### Reset link not working?
- Check `FRONTEND_URL` matches your frontend
- Token expires after 1 hour
- Make sure token is in reset-password endpoint

### Welcome emails not received?
- Check spam folder
- Verify `FROM_EMAIL` is correct
- Check Resend dashboard for bounces

## File Locations

| File | Purpose |
|------|---------|
| `src/services/email.service.ts` | Core email service |
| `src/utils/emailTemplates.ts` | HTML email templates |
| `src/services/auth.service.ts` | Password reset logic |
| `src/controllers/auth.controller.ts` | API endpoints |
| `src/routes/auth.routes.ts` | Route definitions |
| `EMAIL_SERVICE_GUIDE.md` | Comprehensive guide |
| `EMAIL_IMPLEMENTATION_SUMMARY.md` | Implementation details |

## Key Code Files

### Service Layer
```
src/services/
├── email.service.ts (Core)
├── auth.service.ts (Password reset)
└── users.service.ts (Welcome emails)
```

### API Layer
```
src/controllers/auth.controller.ts
src/routes/auth.routes.ts
```

### Data Layer
```
prisma/schema.prisma (User model with reset fields)
src/config/env.ts (Environment variables)
```

### Presentation Layer
```
src/utils/emailTemplates.ts (7 professional templates)
```

## Environment Variables Reference

```env
# Required for email sending
RESEND_API_KEY="re_xxx..."           # From https://resend.com
FROM_EMAIL="noreply@dentalkart.com" # Sender email
FRONTEND_URL="http://localhost:3001" # For password reset links

# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
```

## Free Tier Limits

- **100 emails/day** (free tier)
- Perfect for small deployments
- Upgrade anytime if needed
- No credit card required

## Next Steps

1. **Sign Up for Resend**
   - Go to https://resend.com
   - Create free account
   - Get API key

2. **Configure Environment**
   - Add `RESEND_API_KEY` to `.env`
   - Add `FROM_EMAIL` and `FRONTEND_URL`

3. **Test Functionality**
   - Without key: Test simulation mode
   - With key: Test real email delivery

4. **Integrate Into Features**
   - Case management system
   - Billing/invoicing
   - Inventory management
   - Logistics/shipments

## Support Resources

- **Resend Docs**: https://resend.com/docs
- **This Project**: See `EMAIL_SERVICE_GUIDE.md`
- **Email Templates**: `src/utils/emailTemplates.ts`
- **Implementation**: `EMAIL_IMPLEMENTATION_SUMMARY.md`

---

**Ready to send emails!** 🚀
