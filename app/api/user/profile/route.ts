import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserSession } from '@/lib/auth'

// PATCH update user profile
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserSession()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { display_name, custom_slug } = body

    // Check if custom_slug is already taken by another user
    if (custom_slug) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('custom_slug', custom_slug)
        .neq('id', userId)
        .single()

      if (existingUser) {
        return NextResponse.json(
          { error: 'Slug sudah digunakan oleh user lain' },
          { status: 409 }
        )
      }
    }

    // Build update data (only include fields that should be updated)
    const updateData: any = {}
    if (display_name !== undefined) updateData.display_name = display_name
    if (custom_slug !== undefined) updateData.custom_slug = custom_slug

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('[v0] Error updating user profile:', error)
      return NextResponse.json(
        { error: 'Gagal mengupdate profil' },
        { status: 500 }
      )
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('[v0] Error in user profile PATCH:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}