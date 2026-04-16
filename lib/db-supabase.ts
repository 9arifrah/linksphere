import { supabase } from './supabase'
import { DatabaseClient } from './db-types'

export const supabaseClient: DatabaseClient = {
  // Users
  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    return error ? null : data
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    return error ? null : data
  },

  async getUserBySlug(slug: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('custom_slug', slug)
      .single()
    return error ? null : data
  },

  async createUser(user: any) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()
    return error ? null : data
  },

  async updateUser(id: string, userData: any) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single()
    return error ? null : data
  },

  async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    return error ? [] : data || []
  },

  // User Settings
  async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    return error ? null : data
  },

  async createUserSettings(settings: any) {
    const { data, error } = await supabase
      .from('user_settings')
      .insert(settings)
      .select()
      .single()
    return error ? null : data
  },

  async updateUserSettings(userId: string, settingsData: any) {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settingsData)
      .eq('user_id', userId)
      .select()
      .single()
    return error ? null : data
  },

  // Links
  async getLinks(userId?: string) {
    let query = supabase
      .from('links')
      .select('*, categories(name, icon)')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query
    return error ? [] : data || []
  },

  async getLinkById(id: string) {
    const { data, error } = await supabase
      .from('links')
      .select('*, categories(name, icon)')
      .eq('id', id)
      .single()
    return error ? null : data
  },

  async getLinkByShortCode(shortCode: string) {
    const { data, error } = await supabase
      .from('links')
      .select(`
        *,
        category:categories(id, name, icon)
      `)
      .eq('short_code', shortCode.toLowerCase())
      .single()

    if (error || !data) {
      return null
    }

    return {
      ...data,
      is_public: Boolean(data.is_public),
      is_active: Boolean(data.is_active)
    }
  },

  async isShortCodeExists(shortCode: string, excludeLinkId?: string) {
    let query = supabase
      .from('links')
      .select('id', { count: 'exact', head: true })
      .eq('short_code', shortCode.toLowerCase())

    if (excludeLinkId) {
      query = query.neq('id', excludeLinkId)
    }

    const { count, error } = await query

    return !error && (count || 0) > 0
  },

  async generateShortCode(length: number = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      let code = ''
      for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }

      const exists = await this.isShortCodeExists(code)
      if (!exists) {
        return code
      }

      attempts++
    }

    if (length < 10) {
      return this.generateShortCode(length + 1)
    }

    throw new Error('Gagal generate short code yang unik')
  },

  async createLink(link: any) {
    const { data, error } = await supabase
      .from('links')
      .insert({
        id: link.id,
        title: link.title,
        url: link.url,
        description: link.description,
        category_id: link.category_id,
        is_public: link.is_public,
        is_active: link.is_active ?? true,
        qr_code: link.qr_code,
        short_code: link.short_code,
        user_id: link.user_id
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  async updateLink(id: string, data: any, userId: string) {
    // Validasi tidak bisa hapus short code
    if (data.short_code === null || data.short_code === '') {
      const existing = await this.getLinkById(id)
      if (existing && existing.short_code) {
        throw new Error('Tidak bisa menghapus short code yang sudah ada')
      }
    }

    const updateData: any = {}
    const allowedFields = ['title', 'url', 'description', 'category_id', 'is_public', 'is_active', 'qr_code', 'short_code']

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    updateData.updated_at = new Date().toISOString()

    const { data: result, error } = await supabase
      .from('links')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return result
  },

  async deleteLink(id: string, userId: string) {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
  },

  async incrementClickCount(id: string) {
    // Use RPC function for thread-safe increment
    const { error } = await supabase.rpc('increment_click_count', { link_id: id })
    if (error) throw error
  },

  // Categories
  async getCategories(userId?: string) {
    let query = supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query
    return error ? [] : data || []
  },

  async getCategoryById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()
    return error ? null : data
  },

  async createCategory(category: any) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()
    return error ? null : data
  },

  async updateCategory(id: string, categoryData: any, userId: string) {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    return error ? null : data
  },

  async deleteCategory(id: string, userId: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
  },

  // Admin
  async getAdminUsers() {
    // First get all admin user_ids
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id')

    if (adminError || !adminData) {
      return []
    }

    const userIds = adminData.map(a => a.user_id)

    // Then get users by their IDs
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds)

    return error ? [] : data || []
  },

  async isAdminUser(userId: string) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .single()
    return !error && !!data
  },

  // Admin Link Operations (no userId restriction)
  async adminGetAllLinks() {
    const { data, error } = await supabase
      .from('links')
      .select('*, categories(name, icon)')
      .order('created_at', { ascending: false })
    return error ? [] : data || []
  },

  async adminCreateLink(link: any) {
    const { data, error } = await supabase
      .from('links')
      .insert({
        id: link.id,
        title: link.title,
        url: link.url,
        description: link.description,
        category_id: link.category_id,
        is_public: link.is_public,
        is_active: link.is_active ?? true,
        qr_code: link.qr_code,
        short_code: link.short_code,
        user_id: link.user_id
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  async adminUpdateLink(id: string, data: any) {
    const updateData: any = {}
    const allowedFields = ['title', 'url', 'description', 'category_id', 'is_public', 'is_active', 'qr_code', 'short_code', 'user_id']

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    updateData.updated_at = new Date().toISOString()

    const { data: result, error } = await supabase
      .from('links')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return result
  },

  async adminDeleteLink(id: string) {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // Admin User Management
  async getAllUsersWithAdminStatus(search?: string) {
    let query = supabase
      .from('users')
      .select(`
        *,
        admin_users (
          user_id
        )
      `)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('email', `%${search}%`)
    }

    const { data: users, error } = await query

    if (error) {
      return []
    }

    // Add is_admin flag to each user
    return users.map(user => ({
      ...user,
      is_admin: !!(user.admin_users && user.admin_users.length > 0)
    }))
  },

  async createUserWithSettings(userData: any, isAdmin: boolean = false) {
    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: userData.id,
        email: userData.email,
        password_hash: userData.password_hash,
        display_name: userData.display_name,
        custom_slug: userData.custom_slug
      })
      .select()
      .single()

    if (userError) {
      throw userError
    }

    // Create user settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        theme_color: '#2563eb',
        show_categories: true
      })

    if (settingsError) {
      console.error('[db] Error creating user settings:', settingsError)
    }

    // Add to admin_users if needed
    if (isAdmin) {
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({ user_id: user.id })

      if (adminError) {
        console.error('[db] Error adding admin role:', adminError)
      }
    }

    return {
      ...user,
      is_admin: isAdmin
    }
  },

  async adminUpdateUser(id: string, userData: any, isAdmin?: boolean) {
    const updateData: any = {}
    const allowedFields = ['email', 'password_hash', 'display_name', 'custom_slug']

    for (const field of allowedFields) {
      if (userData[field] !== undefined) {
        updateData[field] = userData[field]
      }
    }

    // Update user
    const { data: user, error: userError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (userError) {
      throw userError
    }

    // Update admin status if provided
    if (isAdmin !== undefined) {
      if (isAdmin) {
        // Check if already admin
        const { data: existingAdmin } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', id)
          .single()

        if (!existingAdmin) {
          await supabase
            .from('admin_users')
            .insert({ user_id: id })
        }
      } else {
        await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', id)
      }
    }

    // Get updated admin status
    const { data: adminCheck } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', id)
      .single()

    return {
      ...user,
      is_admin: !!adminCheck
    }
  },

  async adminDeleteUser(id: string) {
    // Delete from admin_users first
    await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', id)

    // Delete from users table (cascade will handle user_settings)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async setAdminStatus(userId: string, isAdmin: boolean) {
    if (isAdmin) {
      // Check if already admin
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .single()

      if (!existingAdmin) {
        const { error } = await supabase
          .from('admin_users')
          .insert({ user_id: userId })
        if (error) throw error
      }
    } else {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', userId)
      if (error) throw error
    }
  },

  // Admin Category Operations (global categories without userId)
  async adminGetAllCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    return error ? [] : data || []
  },

  async adminCreateCategory(category: any) {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        id: category.id,
        name: category.name,
        icon: category.icon,
        description: category.description,
        sort_order: category.sort_order || 0,
        user_id: null // Global category
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  async adminUpdateCategory(id: string, categoryData: any) {
    const updateData: any = {}
    const allowedFields = ['name', 'icon', 'description', 'sort_order']

    for (const field of allowedFields) {
      if (categoryData[field] !== undefined) {
        updateData[field] = categoryData[field]
      }
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  },

  async adminDeleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // Stats
  async getUserStats(userId: string) {
    const [linksResult, categoriesResult, clicksResult, publicLinksResult] = await Promise.all([
      supabase.from('links').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('categories').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('links').select('click_count').eq('user_id', userId),
      supabase.from('links').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_public', true)
    ])

    const totalClicks = clicksResult.data?.reduce((sum, link) => sum + (link.click_count || 0), 0) || 0

    return {
      totalLinks: linksResult.count || 0,
      totalCategories: categoriesResult.count || 0,
      totalClicks,
      publicLinks: publicLinksResult.count || 0
    }
  },

  async getPlatformStats() {
    const [usersResult, linksResult, categoriesResult, clicksResult] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('links').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('links').select('click_count')
    ])

    const totalClicks = clicksResult.data?.reduce((sum, link) => sum + (link.click_count || 0), 0) || 0

    return {
      totalUsers: usersResult.count || 0,
      totalLinks: linksResult.count || 0,
      totalClicks,
      totalCategories: categoriesResult.count || 0
    }
  }
}
