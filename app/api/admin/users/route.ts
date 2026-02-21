import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
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
    const search = searchParams.get('search')

    // Get all users with their admin status
    let query = supabase
      .from('users')
      .select(`
        *,
        admin_users (
          user_id
        )
      `)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('email', `%${search}%`)
    }

    const { data: users, error } = await query

    if (error) {
      console.error('[v0] Error fetching users by admin:', session.userId)
      return NextResponse.json(
        { error: 'Gagal mengambil data user' },
        { status: 500 }
      )
    }

    // Add is_admin flag to each user
    const usersWithAdminStatus = users.map(user => {
      const isAdmin = !!(user.admin_users)
      return {
        ...user,
        is_admin: isAdmin
      }
    })

    return NextResponse.json({ users: usersWithAdminStatus })
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
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      )
    }

    // Generate custom slug if not provided
    let finalSlug = custom_slug
    if (!finalSlug) {
      finalSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    }

    // Hash password before storing
    const passwordHash = await bcrypt.hash(password, 10)
    console.log('[v0] Password hashed for admin user creation by admin:', session.userId)

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        display_name: display_name || email.split('@')[0],
        custom_slug: finalSlug
      })
      .select()
      .single()

    if (createError) {
      console.error('[v0] Error creating user by admin:', session.userId)
      return NextResponse.json(
        { error: 'Gagal membuat user baru' },
        { status: 500 }
      )
    }

    // Create user settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: newUser.id,
        theme_color: '#2563eb',
        show_categories: true
      })

    if (settingsError) {
      console.error('[v0] Error creating user settings by admin:', session.userId)
    }

    // Add to admin_users if requested
    if (is_admin) {
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({ user_id: newUser.id })

      if (adminError) {
        console.error('[v0] Error adding user to admin by admin:', session.userId)
      }
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