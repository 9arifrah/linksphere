import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { categorySchema, formatZodError } from '@/lib/validation'

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

    // First verify the category belongs to this user
    const existingCategory = await db.getCategoryById(id)

    if (!existingCategory || existingCategory.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = categorySchema.partial().safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: formatZodError(validationResult.error) },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: Record<string, any> = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.icon !== undefined) updateData.icon = body.icon
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order

    const updatedCategory = await db.updateCategory(id, updateData, userId)

    if (!updatedCategory) {
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
    const existingCategory = await db.getCategoryById(id)

    if (!existingCategory || existingCategory.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await db.deleteCategory(id, userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in categories DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}