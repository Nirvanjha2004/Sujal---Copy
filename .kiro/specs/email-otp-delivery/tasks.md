# Implementation Plan

- [x] 1. Extend EmailService with OTP email templates





  - Add new interface definitions for OTP email data
  - Create sendVerificationOTP method with HTML and text templates
  - Create sendPasswordResetOTP method with HTML and text templates
  - _Requirements: 1.2, 2.2, 3.3, 4.1, 4.2, 4.3, 4.4, 4.5_

- [-] 2. Update AuthService registration flow


  - [x] 2.1 Replace console.log with email sending in register method



    - Import and use emailService.sendVerificationOTP
    - Add proper error handling for email delivery failures
    - Remove console.log statement for OTP
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

- [x] 3. Update UserService OTP flows





  - [x] 3.1 Replace console.log with email sending in resendVerificationOTP method


    - Import and use emailService.sendVerificationOTP
    - Add error handling for email delivery failures
    - Remove console.log statement for OTP
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Replace console.log with email sending in initiatePasswordReset method


    - Import and use emailService.sendPasswordResetOTP
    - Add error handling for email delivery failures
    - Remove console.log statement for OTP
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4. Implement comprehensive error handling and logging





  - [x] 4.1 Add structured logging for email delivery attempts


    - Log successful email sends with masked email addresses
    - Log email delivery failures with error details
    - Ensure no OTP codes are logged in production
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 4.2 Update API error responses for email failures


    - Modify registration endpoint error handling
    - Update password reset endpoint error handling
    - Update OTP resend endpoint error handling
    - _Requirements: 1.4, 1.5, 2.4, 3.4, 5.4, 5.5_

- [ ]* 5. Create unit tests for email OTP functionality
  - Write tests for EmailService OTP template methods
  - Test email sending success and failure scenarios
  - Test error handling in AuthService and UserService
  - _Requirements: All requirements_

- [ ]* 6. Create integration tests for OTP email flows
  - Test complete registration flow with email OTP
  - Test password reset flow with email OTP
  - Test OTP resend functionality
  - Test error scenarios and recovery
  - _Requirements: All requirements_