import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserSession } from '@/lib/auth'
import { userSettingsSchema } from '@/lib/validation'

// GET user settings
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

    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('[v0] Error fetching user settings:', error)
      // Return empty settings if not found (first time user)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ settings: null })
      }
      return NextResponse.json(
        { error: 'Gagal mengambil pengaturan' },
        { status: 500 }
      )
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('[v0] Error in user settings GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH update user settings
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

    // Validate input
    const validationResult = userSettingsSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const {
      profile_description,
      page_title,
      logo_url,
      theme_color,
      show_categories
    } = validationResult.data

    // Convert empty string to null for optional fields
    const finalLogoUrl = logo_url === '' ? null : logo_url

    // Check if settings exist for user
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('user_id')
      .eq('user_id', userId)
      .single()

    let result
    if (existingSettings) {
      // Update existing settings
      const updateData: any = { user_id: userId }
      if (profile_description !== undefined) updateData.profile_description = profile_description
      if (page_title !== undefined) updateData.page_title = page_title
      if (logo_url !== undefined) updateData.logo_url = finalLogoUrl
      if (theme_color !== undefined) updateData.theme_color = theme_color
      if (show_categories !== undefined) updateData.show_categories = show_categories
      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('user_settings')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single()

      result = { data, error }
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          profile_description,
          page_title,
          logo_url: finalLogoUrl,
          theme_color: theme_color || '#2563eb',
          show_categories: show_categories ?? true
        })
        .select()
        .single()

      result = { data, error }
    }

    if (result.error) {
      console.error('[v0] Error updating user settings for user:', userId)
      return NextResponse.json(
        { error: 'Gagal mengupdate pengaturan' },
        { status: 500 }
      )
    }

    return NextResponse.json({ settings: result.data })
  } catch (error) {
    console.error('[v0] Error in user settings PATCH:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}