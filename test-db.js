// Direct database test for SQLite schema changes
const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'data', 'linksphere.db')
const db = new Database(dbPath)

console.log('=== Testing SQLite Schema Changes ===\n')

// Test 1: Check user_settings table schema
console.log('Test 1: Checking user_settings table schema...')
const settingsSchema = db.prepare('PRAGMA table_info(user_settings)').all()
console.log('Columns:', JSON.stringify(settingsSchema.map(c => c.name), null, 2))

const hasProfileDescription = settingsSchema.some(c => c.name === 'profile_description')
const hasUpdatedAt = settingsSchema.some(c => c.name === 'updated_at')

console.log(`✓ Has profile_description column: ${hasProfileDescription ? 'YES' : 'NO'}`)
console.log(`✓ Has updated_at column: ${hasUpdatedAt ? 'YES' : 'NO'}`)

if (!hasProfileDescription) {
  console.error('❌ ERROR: profile_description column missing!')
} else {
  console.log('✅ profile_description column exists!\n')
}

// Test 2: Check links table schema
console.log('Test 2: Checking links table schema...')
const linksSchema = db.prepare('PRAGMA table_info(links)').all()
console.log('Columns:', JSON.stringify(linksSchema.map(c => c.name), null, 2))

const hasIsActive = linksSchema.some(c => c.name === 'is_active')

console.log(`✓ Has is_active column: ${hasIsActive ? 'YES' : 'NO'}`)

if (!hasIsActive) {
  console.error('❌ ERROR: is_active column missing!')
} else {
  console.log('✅ is_active column exists!\n')
}

// Test 3: Insert test data with profile_description
console.log('Test 3: Testing insert with profile_description...')
try {
  const userId = 'test-user-123'
  const settingsId = 'test-settings-123'

  // Clean up first
  db.prepare('DELETE FROM user_settings WHERE user_id = ?').run(userId)
  db.prepare('DELETE FROM users WHERE id = ?').run(userId)

  // Create user
  db.prepare('INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)')
    .run(userId, 'test@example.com', 'hash', 'Test User')

  // Create settings with profile_description
  db.prepare(`INSERT INTO user_settings (id, user_id, theme_color, profile_description)
    VALUES (?, ?, ?, ?)`)
    .run(settingsId, userId, '#3b82f6', 'This is a test profile description')

  // Read back
  const savedSettings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId)
  console.log('Saved settings:', JSON.stringify(savedSettings, null, 2))

  if (savedSettings.profile_description === 'This is a test profile description') {
    console.log('✅ profile_description saves correctly!\n')
  } else {
    console.error('❌ ERROR: profile_description not saved correctly!\n')
  }

} catch (error) {
  console.error('❌ Test insert failed:', error.message, '\n')
}

// Test 4: Insert test link with is_active
console.log('Test 4: Testing insert with is_active...')
try {
  const linkId = 'test-link-123'
  const userId = 'test-user-123'

  // Clean up first
  db.prepare('DELETE FROM links WHERE id = ?').run(linkId)

  // Create link with is_active
  db.prepare(`INSERT INTO links (id, title, url, is_active, is_public, user_id)
    VALUES (?, ?, ?, ?, ?, ?)`)
    .run(linkId, 'Test Link', 'https://example.com', 1, 1, userId)

  // Read back
  const savedLink = db.prepare('SELECT * FROM links WHERE id = ?').get(linkId)
  console.log('Saved link:', JSON.stringify(savedLink, null, 2))

  if (savedLink.is_active === 1) {
    console.log('✅ is_active saves correctly!\n')
  } else {
    console.error('❌ ERROR: is_active not saved correctly!\n')
  }

} catch (error) {
  console.error('❌ Test insert failed:', error.message, '\n')
}

// Test 5: Verify indexes
console.log('Test 5: Checking indexes...')
const indexes = db.prepare(`
  SELECT name FROM sqlite_master
  WHERE type = 'index'
  AND name LIKE 'idx_%'
  ORDER BY name
`).all()

console.log('Indexes:', JSON.stringify(indexes.map(i => i.name), null, 2))

const hasIsActiveIndex = indexes.some(i => i.name === 'idx_links_is_active')
const hasIsPublicIndex = indexes.some(i => i.name === 'idx_links_is_public')

console.log(`✓ Has idx_links_is_active: ${hasIsActiveIndex ? 'YES' : 'NO'}`)
console.log(`✓ Has idx_links_is_public: ${hasIsPublicIndex ? 'YES' : 'NO'}`)

if (hasIsActiveIndex && hasIsPublicIndex) {
  console.log('✅ Indexes created correctly!\n')
} else {
  console.error('❌ ERROR: Some indexes missing!\n')
}

// Test 6: Check existing user data
console.log('Test 6: Checking existing user data...')
const users = db.prepare('SELECT * FROM users LIMIT 3').all()
console.log('Sample users:', JSON.stringify(users.map(u => ({ id: u.id, email: u.email, slug: u.custom_slug })), null, 2))

if (users.length > 0) {
  const userId = users[0].id
  const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId)
  console.log('User settings:', JSON.stringify(settings, null, 2))

  const links = db.prepare('SELECT id, title, is_active, is_public FROM links WHERE user_id = ? LIMIT 3').all(userId)
  console.log('User links:', JSON.stringify(links, null, 2))
}

console.log('\n=== All Database Tests Complete ===')

db.close()
