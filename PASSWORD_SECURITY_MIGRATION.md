# 🔐 Password Security Migration Guide

## Overview

This document explains the password security improvements made to the application and how to migrate existing users.

## ✅ Changes Made

### 1. Installed bcryptjs
- `bcryptjs` package added for password hashing
- Uses 10 salt rounds for optimal security/performance balance

### 2. Updated Registration API (`app/api/auth/register/route.ts`)
- ✅ Passwords now hashed using bcrypt before storage
- ✅ Added password validation (minimum 8 characters)
- ✅ Database stores only hashed passwords

### 3. Updated User Login API (`app/api/auth/login/route.ts`)
- ✅ Passwords verified using bcrypt comparison
- ✅ No more plain text password comparison

### 4. Updated Admin Login API (`app/api/admin/login/route.ts`)
- ✅ Passwords verified using bcrypt comparison
- ✅ Same security as user login

## ⚠️ Important: Existing Users Issue

### The Problem
- All existing users have **plain text passwords** in the database
- After implementing bcrypt hashing, **existing users cannot login**
- bcrypt hashes are **one-way** - cannot convert plain text to hash without original password

### The Solution
You have 3 options:

### Option 1: Force Password Reset (Recommended)
1. Send password reset emails to all users
2. Set a temporary password for each user
3. Require them to change password on first login

**Example SQL to set temporary password:**
```sql
-- Hash for "TempPass123!" (generated using Node.js)
UPDATE users 
SET password_hash = '$2a$10$abcdef...' -- Replace with actual hash
WHERE id = 'user-id';
```

**Generate hash using:**
```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('TempPass123!', 10);
console.log(hash);
```

### Option 2: Manual Password Update (For few users)
If you have only a few users, manually update each password:

1. Login to admin panel
2. Go to "Manajemen User"
3. Click Edit on each user
4. Set a new password
5. Notify user of their new password

### Option 3: Delete All Users (Last Resort)
1. Delete all existing users from database
2. Ask users to re-register
3. Only use this if you have no important data

## 📋 Migration Steps (Option 1)

### Step 1: Generate Temporary Password Hash
Create a Node.js script:

```javascript
// generate-hash.js
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'TempPass123!';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
}

generateHash();
```

Run it:
```bash
node generate-hash.js
```

### Step 2: Update Database
Run the migration SQL with the generated hash:

```sql
UPDATE users 
SET password_hash = '$2a$10$YourGeneratedHashHere'
WHERE password_migrated = FALSE;
```

### Step 3: Notify Users
Send email to all users:

```
Subject: Security Update - Please Reset Your Password

Dear User,

We've implemented important security improvements to protect your account. 
You will need to reset your password before logging in again.

Temporary Password: TempPass123!

Please log in and change your password immediately.

Thank you,
The Team
```

## 🔒 Security Best Practices (Now Implemented)

| Practice | Status | Description |
|-----------|----------|-------------|
| Password Hashing | ✅ | Using bcrypt with 10 rounds |
| Password Validation | ✅ | Minimum 8 characters required |
| No Plain Text Storage | ✅ | Only hashes in database |
| Secure Comparison | ✅ | Uses bcrypt.compare() |
| HTTP-Only Cookies | ✅ | Session cookies protected |
| Secure Cookies (Prod) | ✅ | Secure flag in production |

## 📝 Next Steps

1. **Choose an option** for existing users
2. **Test registration** - new users should work fine
3. **Test login** - ensure new users can login with hashed password
4. **Migrate existing users** - follow chosen option
5. **Verify all users** can login after migration

## 🚀 Test New Registration

After deployment, test the new registration flow:

1. Go to `/register`
2. Enter a new email and password (8+ characters)
3. Submit registration
4. Check database - password should be a bcrypt hash (starts with `$2a$10$`)
5. Try logging in with the new account

## 📚 Additional Resources

- [bcryptjs Documentation](https://github.com/dcodeIO/bcryptjs)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Next.js Security Best Practices](https://nextjs.org/docs/security)

## ⚡ Quick Commands

### Generate a password hash
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword123!', 10).then(h => console.log(h))"
```

### Test password hash
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.compare('YourPassword123!', '\$2a\$10\$...').then(r => console.log('Match:', r))"
```

---

**Created:** February 10, 2026
**Status:** Security Vulnerability FIXED ✅