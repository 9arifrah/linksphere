import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { userSettingsSchema } from '@/lib/validation'
import { db } from '@/lib/db'

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

    const settings = await db.getUserSettings(userId)

    if (!settings) {
      return NextResponse.json({ settings: null })
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
    const existingSettings = await db.getUserSettings(userId)

    const updateData: any = {}
    if (theme_color !== undefined) updateData.theme_color = theme_color
    if (logo_url !== undefined) updateData.logo_url = finalLogoUrl
    if (page_title !== undefined) updateData.page_title = page_title
    if (show_categories !== undefined) updateData.show_categories = show_categories
    if (profile_description !== undefined) updateData.profile_description = profile_description

    let settings
    if (existingSettings) {
      // Update existing settings
      settings = await db.updateUserSettings(userId, updateData)
    } else {
      // Insert new settings
      settings = await db.createUserSettings({
        id: crypto.randomUUID(),
        user_id: userId,
        theme_color: theme_color || '#2563eb',
        logo_url: finalLogoUrl,
        page_title,
        show_categories: show_categories ?? true,
        profile_description: profile_description || null
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('[v0] Error in user settings PATCH:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
