import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { linkSchema, formatZodError } from '@/lib/validation'
import { db } from '@/lib/db'
import { generateQRCode } from '@/lib/qr-code'

// GET all user links
export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.userId
    const links = await db.getLinks(userId)

    return NextResponse.json({ links })
  } catch (error) {
    console.error('[v0] Error in links GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Validate input with Zod
    const validationResult = linkSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: formatZodError(validationResult.error) },
        { status: 400 }
      )
    }

    const { category_id, is_active, is_public, short_code } = validationResult.data

    // Verify user_id matches session (if provided)
    if (body.user_id && body.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Generate QR code for the link
    let qrCode: string | null = null
    try {
      qrCode = await generateQRCode(body.url)
    } catch (error) {
      // Log error but continue - QR code is optional
      console.error('[v0] QR code generation failed for link:', error)
    }

    // Generate short code (auto) if not provided
    let finalShortCode = short_code || null
    if (!finalShortCode) {
      try {
        finalShortCode = await db.generateShortCode()
      } catch (error) {
        console.error('[v0] Short code generation failed:', error)
        // Continue without short code if generation fails
      }
    } else {
      // Validate custom short code is not duplicate
      const exists = await db.isShortCodeExists(finalShortCode)
      if (exists) {
        return NextResponse.json(
          { error: 'Short code sudah digunakan' },
          { status: 409 }
        )
      }
    }

    const newLink = await db.createLink({
      id: crypto.randomUUID(),
      title: body.title,
      url: body.url,
      description: body.description || null,
      category_id: category_id || null,
      is_public: is_public ?? true,
      is_active: is_active ?? true,
      qr_code: qrCode,
      short_code: finalShortCode,
      user_id: userId
    })

    if (!newLink) {
      return NextResponse.json(
        { error: 'Gagal membuat link baru' },
        { status: 500 }
      )
    }

    return NextResponse.json({ link: newLink }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error in links POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}