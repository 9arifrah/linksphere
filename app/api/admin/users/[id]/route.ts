import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { emailSchema } from '@/lib/validation'

// PUT update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Await params to get id
    const { id } = await params

    const { email, password, display_name, custom_slug, is_admin } = await request.json()

    // Validate email
    const validationResult = emailSchema.safeParse(email)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await db.getUserById(id)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if email already exists for other users
    if (email !== existingUser.email) {
      const emailCheck = await db.getUserByEmail(email)
      if (emailCheck && emailCheck.id !== id) {
        return NextResponse.json(
          { error: 'Email sudah digunakan oleh user lain' },
          { status: 409 }
        )
      }
    }

    // Check if custom slug already exists for other users
    if (custom_slug && custom_slug !== existingUser.custom_slug) {
      const slugCheck = await db.getUserBySlug(custom_slug)
      if (slugCheck && slugCheck.id !== id) {
        return NextResponse.json(
          { error: 'Slug sudah digunakan oleh user lain' },
          { status: 409 }
        )
      }
    }

    // Build update data
    const updateData: any = { email }
    if (password) {
      // Hash password before updating
      updateData.password_hash = await bcrypt.hash(password, 10)
      console.log('[v0] Password hashed for admin user update by admin:', session.userId)
    }
    if (display_name) {
      updateData.display_name = display_name
    }
    if (custom_slug !== undefined) {
      updateData.custom_slug = custom_slug
    }

    // Update user
    const updatedUser = await db.adminUpdateUser(id, updateData, is_admin)

    return NextResponse.json({
      user: updatedUser
    })
  } catch (error) {
    console.error('[v0] Error in users PUT by admin:', session.userId)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Await params to get id
    const { id } = await params

    await db.adminDeleteUser(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in users DELETE by admin:', session.userId)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}