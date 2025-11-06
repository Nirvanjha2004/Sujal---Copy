# Design Document

## Overview

This design implements email-based OTP delivery by extending the existing email service with OTP-specific templates and integrating email sending into the authentication and user service flows. The solution leverages the existing email infrastructure and Redis-based OTP storage while replacing console logging with secure email delivery.

## Architecture

### Current System Components
- **AuthService**: Handles OTP generation and Redis storage
- **UserService**: Manages email verification and password reset flows  
- **EmailService**: Provides email sending capabilities with templates (using Nodemailer)
- **Redis**: Stores OTPs with expiration

### Email Service Configuration
- **Library**: Nodemailer (free, open-source)
- **Current SMTP**: Gmail SMTP (free, 500 emails/day limit)
- **Alternative Options**: Any SMTP service (SendGrid, Mailgun, Amazon SES)
- **Cost**: Free for development, scalable paid options available

### Integration Points
- AuthService.register() - Send registration OTP email
- UserService.resendVerificationOTP() - Send resend OTP email
- UserService.initiatePasswordReset() - Send password reset OTP email

## Components and Interfaces

### EmailService Extensions

#### New Email Template Methods
```typescript
// Add to EmailService class
async sendVerificationOTP(email: string, data: VerificationOTPData): Promise<void>
async sendPasswordResetOTP(email: string, data: PasswordResetOTPData): Promise<void>

interface VerificationOTPData {
  userName: string;
  otp: string;
  expirationMinutes: number;
}

interface PasswordResetOTPData {
  userName: string;
  otp: string;
  expirationMinutes: number;
}
```

#### Email Templates
- **Verification OTP Template**: Professional template with OTP code, instructions, and security warnings
- **Password Reset OTP Template**: Clear template explaining password reset process with OTP
- **Plain Text Versions**: Fallback text versions for both templates

### Service Integration

#### AuthService Changes
- Remove console.log statements for OTP logging
- Add email sending after OTP storage
- Implement proper error handling for email failures

#### UserService Changes  
- Replace console.log with email sending in resendVerificationOTP()
- Replace console.log with email sending in initiatePasswordReset()
- Add error handling for email delivery failures

## Data Models

### Email Template Data Structures

#### Verification OTP Email Data
```typescript
interface VerificationOTPData {
  userName: string;        // User's full name for personalization
  otp: string;            // 6-digit OTP code
  expirationMinutes: number; // Always 10 minutes
}
```

#### Password Reset OTP Email Data
```typescript
interface PasswordResetOTPData {
  userName: string;        // User's full name for personalization  
  otp: string;            // 6-digit OTP code
  expirationMinutes: number; // Always 10 minutes
}
```

### Email Template Structure

#### HTML Template Features
- Professional header with branding
- Prominent OTP display in large, readable font
- Clear step-by-step instructions
- Security warnings and best practices
- Expiration time clearly stated
- Responsive design for mobile devices

#### Plain Text Template Features
- Clean, readable format
- All essential information included
- Proper spacing and structure
- Security warnings included

## Error Handling

### Email Delivery Failures

#### Registration Flow
- If email fails during registration, return error but keep user account created
- Provide clear error message indicating email delivery issue
- Allow user to request OTP resend immediately

#### Password Reset Flow
- If email fails during password reset, return generic success message for security
- Log actual error details for administrator review
- Allow user to retry password reset request

#### OTP Resend Flow
- If email fails during resend, return clear error message
- Maintain existing OTP in Redis (don't invalidate on email failure)
- Allow immediate retry of resend request

### Error Response Patterns
```typescript
// Email delivery failure responses
{
  success: false,
  error: {
    code: 'EMAIL_DELIVERY_ERROR',
    message: 'Failed to send verification email. Please try again or contact support.'
  }
}
```

### Logging Strategy
- Log all email sending attempts (success and failure)
- Include email address (masked for privacy) and error details
- Use structured logging for easy monitoring and alerting
- Never log OTP codes in production logs

## Testing Strategy

### Unit Tests
- EmailService OTP template generation
- Email sending success and failure scenarios
- Template data validation and formatting

### Integration Tests  
- End-to-end registration with email OTP delivery
- Password reset flow with email OTP
- OTP resend functionality
- Error handling scenarios

### Email Testing
- Use email testing service (like Mailtrap) in development
- Verify HTML and plain text template rendering
- Test email delivery timing and reliability
- Validate template responsiveness on different devices

## Security Considerations

### OTP Security
- OTPs are never logged to console or files in production
- OTPs are only transmitted via secure email channels
- Email templates include security warnings about not sharing OTPs
- OTP expiration remains at 10 minutes for security

### Email Security
- Use existing email service security configurations
- Ensure email templates don't expose sensitive system information
- Include warnings about phishing and OTP sharing in templates

### Error Message Security
- Password reset errors use generic messages to prevent email enumeration
- Registration errors provide helpful information without security risks
- Log detailed errors server-side while showing generic messages to users

## Email Service Recommendations

### For Development
- **Gmail SMTP**: Free, easy setup with app-specific password
- **Mailtrap**: Free email testing service (recommended for development)

### For Production
- **Small Scale**: Gmail SMTP (free, 500 emails/day)
- **Medium Scale**: SendGrid or Mailgun ($15/month, better deliverability)
- **Large Scale**: Amazon SES (pay-per-use, very cost-effective)

### Current Configuration
The system uses Nodemailer with configurable SMTP settings via environment variables:
- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port (587 for TLS)
- `SMTP_USER`: Email account username
- `SMTP_PASS`: Email account password/app password

## Implementation Approach

### Phase 1: Email Template Creation
1. Add OTP email template methods to EmailService
2. Create HTML templates for verification and password reset OTPs
3. Create corresponding plain text templates
4. Add proper TypeScript interfaces

### Phase 2: Service Integration
1. Update AuthService.register() to send email instead of console logging
2. Update UserService.resendVerificationOTP() to send email
3. Update UserService.initiatePasswordReset() to send email
4. Remove all console.log statements for OTP codes

### Phase 3: Error Handling
1. Add comprehensive error handling for email failures
2. Implement proper logging for monitoring
3. Update API responses for email delivery errors
4. Add retry mechanisms where appropriate

### Phase 4: Testing and Validation
1. Test all email delivery scenarios
2. Validate template rendering and responsiveness
3. Test error handling and recovery flows
4. Verify security and privacy compliance