import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { setUserSession } from '@/lib/auth'
import { registerSchema, formatZodError } from '@/lib/validation'
import { rateLimitMiddleware } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 attempts per hour per IP
    const rateLimitResponse = await rateLimitMiddleware(request, undefined, 10, 3600000)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const { email, password, displayName, customSlug } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    // Validate input with Zod
    try {
      registerSchema.parse({
        email,
        password,
        displayName: displayName || email.split('@')[0],
        customSlug
      })
    } catch (error) {
      return NextResponse.json(
        { error: formatZodError(error) },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      // Don't reveal email existence for security
      // Add artificial delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))
      return NextResponse.json(
        { error: 'Jika email terdaftar, silakan cek inbox Anda' },
        { status: 200 }
      )
    }

    // Check if custom slug already exists
    if (customSlug) {
      const { data: existingSlug } = await supabase
        .from('users')
        .select('custom_slug')
        .eq('custom_slug', customSlug)
        .single()

      if (existingSlug) {
        return NextResponse.json(
          { error: 'Slug sudah digunakan oleh user lain' },
          { status: 409 }
        )
      }
    }

    // Hash password before storing
    const passwordHash = await bcrypt.hash(password, 10)

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        display_name: displayName || email.split('@')[0],
        custom_slug: customSlug || null
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Gagal membuat user baru' },
        { status: 500 }
      )
    }

    // Create default settings for user
    await supabase
      .from('user_settings')
      .insert({
        user_id: newUser.id
      })

    // Create response with JWT session
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        display_name: newUser.display_name,
        custom_slug: newUser.custom_slug
      }
    })

    // Set JWT session cookie (7 days)
    await setUserSession(newUser.id, 60 * 60 * 24 * 7)

    return response
  } catch (error) {
    console.error('[v0] Error in register API')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}