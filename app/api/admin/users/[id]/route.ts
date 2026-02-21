import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
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

    // Check if email already exists for other users
    const { data: existingUser } = await supabase
      .from('users')
      .select('email, id')
      .eq('email', email)
      .neq('id', id)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah digunakan oleh user lain' },
        { status: 409 }
      )
    }

    // Build update data for users table
    const updateData: { 
      email: string
      password_hash?: string
      display_name?: string
      custom_slug?: string
    } = { email }
    
    if (password) {
      // Hash password before updating
      const passwordHash = await bcrypt.hash(password, 10)
      updateData.password_hash = passwordHash
      console.log('[v0] Password hashed for admin user update by admin:', session.userId)
    }
    if (display_name) {
      updateData.display_name = display_name
    }
    if (custom_slug) {
      updateData.custom_slug = custom_slug
    }

    // Update user in users table
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('[v0] Error updating user by admin:', session.userId)
      return NextResponse.json(
        { error: 'Gagal mengupdate user' },
        { status: 500 }
      )
    }

    // Handle admin status update
    if (is_admin !== undefined) {
      if (is_admin) {
        // Check if already in admin_users
        const { data: existingAdmin } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', id)
          .single()

        if (!existingAdmin) {
          // Add to admin_users
          const { error: insertError } = await supabase
            .from('admin_users')
            .insert({ user_id: id })

          if (insertError) {
            console.error('[v0] Error adding admin role by admin:', session.userId)
          }
        }
      } else {
        // Remove from admin_users
        const { error: deleteError } = await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', id)

        if (deleteError) {
          console.error('[v0] Error removing admin role by admin:', session.userId)
        }
      }
    }

    // Get updated admin status
    const { data: adminCheck } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', id)
      .single()

    return NextResponse.json({
      user: {
        ...updatedUser,
        is_admin: !!adminCheck
      }
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

    // Delete from admin_users first (will cascade to users table)
    const { error: adminError } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', id)

    if (adminError) {
      console.error('[v0] Error deleting from admin_users by admin:', session.userId)
    }

    // Delete from users table (this will cascade to user_settings)
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (userError) {
      console.error('[v0] Error deleting user by admin:', session.userId)
      return NextResponse.json(
        { error: 'Gagal menghapus user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in users DELETE by admin:', session.userId)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
