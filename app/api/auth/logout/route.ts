import { NextResponse } from 'next/server'
import { clearUserSession, clearAdminSession } from '@/lib/auth'

export async function POST() {
  // Clear both user and admin session cookies
  await clearUserSession()
  await clearAdminSession()

  return NextResponse.json({ success: true })
}
