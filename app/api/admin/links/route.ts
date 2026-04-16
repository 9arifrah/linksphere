import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { linkSchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const links = await db.adminGetAllLinks()
    return NextResponse.json({ success: true, data: links })
  } catch (error) {
    console.error('[v0] Error in GET /api/admin/links by admin:', session.userId)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const { title, url, description, category_id, is_public, is_active, short_code } = validationResult.data

    // Admin must specify which user this link belongs to
    const user_id = body.user_id
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id wajib diisi' },
        { status: 400 }
      )
    }

    // Generate short code if not provided
    const finalShortCode = short_code || await db.generateShortCode(6)

    const link = await db.adminCreateLink({
      id: crypto.randomUUID(),
      title,
      url,
      description: description || null,
      category_id,
      is_public,
      is_active: is_active ?? true,
      short_code: finalShortCode,
      user_id
    })

    return NextResponse.json({ success: true, data: link })
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

    const link = await db.adminUpdateLink(id, {
      title,
      url,
      category_id,
      is_public
    })

    return NextResponse.json({ success: true, data: link })
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

    await db.adminDeleteLink(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in DELETE /api/admin/links by admin:', session.userId)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}