import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserSession } from '@/lib/auth'
import { linkSchema } from '@/lib/validation'

// POST create new link
export async function POST(request: NextRequest) {
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
    const { category_id, is_active, is_public, user_id } = body

    // Validate input with Zod
    try {
      linkSchema.parse(body)
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
    }

    // Verify user_id matches session
    if (user_id && user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { data: newLink, error } = await supabase
      .from('links')
      .insert({
        title: body.title,
        url: body.url,
        description: body.description,
        category_id,
        is_active: is_active ?? true,
        is_public: is_public ?? true,
        user_id: userId
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Gagal membuat link baru' },
        { status: 500 }
      )
    }

    return NextResponse.json({ link: newLink }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error in links POST')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
