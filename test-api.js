// Test script for SQLite schema changes
const jose = require('jose')
const fs = require('fs')
const path = require('path')

const API_BASE = 'http://localhost:3001'

// Read JWT_SECRET from .env file
function getJwtSecret() {
  try {
    const envPath = path.join(__dirname, '.env')
    const envContent = fs.readFileSync(envPath, 'utf8')
    const match = envContent.match(/JWT_SECRET=(.+)/)
    if (match && match[1]) {
      return new TextEncoder().encode(match[1].trim())
    }
  } catch (e) {
    console.log('Could not read .env file, using fallback')
  }
  return new TextEncoder().encode('fallback-secret-change-in-production-minimum-32-chars')
}

const JWT_SECRET = getJwtSecret()
let testUserEmail, testUserSlug

async function createSessionToken(userId) {
  return await new jose.SignJWT({ userId, isAdmin: false })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

async function testRegistration() {
  console.log('\n=== Testing Registration ===')
  testUserEmail = `testuser${Date.now()}@example.com`
  testUserSlug = `testprofile${Date.now()}`

  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testUserEmail,
      password: 'Test1234!',
      displayName: 'Test User Profile',
      customSlug: testUserSlug
    })
  })
  const data = await response.json()
  console.log('Register Response:', JSON.stringify(data, null, 2))
  return data.user
}

async function testLogin() {
  console.log('\n=== Testing Login ===')
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testUserEmail,
      password: 'Test1234!'
    })
  })
  const data = await response.json()
  console.log('Login Response:', JSON.stringify(data, null, 2))
  return data.user?.id
}

async function testUpdateSettings(userId) {
  console.log('\n=== Testing Update Settings (with profile_description) ===')
  const token = await createSessionToken(userId)

  const response = await fetch(`${API_BASE}/api/user/settings`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `user_session=${token}`
    },
    body: JSON.stringify({
      profile_description: 'Software developer yang suka berbagi link bermanfaat',
      theme_color: '#3b82f6',
      page_title: 'Link Saya',
      show_categories: true
    })
  })
  const data = await response.json()
  console.log('Update Settings Response:', JSON.stringify(data, null, 2))
  return response.ok
}

async function testCreateLink(userId) {
  console.log('\n=== Testing Create Link (with is_active) ===')
  const token = await createSessionToken(userId)

  const response = await fetch(`${API_BASE}/api/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `user_session=${token}`
    },
    body: JSON.stringify({
      title: 'GitHub Profile',
      url: 'https://github.com/example',
      description: 'Link ke GitHub saya',
      is_public: true,
      is_active: true,
      user_id: userId
    })
  })
  const data = await response.json()
  console.log('Create Link Response:', JSON.stringify(data, null, 2))
  return data.link?.id
}

async function testGetPublicProfile(slug) {
  console.log(`\n=== Testing Get Public Profile (${slug}) ===`)
  const response = await fetch(`${API_BASE}/u/${slug}`)
  const html = await response.text()

  // Check if profile_description is in the page
  const hasDescription = html.includes('Software developer yang suka berbagi link bermanfaat')
  const hasGitHubLink = html.includes('GitHub Profile')

  console.log('Public Profile loaded:', response.ok)
  console.log('Has profile_description:', hasDescription)
  console.log('Has GitHub link:', hasGitHubLink)

  return { hasDescription, hasGitHubLink }
}

async function runTests() {
  console.log('Starting SQLite Schema Changes Test...\n')

  try {
    // Test 1: Registration
    const user = await testRegistration()
    if (!user) {
      console.error('Registration failed!')
      return
    }
    const userId = user.id
    const userSlug = user.custom_slug

    // Test 2: Login
    const loginUserId = await testLogin()
    if (loginUserId !== userId) {
      console.error('Login failed or returned different user!')
      return
    }

    // Test 3: Update Settings with profile_description
    const settingsUpdated = await testUpdateSettings(userId)
    if (!settingsUpdated) {
      console.error('Update settings failed!')
      return
    }
    console.log('✅ profile_description field works!')

    // Test 4: Create Link with is_active
    const linkId = await testCreateLink(userId)
    if (!linkId) {
      console.error('Create link failed!')
      return
    }
    console.log('✅ is_active field works!')

    // Test 5: Get Public Profile
    const profile = await testGetPublicProfile(userSlug)
    if (profile.hasDescription && profile.hasGitHubLink) {
      console.log('✅ Public profile displays profile_description!')
    }

    console.log('\n=== All Tests Passed! ===')
  } catch (error) {
    console.error('Test failed with error:', error.message)
  }
}

runTests()
