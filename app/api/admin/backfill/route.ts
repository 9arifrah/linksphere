import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { generateQRCode } from '@/lib/qr-code'

/**
 * POST /api/admin/backfill
 * Backfill short_code and/or qr_code for existing links that don't have them.
 * This is a one-time admin operation for data migration.
 * 
 * Body: { type: 'short_code' | 'qr_code' | 'all' }
 */
export async function POST(request: NextRequest) {
  const session = await getVerifiedAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { type = 'all' } = await request.json().catch(() => ({}))

    let shortCodesGenerated = 0
    let qrCodesGenerated = 0
    let errors = 0

    // Get all links
    const links = await db.adminGetAllLinks()

    for (const link of (links as any[])) {
      try {
        // Generate short_code if missing
        if ((type === 'all' || type === 'short_code') && !link.short_code) {
          try {
            const shortCode = await db.generateShortCode(6)
            await db.adminUpdateLink(link.id, { short_code: shortCode })
            shortCodesGenerated++
            console.log(`[backfill] Link "${link.title}" (${link.id}): short_code = ${shortCode}`)
          } catch (err: any) {
            // If unique constraint violation, try with longer code
            if (err?.message?.includes('duplicate') || err?.message?.includes('unique') || err?.code === '23505') {
              try {
                const shortCode = await db.generateShortCode(8)
                await db.adminUpdateLink(link.id, { short_code: shortCode })
                shortCodesGenerated++
                console.log(`[backfill] Link "${link.title}" (${link.id}): short_code = ${shortCode} (8 chars, retry)`)
              } catch (retryErr) {
                console.error(`[backfill] Failed short_code for link ${link.id} (retry):`, retryErr)
                errors++
              }
            } else {
              console.error(`[backfill] Failed short_code for link ${link.id}:`, err)
              errors++
            }
          }
        }

        // Generate qr_code if missing
        if ((type === 'all' || type === 'qr_code') && !link.qr_code && link.url) {
          try {
            const qrCode = await generateQRCode(link.url)
            await db.adminUpdateLink(link.id, { qr_code: qrCode })
            qrCodesGenerated++
            console.log(`[backfill] Link "${link.title}" (${link.id}): QR code generated`)
          } catch (err) {
            console.error(`[backfill] Failed QR code for link ${link.id}:`, err)
            errors++
          }
        }
      } catch (err) {
        console.error(`[backfill] Error processing link ${link.id}:`, err)
        errors++
      }
    }

    console.log(`[backfill] Complete: ${shortCodesGenerated} short codes, ${qrCodesGenerated} QR codes, ${errors} errors`)

    return NextResponse.json({
      success: true,
      totalLinks: links.length,
      shortCodesGenerated,
      qrCodesGenerated,
      errors
    })
  } catch (error) {
    console.error('[backfill] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}