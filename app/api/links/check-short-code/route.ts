import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { shortCodeSchema, RESERVED_SHORT_CODES } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const excludeId = searchParams.get('exclude')

    if (!code) {
      return NextResponse.json(
        { error: 'Short code wajib diisi' },
        { status: 400 }
      )
    }

    // Validate format
    try {
      shortCodeSchema.parse(code)
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Format short code tidak valid' },
        { status: 400 }
      )
    }

    // Check reserved words
    if (RESERVED_SHORT_CODES.includes(code)) {
      return NextResponse.json(
        { error: 'Short code ini sudah digunakan oleh sistem' },
        { status: 409 }
      )
    }

    // Check duplicate
    const exists = await db.isShortCodeExists(code, excludeId || undefined)
    if (exists) {
      return NextResponse.json(
        { error: 'Short code sudah digunakan' },
        { status: 409 }
      )
    }

    return NextResponse.json({ available: true })
  } catch (error) {
    console.error('[v0] Error checking short code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
