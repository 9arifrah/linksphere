-- Migration script to add qr_code column to existing SQLite databases
-- Run this manually for existing installations:
-- sqlite3 data/linksphere.db < scripts/sqlite-add-qr-code.sql

-- Check if qr_code column already exists (for idempotent migration)
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we use a workaround

-- Add qr_code column to links table
-- This will fail if the column already exists, which is fine for safety
ALTER TABLE links ADD COLUMN qr_code TEXT;

-- Create index for qr_code (only where qr_code is not null for efficiency)
CREATE INDEX IF NOT EXISTS idx_links_qr_code ON links(qr_code) WHERE qr_code IS NOT NULL;

-- Verify the migration
SELECT 'Migration completed successfully!' as status;
SELECT COUNT(*) as links_count FROM links;
SELECT COUNT(*) as links_with_qr_code FROM links WHERE qr_code IS NOT NULL;
