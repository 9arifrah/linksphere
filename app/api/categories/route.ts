import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserSession } from '@/lib/auth'
import { categorySchema } from '@/lib/validation'

// POST create new category
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
    const { name, icon, sort_order } = body

    // Validate input
    const validationResult = categorySchema.safeParse({ name, icon })
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert({
        name,
        icon,
        sort_order: sort_order || 0,
        user_id: userId
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error creating category for user:', userId)
      return NextResponse.json(
        { error: 'Gagal membuat kategori baru' },
        { status: 500 }
      )
    }

    return NextResponse.json({ category: newCategory }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error in categories POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}