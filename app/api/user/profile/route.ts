import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { RESERVED_SLUGS, slugSchema, formatZodError } from '@/lib/validation'

// GET user profile
export async function GET() {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.userId
    const user = await db.getUserById(userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        custom_slug: user.custom_slug
      }
    })
  } catch (error) {
    console.error('[v0] Error in user profile GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH update user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.userId
    const body = await request.json()
    const { display_name, custom_slug } = body

    // Validate reserved slugs
    if (custom_slug && RESERVED_SLUGS.includes(custom_slug)) {
      return NextResponse.json(
        { error: 'Slug ini tidak dapat digunakan' },
        { status: 400 }
      )
    }

    // Validate slug format
    if (custom_slug) {
      const slugResult = slugSchema.safeParse(custom_slug)
      if (!slugResult.success) {
        return NextResponse.json(
          { error: formatZodError(slugResult.error) },
          { status: 400 }
        )
      }

      // Check if custom_slug is already taken by another user
      const existingUser = await db.getUserBySlug(custom_slug)
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: 'Slug sudah digunakan oleh user lain' },
          { status: 409 }
        )
      }
    }

    // Build update data
    const updateData: Record<string, any> = {}
    if (display_name !== undefined) updateData.display_name = display_name
    if (custom_slug !== undefined) updateData.custom_slug = custom_slug

    const updatedUser = await db.updateUser(userId, updateData)

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Gagal mengupdate profil' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        display_name: updatedUser.display_name,
        custom_slug: updatedUser.custom_slug
      }
    })
  } catch (error) {
    console.error('[v0] Error in user profile PATCH:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}