-- Migration: Add QR Code Column to Links Table
-- Date: 2026-04-03
-- Description: Adds qr_code column to store base64-encoded QR code data for each link

-- Add qr_code column to links table
ALTER TABLE links
ADD COLUMN qr_code TEXT;

-- Create index for qr_code (only where qr_code is not null for efficiency)
-- This helps with queries that filter links with QR codes
CREATE INDEX IF NOT EXISTS idx_links_qr_code
ON links(qr_code)
WHERE qr_code IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN links.qr_code IS 'Base64-encoded SVG QR code data URI for the link URL';

-- Migration complete
-- Note: Existing links will have NULL qr_code values.
-- New links will have QR codes auto-generated via API.
-- Existing links will generate QR codes on next update.
