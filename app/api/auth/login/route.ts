import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { setUserSession } from '@/lib/auth'
import { loginSchema } from '@/lib/validation'
import { rateLimitMiddleware, getClientIp } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per minute per IP
    const rateLimitResponse = await rateLimitMiddleware(request, undefined, 5, 60000)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const { email, password, rememberMe = false } = await request.json()

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

    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Verify password hash
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        custom_slug: user.custom_slug
      }
    })

    // Set JWT session cookie
    // Remember me: 30 days vs regular: 7 days
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7
    await setUserSession(user.id, maxAge)

    return response
  } catch (error) {
    console.error('[v0] Error in user login API')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}