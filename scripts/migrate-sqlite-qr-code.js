#!/usr/bin/env node
/**
 * Migration script to add qr_code column to existing SQLite databases
 *
 * Usage:
 *   node scripts/migrate-sqlite-qr-code.js
 *
 * This script safely adds the qr_code column to the links table
 * and creates the necessary index for existing installations.
 */

const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const dbDir = path.join(process.cwd(), 'data')
const dbPath = path.join(dbDir, 'linksphere.db')

console.log('[Migration] Starting QR code column migration...')
console.log(`[Migration] Database path: ${dbPath}`)

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.log('[Migration] No existing database found. Migration not needed.')
  console.log('[Migration] The QR code column will be added automatically when the database is created.')
  process.exit(0)
}

const db = new Database(dbPath)

try {
  // Enable foreign keys
  db.pragma('foreign_keys = ON')

  // Check if qr_code column already exists
  const tableInfo = db.prepare("PRAGMA table_info(links)").all()
  const hasQrCodeColumn = tableInfo.some((col) => col.name === 'qr_code')

  if (hasQrCodeColumn) {
    console.log('[Migration] qr_code column already exists. Skipping migration.')
  } else {
    console.log('[Migration] Adding qr_code column to links table...')
    db.exec('ALTER TABLE links ADD COLUMN qr_code TEXT')
    console.log('[Migration] ✓ qr_code column added')
  }

  // Check if index exists
  const indexInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_links_qr_code'").get()

  if (indexInfo) {
    console.log('[Migration] Index idx_links_qr_code already exists. Skipping.')
  } else {
    console.log('[Migration] Creating index for qr_code column...')
    db.exec('CREATE INDEX IF NOT EXISTS idx_links_qr_code ON links(qr_code) WHERE qr_code IS NOT NULL')
    console.log('[Migration] ✓ Index created')
  }

  // Get statistics
  const linksCount = db.prepare('SELECT COUNT(*) as count FROM links').get()
  console.log(`[Migration] Total links: ${linksCount.count}`)

  console.log('[Migration] ✓ Migration completed successfully!')
  console.log('[Migration] New links will automatically have QR codes generated.')
  console.log('[Migration] Existing links will generate QR codes on next update.')

} catch (error) {
  console.error('[Migration] ✗ Migration failed:', error)
  process.exit(1)
} finally {
  db.close()
}
