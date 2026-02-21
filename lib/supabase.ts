import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
