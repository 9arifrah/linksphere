-- Migrate existing plain text passwords to bcrypt hashes
-- This script is a template - you need to hash passwords using bcrypt before running

-- IMPORTANT: All users will need to reset their passwords after this migration
-- because we cannot hash existing plain text passwords without knowing the original passwords
--
-- Options:
-- 1. Send password reset emails to all users
-- 2. Set temporary passwords and force users to change on next login
-- 3. Delete all existing users and ask them to re-register (NOT recommended)

-- Option 1: Add a column to track password status
ALTER TABLE users ADD COLUMN password_migrated BOOLEAN DEFAULT FALSE;

-- Option 2: If you want to force all users to reset their password
-- Update all passwords to a known temporary hash (password: "TempPass123!")
-- This hash was generated using bcrypt.hash("TempPass123!", 10)
UPDATE users 
SET password_hash = '$2a$10$YourBcryptHashHere', password_migrated = TRUE
WHERE password_migrated = FALSE;

-- Option 3: If you have the original passwords, you can hash them individually
-- Example (requires running bcrypt.hash() on each password):
-- UPDATE users 
-- SET password_hash = '$2a$10$GeneratedHashForUser1', password_migrated = TRUE
-- WHERE email = 'user1@example.com';

-- After migration, you can remove the temp column:
-- ALTER TABLE users DROP COLUMN password_migrated;

-- For admin users, make sure their passwords are also updated
-- UPDATE users
-- SET password_hash = '$2a$10$GeneratedHashForAdmin'
-- WHERE id IN (SELECT user_id FROM admin_users);

-- NOTE: Generate bcrypt hashes using Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('password', 10);
-- console.log(hash);