-- Migration: Add QR Code Column to Links Table
-- Date: 2026-04-03
-- Description: Adds qr_code column to store base64-encoded QR code data for each link

-- Add qr_code column to links table
ALTER TABLE links
ADD COLUMN qr_code TEXT;

-- NOTE: We intentionally do NOT create a btree index on qr_code because
-- base64 SVG QR code data can exceed PostgreSQL's btree index row size limit
-- (2704 bytes). A partial btree index fails with:
-- "index row size XXXX exceeds btree version 4 maximum 2704"
-- Instead, queries checking for QR code existence use sequential scans,
-- which is fine given the relatively small number of rows.

-- Add comment for documentation
COMMENT ON COLUMN links.qr_code IS 'Base64-encoded SVG QR code data URI for the link URL';

-- Migration complete
-- Note: Existing links will have NULL qr_code values.
-- New links will have QR codes auto-generated via API.
-- Existing links can get QR codes via admin backfill:
-- POST /api/admin/backfill { "type": "qr_code" }