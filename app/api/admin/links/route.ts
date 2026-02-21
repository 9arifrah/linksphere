import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { linkSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate input
    const validationResult = linkSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, url, category_id, is_public } = validationResult.data

    const { data, error } = await supabase
      .from('links')
      .insert({
        title,
        url,
        category_id,
        is_public
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error creating link by admin:', session.userId)
      return NextResponse.json({ error: 'Failed to create link' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[v0] Error in POST /api/admin/links by admin:', session.userId)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate input
    const validationResult = linkSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { id, title, url, category_id, is_public } = { ...body, ...validationResult.data }

    if (!id) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('links')
      .update({
        title,
        url,
        category_id,
        is_public,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[v0] Error updating link by admin:', session.userId)
      return NextResponse.json({ error: 'Failed to update link' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[v0] Error in PUT /api/admin/links by admin:', session.userId)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await request.json()

    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[v0] Error deleting link by admin:', session.userId)
      return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in DELETE /api/admin/links by admin:', session.userId)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
