// Debug JWT token generation and verification
const jose = require('jose')
const fs = require('fs')
const path = require('path')

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
console.log('JWT_SECRET (length):', JWT_SECRET.length)

// Test token generation and verification
async function testJwt() {
  const userId = 'test-user-id-123'

  // Generate token
  const token = await new jose.SignJWT({ userId, isAdmin: false })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  console.log('\nGenerated token:', token.substring(0, 50) + '...')

  // Verify token
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    console.log('\nVerified payload:', JSON.stringify(payload, null, 2))
    console.log('✅ JWT generation and verification works!')
  } catch (error) {
    console.error('\n❌ JWT verification failed:', error.message)
  }

  // Test with fetch API
  console.log('\n--- Testing with Fetch API ---')
  const response = await fetch('http://localhost:3001/api/user/settings', {
    method: 'GET',
    headers: {
      'Cookie': `user_session=${token}`
    }
  })

  console.log('Response status:', response.status)
  const data = await response.json()
  console.log('Response data:', JSON.stringify(data, null, 2))
}

testJwt().catch(console.error)
