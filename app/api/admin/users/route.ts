import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { registerSchema } from '@/lib/validation'

// GET all users (both regular and admin)
export async function GET(request: NextRequest) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined

    const users = await db.getAllUsersWithAdminStatus(search)

    return NextResponse.json({ users })
  } catch (error) {
    console.error('[v0] Error in users GET by admin:', session.userId)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { email, password, display_name, custom_slug, is_admin } = await request.json()

    // Validate input
    const validationResult = registerSchema.safeParse({
      email,
      password,
      displayName: display_name,
      customSlug: custom_slug
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.getUserByEmail(email)

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      )
    }

    // Check if custom slug already exists
    if (custom_slug) {
      const existingSlug = await db.getUserBySlug(custom_slug)

      if (existingSlug) {
        return NextResponse.json(
          { error: 'Slug sudah digunakan oleh user lain' },
          { status: 409 }
        )
      }
    }

    // Generate custom slug if not provided
    let finalSlug = custom_slug
    if (!finalSlug) {
      finalSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    }

    // Hash password before storing
    const passwordHash = await bcrypt.hash(password, 10)
    console.log('[v0] Password hashed for admin user creation by admin:', session.userId)

    // Create new user with settings
    const userId = crypto.randomUUID()
    const newUser = await db.createUserWithSettings({
      id: userId,
      email,
      password_hash: passwordHash,
      display_name: display_name || email.split('@')[0],
      custom_slug: finalSlug
    }, is_admin)

    if (!newUser) {
      return NextResponse.json(
        { error: 'Gagal membuat user baru' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      user: {
        ...newUser,
        is_admin: is_admin || false
      }
    }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error in users POST by admin:', session.userId)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}