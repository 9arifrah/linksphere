import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'
import { db } from '@/lib/db'

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
    const stats = await db.getUserStats(userId)

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('[v0] Error in user stats GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
