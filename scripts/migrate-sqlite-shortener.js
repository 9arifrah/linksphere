const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const dbDir = path.join(process.cwd(), 'data')
const dbPath = path.join(dbDir, 'linksphere.db')

console.log('[Migration] Starting short code migration...')

try {
  const db = new Database(dbPath)

  // Check if short_code column already exists
  const pragma = db.pragma('table_info(links)')
  const hasShortCodeColumn = pragma.some(col => col.name === 'short_code')

  if (hasShortCodeColumn) {
    console.log('[Migration] short_code column already exists. Skipping.')
    db.close()
    process.exit(0)
  }

  console.log('[Migration] Adding short_code column to links table...')

  // Add short_code column (without UNIQUE constraint - SQLite limitation)
  // Uniqueness will be enforced by the unique index
  db.exec('ALTER TABLE links ADD COLUMN short_code TEXT')

  console.log('[Migration] Creating unique index on short_code...')

  // Create unique index to enforce uniqueness (better than column constraint for SQLite)
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code) WHERE short_code IS NOT NULL')

  console.log('[Migration] ✅ Migration completed successfully!')

  db.close()
} catch (error) {
  console.error('[Migration] ❌ Error:', error.message)
  process.exit(1)
}
