-- =====================================================
-- RESET PASSWORD FOR SUPER ADMIN
-- Email: admin@linksphere.com
-- New Password: Admin123!
-- =====================================================

UPDATE users
SET password_hash = '$2b$10$9jXWOfCTTaDxQaJ6WF5n3uMdVoLedcx3fBz46xZqW4GNPq5sGaV3m',
    updated_at = NOW()
WHERE email = 'admin@linksphere.com';

-- Verify the update
SELECT id, email, display_name, custom_slug, updated_at
FROM users
WHERE email = 'admin@linksphere.com';