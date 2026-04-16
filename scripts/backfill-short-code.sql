-- =====================================================
-- BACKFILL SHORT CODES FOR EXISTING LINKS
-- Date: 2026-04-16
-- Description: Generate unique 6-character short codes
--   for all existing links that don't have one yet.
--   Matches the API logic in db-supabase.ts:
--   - Characters: a-z, 0-9 (no hyphens for auto-generated)
--   - Length: 6 characters
--   - Must be unique against existing short_codes
--   - Must not conflict with reserved system routes
--   QR codes still need to be generated via API endpoint.
-- =====================================================

-- Step 1: Create a function that generates a random short code
-- matching the API's generateShortCode() logic
CREATE OR REPLACE FUNCTION generate_link_short_code(p_length INT DEFAULT 6)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  code TEXT := '';
  i INT;
  max_attempts INT := 100;
  attempt INT := 0;
  reserved_codes TEXT[] := ARRAY[
    'dashboard', 'login', 'register', 'admin', 'api',
    'auth', 'user', 'users', 'settings', 'categories', 'links',
    'track-click', 'public', 'profile',
    'u', 's', 'l', 'go', 'to',
    'www', 'mail', 'ftp', 'static', 'assets', 'docs'
  ];
BEGIN
  LOOP
    attempt := attempt + 1;
    
    -- Generate random code of p_length characters
    code := '';
    FOR i IN 1..p_length LOOP
      code := code || substr(chars, floor(random() * 36 + 1)::int, 1);
    END LOOP;
    
    -- Check: not a reserved code
    IF code = ANY(reserved_codes) THEN
      CONTINUE;
    END IF;
    
    -- Check: must start and end with alphanumeric (already guaranteed since no hyphens)
    
    -- Check: must be unique against existing short_codes
    IF NOT EXISTS (SELECT 1 FROM links WHERE short_code = code) THEN
      RETURN code;
    END IF;
    
    -- Safety: prevent infinite loop
    IF attempt >= max_attempts THEN
      -- Try with longer code length (matching API: increment length)
      IF p_length < 10 THEN
        RETURN generate_link_short_code(p_length + 1);
      END IF;
      RAISE EXCEPTION 'Failed to generate unique short code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Assign short codes to all links that don't have one
-- Process one at a time to ensure uniqueness
DO $$
DECLARE
  link_record RECORD;
  new_code TEXT;
BEGIN
  FOR link_record IN SELECT id FROM links WHERE short_code IS NULL ORDER BY created_at LOOP
    new_code := generate_link_short_code(6);
    UPDATE links SET short_code = new_code, updated_at = NOW() WHERE id = link_record.id;
    RAISE NOTICE 'Link %: assigned short_code = %', link_record.id, new_code;
  END LOOP;
END $$;

-- Step 3: Verify results
SELECT 
  COUNT(*) AS total_links,
  COUNT(short_code) AS links_with_short_code,
  COUNT(*) - COUNT(short_code) AS links_without_short_code
FROM links;

-- Step 4: Show all links with their short codes and QR status
SELECT 
  id, 
  title, 
  short_code,
  CASE WHEN qr_code IS NULL THEN '❌ Missing' ELSE '✅ Has QR' END AS qr_status
FROM links
ORDER BY created_at;

-- Step 5: Clean up (optional - remove the function after use)
-- DROP FUNCTION IF EXISTS generate_link_short_code(INT);

-- =====================================================
-- NEXT STEP: Generate QR codes via API endpoint
-- After running this SQL, generate QR codes by running:
--
-- POST /api/admin/backfill
-- Body: { "type": "qr_code" }
--
-- This requires the Node.js qrcode library.
-- =====================================================