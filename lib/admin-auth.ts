import { supabase } from '@/lib/supabase'
import { getAdminSession, type SessionPayload } from './auth'

/**
 * Verify user is actually an admin by checking admin_users table
 */
export async function verifyAdminAccess(userId: string): Promise<boolean> {
  try {
    const { data: adminCheck } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .single()

    return !!adminCheck
  } catch (error) {
    console.error('[v0] Admin verification failed')
    return false
  }
}

/**
 * Get admin session with database verification
 * This is the secure way to check admin access in API routes
 */
export async function getVerifiedAdminSession(): Promise<SessionPayload | null> {
  // Get admin session (already handles JWT verification)
  const payload = await getAdminSession()

  if (!payload) {
    return null
  }

  // Verify in database for extra security
  const isAdmin = await verifyAdminAccess(payload.userId)

  if (!isAdmin) {
    return null
  }

  return payload
}

/**
 * Helper for API routes to get admin ID or return unauthorized
 */
export async function requireAdminAuth(): Promise<string | null> {
  const session = await getVerifiedAdminSession()

  if (!session) {
    return null
  }

  return session.userId
}
