import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { categorySchema } from '@/lib/validation'

export async function GET() {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch categories
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')

    if (error) {
      console.error('[v0] Error fetching categories by admin:', session.userId)
      return NextResponse.json(
        { error: 'Gagal mengambil kategori' },
        { status: 500 }
      )
    }

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

    // Insert category
    const { data: category, error } = await supabase
      .from('categories')
      .insert([
        {
          name,
          icon,
          description: description || null,
          sort_order: sort_order || 0,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('[v0] Error creating category by admin:', session.userId)
      return NextResponse.json(
        { error: 'Gagal membuat kategori' },
        { status: 500 }
      )
    }

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
    const { data: category, error } = await supabase
      .from('categories')
      .update({
        name,
        icon,
        description: description || null,
        sort_order: sort_order || 0,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[v0] Error updating category by admin:', session.userId)
      return NextResponse.json(
        { error: 'Gagal memperbarui kategori' },
        { status: 500 }
      )
    }

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

    // Delete category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[v0] Error deleting category by admin:', session.userId)
      return NextResponse.json(
        { error: 'Gagal menghapus kategori' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[v0] Error in DELETE /api/admin/categories by admin:', session?.userId || 'unknown')
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}