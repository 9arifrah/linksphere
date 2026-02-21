// Simple in-memory rate limiter
// For production, consider using Upstash Redis or similar

class MemoryRatelimit {
  private requests: Map<string, number[]> = new Map()
  private readonly cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up old entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Check if request should be rate limited
   * @param identifier Unique identifier (IP, user ID, etc.)
   * @param limit Max requests allowed
   * @param window Time window in milliseconds
   */
  limit(identifier: string, limit: number = 10, window: number = 60000) {
    const now = Date.now()
    const key = identifier

    if (!this.requests.has(key)) {
      this.requests.set(key, [])
    }

    const timestamps = this.requests.get(key)!

    // Remove old timestamps outside window
    const validTimestamps = timestamps.filter(t => now - t < window)
    this.requests.set(key, validTimestamps)

    if (validTimestamps.length >= limit) {
      return { success: false, reset: validTimestamps[0] + window }
    }

    // Add current timestamp
    validTimestamps.push(now)
    return { success: true }
  }

  /**
   * Clean up old entries to prevent memory leaks
   */
  private cleanup() {
    const now = Date.now()
    const maxWindow = 3600000 // 1 hour

    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(t => now - t < maxWindow)

      if (validTimestamps.length === 0) {
        this.requests.delete(key)
      } else {
        this.requests.set(key, validTimestamps)
      }
    }
  }

  /**
   * Clear all rate limits (useful for testing)
   */
  clear() {
    this.requests.clear()
  }

  /**
   * Destroy the rate limiter and cleanup interval
   */
  destroy() {
    clearInterval(this.cleanupInterval)
    this.requests.clear()
  }
}

// Singleton instance
const ratelimit = new MemoryRatelimit()

/**
 * Check rate limit for IP address
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60000
): Promise<{ success: boolean; reset?: number }> {
  const result = ratelimit.limit(identifier, limit, window)

  if (!result.success) {
    return {
      success: false,
      reset: result.reset
    }
  }

  return { success: true }
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  // Try various headers for IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return '127.0.0.1' // Fallback
}

/**
 * Rate limiting middleware helper
 * Returns error response if rate limited, null if OK
 */
export async function rateLimitMiddleware(
  request: Request,
  identifier?: string,
  limit: number = 10,
  window: number = 60000
): Promise<Response | null> {
  const ip = identifier || getClientIp(request)
  const result = await checkRateLimit(ip, limit, window)

  if (!result.success) {
    const resetAt = result.reset ? new Date(result.reset).toUTCString() : undefined

    return new Response(
      JSON.stringify({
        error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.'
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Reset': resetAt || '',
          'Retry-After': Math.ceil(((result.reset || 0) - Date.now()) / 1000).toString()
        }
      }
    )
  }

  return null
}
