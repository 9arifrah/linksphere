import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

function createMockSupabaseClient(): SupabaseClient {
  // Create a mock client that always returns empty results
  const mockClient = {
    from: () => ({
      select: () => ({
        order: () => ({
          eq: () => ({ data: [], error: null }),
          data: [],
          error: null,
          then: (cb: any) => cb({ data: [], error: null }),
        }),
        data: [],
        error: null,
        then: (cb: any) => cb({ data: [], error: null }),
      }),
      insert: () => ({
        select: () => ({
          single: () => ({ data: null, error: { message: 'Database not configured' } }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({ data: null, error: { message: 'Database not configured' } }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => ({ error: { message: 'Database not configured' } }),
      }),
    }),
  } as unknown as SupabaseClient

  return mockClient
}

export function getSupabaseClient(): SupabaseClient {
  // Only create Supabase client if using Supabase
  const DB_TYPE = process.env.DB_TYPE || 'sqlite'

  if (DB_TYPE !== 'supabase') {
    // Return mock client for SQLite mode
    if (!supabaseInstance) {
      supabaseInstance = createMockSupabaseClient()
    }
    return supabaseInstance
  }

  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('[Supabase] Missing credentials, using mock client')
      supabaseInstance = createMockSupabaseClient()
    } else {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
    }
  }

  return supabaseInstance
}

// Export supabase client (never null now)
export const supabase = getSupabaseClient()

export type Category = {
  id: string
  name: string
  icon: string
  sort_order: number
  created_at: string
  user_id?: string | null
  links?: any[]
}

export type Link = {
  id: string
  title: string
  url: string
  category_id: string
  is_active: boolean
  is_public: boolean
  click_count: number
  created_at: string
  updated_at: string
  user_id?: string | null
  category?: Category
  qr_code: string | null
  short_code?: string | null
}

export type User = {
  id: string
  email: string
  password_hash: string
  custom_slug?: string | null
  display_name?: string | null
  created_at: string
}

export type UserSettings = {
  user_id: string
  profile_description?: string | null
  theme_color: string
  logo_url?: string | null
  page_title?: string | null
  show_categories: boolean
  created_at: string
  updated_at: string
}

export type Admin = {
  id: string
  username: string
  email: string
  created_at: string
}
