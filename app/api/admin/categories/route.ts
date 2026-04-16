import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { categorySchema } from '@/lib/validation'

export async function GET() {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const categories = await db.adminGetAllCategories()

    return NextResponse.json({
      success: true,
      categories,
    })
  } catch (err) {
    console.error('[v0] Error in GET /api/admin/categories by admin:', session.userId)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate input
    const validationResult = categorySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, icon, description, sort_order } = body

    // Create category
    const category = await db.adminCreateCategory({
      id: crypto.randomUUID(),
      name,
      icon,
      description: description || null,
      sort_order: sort_order || 0
    })

    return NextResponse.json({
      success: true,
      category,
    })
  } catch (err) {
    console.error('[v0] Error in POST /api/admin/categories by admin:', session.userId)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate input
    const validationResult = categorySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { id, name, icon, description, sort_order } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID kategori harus diisi' },
        { status: 400 }
      )
    }

    // Update category
    const category = await db.adminUpdateCategory(id, {
      name,
      icon,
      description: description || null,
      sort_order: sort_order || 0
    })

    return NextResponse.json({
      success: true,
      category,
    })
  } catch (err) {
    console.error('[v0] Error in PUT /api/admin/categories by admin:', session.userId)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID kategori harus diisi' },
        { status: 400 }
      )
    }

    await db.adminDeleteCategory(id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[v0] Error in DELETE /api/admin/categories by admin:', session?.userId || 'unknown')
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}