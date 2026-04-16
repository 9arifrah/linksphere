// Database abstraction layer
// Lazy initialization with dynamic imports to avoid bundling
// native modules (better-sqlite3) on serverless environments like Vercel

import type { DatabaseClient } from './db-types'

// Database type from environment - defaults to supabase for production
const DB_TYPE = process.env.DB_TYPE || 'supabase'

let dbClient: DatabaseClient | undefined = undefined

/**
 * Get the database client synchronously.
 * On first call, initializes the appropriate client based on DB_TYPE.
 * Uses dynamic require to avoid bundling better-sqlite3 on serverless.
 */
export function getDb(): DatabaseClient {
  if (dbClient) return dbClient

  if (DB_TYPE === 'supabase') {
    // Dynamic require for CommonJS compatibility in Next.js API routes
    // This ensures better-sqlite3 is NOT loaded when using Supabase
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabaseClient } = require('./db-supabase') as { supabaseClient: DatabaseClient }
    dbClient = supabaseClient
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { sqliteClient } = require('./db-sqlite') as { sqliteClient: DatabaseClient }
    dbClient = sqliteClient
  }

  return dbClient
}

// Lazy-initialized db object that defers actual import until first use
// This allows `import { db } from '@/lib/db'` to work while avoiding
// bundling better-sqlite3 on Vercel serverless
export const db: DatabaseClient = new Proxy({} as DatabaseClient, {
  get(_target, prop) {
    const client = getDb()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return value.bind(client)
    }
    return value
  }
})

// Re-export types
export type { DatabaseClient } from './db-types'
export type { Category, Link, User, UserSettings, Admin } from './supabase'