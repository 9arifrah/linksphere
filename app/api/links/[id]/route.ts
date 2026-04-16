import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/auth'
import { linkSchema, formatZodError } from '@/lib/validation'
import { generateQRCode } from '@/lib/qr-code'

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

    // Validate input with Zod - handle form "on" value
    const processedBody = { ...body }
    
    // Convert "on" string from switch component to boolean
    if (processedBody.is_active === 'on') processedBody.is_active = true
    if (processedBody.is_active === 'off' || processedBody.is_active === '') processedBody.is_active = false
    if (processedBody.is_public === 'on') processedBody.is_public = true
    if (processedBody.is_public === 'off' || processedBody.is_public === '') processedBody.is_public = false
    // Convert empty string category_id to undefined
    if (processedBody.category_id === '') processedBody.category_id = null

    const validationResult = linkSchema.partial().safeParse(processedBody)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: formatZodError(validationResult.error) },
        { status: 400 }
      )
    }

    // First verify the link exists and belongs to this user
    const existingLink = await db.getLinkById(id)

    if (!existingLink || existingLink.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Validate short code uniqueness if provided
    if (processedBody.short_code) {
      const exists = await db.isShortCodeExists(processedBody.short_code, id)
      if (exists) {
        return NextResponse.json(
          { error: 'Short code sudah digunakan' },
          { status: 409 }
        )
      }
    }

    // Regenerate QR code if URL changed
    if (processedBody.url && processedBody.url !== existingLink.url) {
      try {
        const qrCode = await generateQRCode(processedBody.url)
        processedBody.qr_code = qrCode
      } catch (error) {
        // Log error but continue - QR code is optional
        console.error('[v0] QR code regeneration failed for link:', error)
      }
    }

    // Update link
    const updatedLink = await db.updateLink(id, processedBody, userId)

    if (!updatedLink) {
      return NextResponse.json(
        { error: 'Gagal mengupdate link' },
        { status: 500 }
      )
    }

    return NextResponse.json({ link: updatedLink })
  } catch (error) {
    console.error('[v0] Error in links PATCH:', error)
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

    // First verify the link exists and belongs to this user
    const existingLink = await db.getLinkById(id)

    if (!existingLink || existingLink.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await db.deleteLink(id, userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in links DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}