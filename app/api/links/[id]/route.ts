import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserSession } from '@/lib/auth'
import { linkSchema } from '@/lib/validation'

// PATCH update link
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.userId
    const body = await request.json()

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

    // First verify the link belongs to this user
    const { data: existingLink } = await supabase
      .from('links')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existingLink || existingLink.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Build update data
    const updateData: Record<string, any> = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.url !== undefined) updateData.url = body.url
    if (body.description !== undefined) updateData.description = body.description
    if (body.category_id !== undefined) updateData.category_id = body.category_id
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    if (body.is_public !== undefined) updateData.is_public = body.is_public

    const { data: updatedLink, error } = await supabase
      .from('links')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Gagal mengupdate link' },
        { status: 500 }
      )
    }

    return NextResponse.json({ link: updatedLink })
  } catch (error) {
    console.error('[v0] Error in links PATCH')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.userId

    // First verify the link belongs to this user
    const { data: existingLink } = await supabase
      .from('links')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existingLink || existingLink.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Gagal menghapus link' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in links DELETE')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
