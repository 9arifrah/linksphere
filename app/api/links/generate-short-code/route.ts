import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shortCode = await db.generateShortCode()

    return NextResponse.json({ short_code: shortCode })
  } catch (error) {
    console.error('[v0] Error generating short code:', error)
    return NextResponse.json(
      { error: 'Gagal generate short code' },
      { status: 500 }
    )
  }
}
