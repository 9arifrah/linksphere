import { DatabaseClient } from './db-types'
import { sqliteClient } from './db-sqlite'

// Database type from environment
const DB_TYPE = process.env.DB_TYPE || 'supabase'

let dbClient: DatabaseClient

export function getDatabaseClient(): DatabaseClient {
  if (!dbClient) {
    if (DB_TYPE === 'supabase') {
      // Import Supabase client dynamically
      const { supabase } = require('./supabase')
      const { supabaseClient } = require('./db-supabase')
      dbClient = supabaseClient
    } else {
      // Default to SQLite
      dbClient = sqliteClient
    }
  }
  return dbClient
}

// Export singleton instance
export const db = getDatabaseClient()

// Re-export types
export * from './db-types'
export * from './supabase'
