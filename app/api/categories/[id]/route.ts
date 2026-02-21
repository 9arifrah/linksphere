import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserSession } from '@/lib/auth'

// PATCH update category
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
    const { name, icon, sort_order } = body

    // First verify the category belongs to this user
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existingCategory || existingCategory.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Build update data
    const updateData: any = { id }
    if (name !== undefined) updateData.name = name
    if (icon !== undefined) updateData.icon = icon
    if (sort_order !== undefined) updateData.sort_order = sort_order

    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[v0] Error updating category for user:', userId)
      return NextResponse.json(
        { error: 'Gagal mengupdate kategori' },
        { status: 500 }
      )
    }

    return NextResponse.json({ category: updatedCategory })
  } catch (error) {
    console.error('[v0] Error in categories PATCH:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE category
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

    // First verify the category belongs to this user
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existingCategory || existingCategory.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[v0] Error deleting category for user:', userId)
      return NextResponse.json(
        { error: 'Gagal menghapus kategori' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in categories DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}