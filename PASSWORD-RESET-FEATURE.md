# 🔐 Password Reset Feature - Implementation Guide

## Overview

Complete forgot password and reset password system for users to securely recover their accounts.

---

## 🎯 User Flow

### Forgot Password Flow

1. **Login Screen** → User clicks "Forgot password?"
2. **Forgot Password Screen** → User enters email address
3. **Email Sent** → System generates 6-character reset token
4. **Email Receipt** → User receives email with reset code
5. **Redirect** → Auto-redirects to Reset Password screen

### Reset Password Flow

1. **Reset Password Screen** → User enters reset code from email
2. **Enter New Password** → User enters and confirms new password
3. **Validation** → System validates:
   - Reset token is valid and not expired
   - Password is minimum 6 characters
   - Passwords match
4. **Success** → Password updated, redirects to login
5. **Re-login** → User logs in with new password

---

## 📋 Components

### Backend Implementation

#### 1. User Model Updates

**File**: `models/userModel.js`

```javascript
// Added fields
resetPasswordToken: String,     // Hashed token
resetPasswordExpires: Date      // Expiry timestamp (1 hour)
```

#### 2. Controllers

**File**: `controllers/authControllers.js`

**forgotPassword()**

- Accepts: `{ email: string }`
- Generates: 6-character alphanumeric reset token
- Stores: Hashed token + 1-hour expiry in user model
- Sends: Email with reset code
- Returns: Success message (doesn't reveal if email exists for security)

**resetPassword()**

- Accepts: `{ token, password, confirmPassword }`
- Validates:
  - Token matches and hasn't expired
  - Password is 6+ characters
  - Passwords match
- Updates: Password (bcrypt hashed) + clears reset token
- Returns: Success message

#### 3. Email Service

**File**: `services/email.service.js`

**sendResetPasswordEmail()**

- Uses `emailTemplates.forgotPassword()` template
- Displays: Reset code in large formatted box
- Mentions: "Valid for 1 hour"
- Includes: Security notice to never share code

#### 4. Routes

**File**: `routes/authRoutes.js`

```
POST /auth/forgot-password
- Body: { email }
- Returns: { message: "If email exists, password reset link..." }

POST /auth/reset-password
- Body: { token, password, confirmPassword }
- Returns: { message: "Password has been reset successfully" }
```

---

### Frontend Implementation

#### 1. Forgot Password Screen

**File**: `src/app/(auth)/forgot-password.tsx`

**Features**:

- Email input with validation
- Loading state during submission
- Success message after sending
- Auto-redirect to reset screen after 2 seconds
- Back button to login
- Security information

**UI Elements**:

- Mail icon in header
- Email validation (format check)
- "Send Reset Link" button
- Footer with login link

#### 2. Reset Password Screen

**File**: `src/app/(auth)/reset-password.tsx`

**Features**:

- Reset code input (uppercased automatically)
- Password input with show/hide toggle
- Confirm password input with show/hide toggle
- Password requirements display
- Validation for all fields
- Success redirect to login

**UI Elements**:

- Lock icon in header
- 3 input fields
- Password requirements info box
- "Reset Password" button
- Footer with resend link

#### 3. Login Screen Update

**File**: `src/app/(auth)/login.tsx`

**Changes**:

- Added "Forgot password?" link after password input
- Link navigates to forgot-password screen
- Styled as text link in primary color

#### 4. Auth API

**File**: `src/services/authApi.ts`

**New Functions**:

```typescript
forgotPasswordRequest(email): Promise<{ message: string }>
resetPasswordRequest(token, password, confirmPassword): Promise<{ message: string }>
```

---

## 🔒 Security Features

### Token Generation

- **Type**: 6-character random alphanumeric (e.g., "A1B2C3")
- **Hashing**: SHA256 before storage
- **Storage**: Hashed in database, plaintext only in email
- **Expiry**: 1 hour from generation

### Password Handling

- **Hashing**: bcrypt (10 rounds) automatically by User model
- **Validation**: Minimum 6 characters enforced
- **Confirmation**: Frontend and backend verify passwords match

### Email Security

- **Disclosure**: Never reveals if email exists (returns same message)
- **Token Display**: Shows in formatted box with security notice
- **Warning**: "Never share this code" prominently displayed
- **Expiry**: Email shows "Valid for 1 hour"

### User Experience

- **Auto-redirect**: Forgot screen redirects to reset after email sent
- **Clear Errors**: Specific validation messages for each field
- **Loading States**: Buttons disabled during API calls
- **Success Feedback**: Success messages shown before redirect

---

## 🧪 Testing Guide

### Test Forgot Password

1. Go to **Login Screen**
2. Click **"Forgot password?"**
3. Enter test email: `test@example.com`
4. Click **"Send Reset Link"**
5. Should see: "Password reset instructions have been sent"
6. Auto-redirects to reset password screen

### Test Reset Password

1. Check email for reset code (e.g., "A1B2C3")
2. On reset password screen, enter:
   - Reset Code: `A1B2C3`
   - New Password: `NewPass123`
   - Confirm: `NewPass123`
3. Click **"Reset Password"**
4. Should see: "Password reset successfully!"
5. Auto-redirects to login
6. Log in with new password

### Test Error Scenarios

| Scenario              | Expected Result                          |
| --------------------- | ---------------------------------------- |
| Invalid email format  | "Enter a valid email address"            |
| Expired token         | "Invalid or expired reset token"         |
| Token mismatch        | "Invalid or expired reset token"         |
| Password < 6 chars    | "Password must be at least 6 characters" |
| Passwords don't match | "Passwords do not match"                 |
| No reset code         | "Enter the reset code from your email"   |

### Test Security

- [ ] Token only valid for 1 hour
- [ ] Used token can't be reused
- [ ] Email doesn't reveal if account exists
- [ ] Password is bcrypt hashed in database
- [ ] Reset token is SHA256 hashed in database

---

## 📊 API Specifications

### POST /auth/forgot-password

```
Request:
{
  "email": "user@example.com"
}

Response (200):
{
  "message": "If email exists, password reset link has been sent"
}

Response (400):
{
  "error": "Email is required"
}
```

### POST /auth/reset-password

```
Request:
{
  "token": "A1B2C3",
  "password": "NewPassword123",
  "confirmPassword": "NewPassword123"
}

Response (200):
{
  "message": "Password has been reset successfully"
}

Response (400):
{
  "error": "Passwords do not match"
}

Response (401):
{
  "error": "Invalid or expired reset token"
}
```

---

## 📝 Database Impact

### User Model

```javascript
{
  // ... existing fields
  resetPasswordToken: String,      // Hashed token
  resetPasswordExpires: Date       // Expiry time
}
```

### Changes

- New columns added to user collection
- No changes to existing auth flow
- Backward compatible

---

## 🔄 Integration Points

### Email Service

- Uses Resend API (primary) or Mailgun (fallback)
- Existing email template system
- HTML formatted with branding

### Authentication Flow

- Doesn't interfere with normal login
- Separate from OTP verification flow
- Clears token after successful reset

### Frontend Navigation

- Group-based auth routes
- Unauthenticated routes (login, signup, forgot-password, reset-password)
- Redirects to dashboard after successful reset and login

---

## 🚀 Deployment Checklist

- [ ] Backend deployed with new controllers
- [ ] Database migration for new fields (auto-created by Mongoose)
- [ ] Email service configured (Resend API key set)
- [ ] Frontend screens deployed
- [ ] Routes configured in auth layout
- [ ] Test password reset flow end-to-end
- [ ] Monitor email delivery
- [ ] Test token expiration

---

## 📞 Support & Troubleshooting

### Email Not Received

1. Check Resend API key in .env
2. Verify email domain is authorized
3. Check spam folder
4. Check email service logs

### Token Expired

1. Token valid for 1 hour only
2. User must request new token
3. "Didn't receive the code?" link available

### Password Reset Loop

1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check token format in request
4. Verify database connection

### Backend Issues

```bash
# Check logs
tail -f logs/app.log

# Test endpoint manually
curl -X POST http://localhost:4100/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## 🎨 UI/UX Notes

### Forgot Password Screen

- Prominent email icon
- Clear instructions
- Success message with visual indicator
- Accessible keyboard navigation

### Reset Password Screen

- Password requirements listed
- Show/hide password toggles
- Visual feedback on validation
- Auto-uppercase token input

### Login Screen

- "Forgot password?" link right after password field
- Subtle styling (text link)
- Clear visual hierarchy

---

## 🔮 Future Enhancements

1. **2FA for password reset** - Additional verification step
2. **Recovery codes** - Alternative reset methods
3. **Password history** - Prevent reusing old passwords
4. **Login notifications** - Alert on successful password reset
5. **Device tracking** - Mark new login device after reset
6. **Audit logs** - Track all password reset attempts
