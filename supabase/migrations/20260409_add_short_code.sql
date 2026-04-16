-- Migration: Add short_code column to links table
-- Created: 2026-04-09

-- Add short_code column (nullable, unique)
ALTER TABLE links ADD COLUMN IF NOT EXISTS short_code TEXT UNIQUE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_links_short_code
ON links(short_code)
WHERE short_code IS NOT NULL;

-- Add comment
COMMENT ON COLUMN links.short_code IS 'Short code for URL shortener. Nullable, unique globally.';
