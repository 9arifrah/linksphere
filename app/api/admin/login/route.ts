import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { setAdminSession } from '@/lib/auth'
import { loginSchema } from '@/lib/validation'
import { rateLimitMiddleware } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per minute per IP
    const rateLimitResponse = await rateLimitMiddleware(request, undefined, 5, 60000)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    // Validate input
    try {
      loginSchema.parse({ email, password })
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    // Step 1: Check if user exists using db abstraction
    const user = await db.getUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Step 2: Verify password hash
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Step 3: Check if user is an admin using db abstraction
    const isAdmin = await db.isAdminUser(user.id)

    // Use same error message as wrong password (prevents admin enumeration)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Step 4: Create response with JWT session
    const response = NextResponse.json({
      success: true,
      admin: {
        id: user.id,
        email: user.email,
        display_name: user.display_name
      }
    })

    // Set JWT admin session cookie (7 days)
    await setAdminSession(user.id, 60 * 60 * 24 * 7)

    return response
  } catch (error) {
    console.error('[v0] Error in admin login API')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}