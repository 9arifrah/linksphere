import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { DatabaseClient } from './db-types'

const dbDir = path.join(process.cwd(), 'data')
const dbPath = path.join(dbDir, 'linksphere.db')

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Initialize database schema
function initializeSchema() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      custom_slug TEXT UNIQUE,
      display_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // User settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      theme_color TEXT DEFAULT '#3b82f6',
      logo_url TEXT,
      page_title TEXT,
      show_categories INTEGER DEFAULT 1,
      profile_description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      user_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Links table
  db.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      category_id TEXT,
      is_public INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      click_count INTEGER DEFAULT 0,
      qr_code TEXT,
      short_code TEXT UNIQUE,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `)

  // Admin users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      user_id TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_slug ON users(custom_slug);
    CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
    CREATE INDEX IF NOT EXISTS idx_links_category_id ON links(category_id);
    CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
    CREATE INDEX IF NOT EXISTS idx_links_is_active ON links(is_active);
    CREATE INDEX IF NOT EXISTS idx_links_is_public ON links(is_public);
    CREATE INDEX IF NOT EXISTS idx_links_qr_code ON links(qr_code) WHERE qr_code IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code) WHERE short_code IS NOT NULL;
  `)
}

// Initialize schema on import
initializeSchema()

// Helper function to convert SQLite row to JS object
function rowToObject(row: any): any {
  if (!row) return null
  return {
    ...row,
    is_public: Boolean(row.is_public),
    is_active: Boolean(row.is_active),
    show_categories: Boolean(row.show_categories)
  }
}

// SQLite Implementation
export const sqliteClient: DatabaseClient = {
  // Users
  async getUserByEmail(email: string) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
    const row = stmt.get(email)
    return rowToObject(row)
  },

  async getUserById(id: string) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
    const row = stmt.get(id)
    return rowToObject(row)
  },

  async getUserBySlug(slug: string) {
    const stmt = db.prepare('SELECT * FROM users WHERE custom_slug = ?')
    const row = stmt.get(slug)
    return rowToObject(row)
  },

  async createUser(user: any) {
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, custom_slug, display_name)
      VALUES (?, ?, ?, ?, ?)
    `)
    stmt.run(user.id, user.email, user.password_hash, user.custom_slug || null, user.display_name || null)
    return this.getUserById(user.id)
  },

  async updateUser(id: string, data: any) {
    const fields: string[] = []
    const values: any[] = []

    if (data.email !== undefined) {
      fields.push('email = ?')
      values.push(data.email)
    }
    if (data.password_hash !== undefined) {
      fields.push('password_hash = ?')
      values.push(data.password_hash)
    }
    if (data.custom_slug !== undefined) {
      fields.push('custom_slug = ?')
      values.push(data.custom_slug)
    }
    if (data.display_name !== undefined) {
      fields.push('display_name = ?')
      values.push(data.display_name)
    }

    if (fields.length > 0) {
      values.push(id)
      const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`)
      stmt.run(...values)
    }

    return this.getUserById(id)
  },

  async deleteUser(id: string) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?')
    stmt.run(id)
  },

  async getAllUsers() {
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC')
    const rows = stmt.all()
    return rows.map(rowToObject)
  },

  // User Settings
  async getUserSettings(userId: string) {
    const stmt = db.prepare('SELECT * FROM user_settings WHERE user_id = ?')
    const row = stmt.get(userId)
    return rowToObject(row)
  },

  async createUserSettings(settings: any) {
    const stmt = db.prepare(`
      INSERT INTO user_settings (id, user_id, theme_color, logo_url, page_title, show_categories, profile_description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      settings.id,
      settings.user_id,
      settings.theme_color || '#3b82f6',
      settings.logo_url || null,
      settings.page_title || null,
      settings.show_categories !== undefined ? (settings.show_categories ? 1 : 0) : 1,
      settings.profile_description || null
    )
    return this.getUserSettings(settings.user_id)
  },

  async updateUserSettings(userId: string, data: any) {
    const fields: string[] = []
    const values: any[] = []

    if (data.theme_color !== undefined) {
      fields.push('theme_color = ?')
      values.push(data.theme_color)
    }
    if (data.logo_url !== undefined) {
      fields.push('logo_url = ?')
      values.push(data.logo_url)
    }
    if (data.page_title !== undefined) {
      fields.push('page_title = ?')
      values.push(data.page_title)
    }
    if (data.show_categories !== undefined) {
      fields.push('show_categories = ?')
      values.push(data.show_categories ? 1 : 0)
    }
    if (data.profile_description !== undefined) {
      fields.push('profile_description = ?')
      values.push(data.profile_description)
    }

    if (fields.length > 0) {
      values.push(userId)
      const stmt = db.prepare(`UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = ?`)
      stmt.run(...values)
    }

    return this.getUserSettings(userId)
  },

  // Links
  async getLinks(userId?: string) {
    let query = `
      SELECT l.*, c.name as category_name, c.icon as category_icon
      FROM links l
      LEFT JOIN categories c ON l.category_id = c.id
    `
    const params: any[] = []

    if (userId) {
      query += ' WHERE l.user_id = ?'
      params.push(userId)
    }

    query += ' ORDER BY l.created_at DESC'

    const stmt = db.prepare(query)
    const rows = stmt.all(...params)
    return rows.map((row: any) => {
      const obj = rowToObject(row)
      if (obj.category_name) {
        obj.category = {
          id: row.category_id,
          name: row.category_name,
          icon: row.category_icon
        }
      }
      return obj
    })
  },

  async getLinkById(id: string) {
    const stmt = db.prepare(`
      SELECT l.*, c.name as category_name, c.icon as category_icon
      FROM links l
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE l.id = ?
    `)
    const row = stmt.get(id)
    return rowToObject(row)
  },

  async getLinkByShortCode(shortCode: string) {
    const stmt = db.prepare(`
      SELECT l.*, c.name as category_name, c.icon as category_icon
      FROM links l
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE l.short_code = ?
    `)
    const row = stmt.get(shortCode.toLowerCase())
    return rowToObject(row)
  },

  async isShortCodeExists(shortCode: string, excludeLinkId?: string): Promise<boolean> {
    let query = 'SELECT 1 FROM links WHERE short_code = ?'
    const params: any[] = [shortCode.toLowerCase()]

    if (excludeLinkId) {
      query += ' AND id != ?'
      params.push(excludeLinkId)
    }

    const stmt = db.prepare(query)
    const row = stmt.get(...params)
    return !!row
  },

  async generateShortCode(length: number = 6): Promise<string> {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      let code = ''
      for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }

      // Cek apakah code sudah ada
      const exists = await this.isShortCodeExists(code)
      if (!exists) {
        return code
      }

      attempts++
    }

    // Jika setelah maxAttempts masih gagal, coba length yang lebih panjang
    if (length < 10) {
      return this.generateShortCode(length + 1)
    }

    throw new Error('Gagal generate short code yang unik')
  },

  async createLink(link: any) {
    const stmt = db.prepare(`
      INSERT INTO links (id, title, url, description, category_id, is_public, is_active, qr_code, short_code, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      link.id,
      link.title,
      link.url,
      link.description || null,
      link.category_id || null,
      link.is_public ? 1 : 0,
      link.is_active !== undefined ? (link.is_active ? 1 : 0) : 1,
      link.qr_code || null,
      link.short_code || null,
      link.user_id
    )
    return this.getLinkById(link.id)
  },

  async updateLink(id: string, data: any, userId: string) {
    // Jika mencoba menghapus short_code yang sudah ada
    if (data.short_code === null || data.short_code === '') {
      const existing = await this.getLinkById(id)
      if (existing && existing.short_code) {
        throw new Error('Tidak bisa menghapus short code yang sudah ada')
      }
    }

    const fields: string[] = []
    const values: any[] = []

    if (data.title !== undefined) {
      fields.push('title = ?')
      values.push(data.title)
    }
    if (data.url !== undefined) {
      fields.push('url = ?')
      values.push(data.url)
    }
    if (data.description !== undefined) {
      fields.push('description = ?')
      values.push(data.description)
    }
    if (data.category_id !== undefined) {
      fields.push('category_id = ?')
      values.push(data.category_id)
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?')
      values.push(data.is_active ? 1 : 0)
    }
    if (data.is_public !== undefined) {
      fields.push('is_public = ?')
      values.push(data.is_public ? 1 : 0)
    }
    if (data.qr_code !== undefined) {
      fields.push('qr_code = ?')
      values.push(data.qr_code)
    }
    if (data.short_code !== undefined) {
      fields.push('short_code = ?')
      values.push(data.short_code || null)
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')

    if (fields.length > 0) {
      values.push(id, userId)
      const stmt = db.prepare(`UPDATE links SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`)
      stmt.run(...values)
    }

    return this.getLinkById(id)
  },

  async deleteLink(id: string, userId: string) {
    const stmt = db.prepare('DELETE FROM links WHERE id = ? AND user_id = ?')
    stmt.run(id, userId)
  },

  async incrementClickCount(id: string) {
    const stmt = db.prepare('UPDATE links SET click_count = click_count + 1 WHERE id = ?')
    stmt.run(id)
  },

  // Categories
  async getCategories(userId?: string) {
    let query = 'SELECT * FROM categories'
    const params: any[] = []

    if (userId) {
      query += ' WHERE user_id = ?'
      params.push(userId)
    }

    query += ' ORDER BY sort_order ASC, name ASC'

    const stmt = db.prepare(query)
    const rows = stmt.all(...params)
    return rows.map(rowToObject)
  },

  async getCategoryById(id: string) {
    const stmt = db.prepare('SELECT * FROM categories WHERE id = ?')
    const row = stmt.get(id)
    return rowToObject(row)
  },

  async createCategory(category: any) {
    const stmt = db.prepare(`
      INSERT INTO categories (id, name, icon, sort_order, user_id)
      VALUES (?, ?, ?, ?, ?)
    `)
    stmt.run(category.id, category.name, category.icon || null, category.sort_order || 0, category.user_id)
    return this.getCategoryById(category.id)
  },

  async updateCategory(id: string, data: any, userId: string) {
    const fields: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      fields.push('name = ?')
      values.push(data.name)
    }
    if (data.icon !== undefined) {
      fields.push('icon = ?')
      values.push(data.icon)
    }
    if (data.sort_order !== undefined) {
      fields.push('sort_order = ?')
      values.push(data.sort_order)
    }

    if (fields.length > 0) {
      values.push(id, userId)
      const stmt = db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`)
      stmt.run(...values)
    }

    return this.getCategoryById(id)
  },

  async deleteCategory(id: string, userId: string) {
    const stmt = db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?')
    stmt.run(id, userId)
  },

  // Admin
  async getAdminUsers() {
    const stmt = db.prepare(`
      SELECT u.* FROM users u
      INNER JOIN admin_users a ON u.id = a.user_id
    `)
    const rows = stmt.all()
    return rows.map(rowToObject)
  },

  async isAdminUser(userId: string) {
    const stmt = db.prepare('SELECT 1 FROM admin_users WHERE user_id = ?')
    const row = stmt.get(userId)
    return !!row
  },

  // Admin Link Operations (no userId restriction)
  async adminGetAllLinks() {
    const query = `
      SELECT l.*, c.name as category_name, c.icon as category_icon
      FROM links l
      LEFT JOIN categories c ON l.category_id = c.id
      ORDER BY l.created_at DESC
    `
    const stmt = db.prepare(query)
    const rows = stmt.all()
    return rows.map((row: any) => {
      const obj = rowToObject(row)
      if (obj.category_name) {
        obj.category = {
          id: row.category_id,
          name: row.category_name,
          icon: row.category_icon
        }
      }
      return obj
    })
  },

  async adminCreateLink(link: any) {
    const stmt = db.prepare(`
      INSERT INTO links (id, title, url, description, category_id, is_public, is_active, qr_code, short_code, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      link.id,
      link.title,
      link.url,
      link.description || null,
      link.category_id || null,
      link.is_public ? 1 : 0,
      link.is_active !== undefined ? (link.is_active ? 1 : 0) : 1,
      link.qr_code || null,
      link.short_code || null,
      link.user_id || null
    )
    return this.getLinkById(link.id)
  },

  async adminUpdateLink(id: string, data: any) {
    const fields: string[] = []
    const values: any[] = []

    if (data.title !== undefined) {
      fields.push('title = ?')
      values.push(data.title)
    }
    if (data.url !== undefined) {
      fields.push('url = ?')
      values.push(data.url)
    }
    if (data.description !== undefined) {
      fields.push('description = ?')
      values.push(data.description)
    }
    if (data.category_id !== undefined) {
      fields.push('category_id = ?')
      values.push(data.category_id)
    }
    if (data.is_active !== undefined) {
      fields.push('is_active = ?')
      values.push(data.is_active ? 1 : 0)
    }
    if (data.is_public !== undefined) {
      fields.push('is_public = ?')
      values.push(data.is_public ? 1 : 0)
    }
    if (data.qr_code !== undefined) {
      fields.push('qr_code = ?')
      values.push(data.qr_code)
    }
    if (data.short_code !== undefined) {
      fields.push('short_code = ?')
      values.push(data.short_code || null)
    }
    if (data.user_id !== undefined) {
      fields.push('user_id = ?')
      values.push(data.user_id)
    }

    fields.push('updated_at = CURRENT_TIMESTAMP')

    if (fields.length > 0) {
      values.push(id)
      const stmt = db.prepare(`UPDATE links SET ${fields.join(', ')} WHERE id = ?`)
      stmt.run(...values)
    }

    return this.getLinkById(id)
  },

  async adminDeleteLink(id: string) {
    const stmt = db.prepare('DELETE FROM links WHERE id = ?')
    stmt.run(id)
  },

  // Admin User Management
  async getAllUsersWithAdminStatus(search?: string) {
    let query = `
      SELECT u.*, CASE WHEN a.user_id IS NOT NULL THEN 1 ELSE 0 END as is_admin
      FROM users u
      LEFT JOIN admin_users a ON u.id = a.user_id
    `
    const params: any[] = []

    if (search) {
      query += ' WHERE u.email LIKE ?'
      params.push(`%${search}%`)
    }

    query += ' ORDER BY u.created_at DESC'

    const stmt = db.prepare(query)
    const rows = stmt.all(...params)
    return rows.map((row: any) => ({
      ...rowToObject(row),
      is_admin: Boolean(row.is_admin)
    }))
  },

  async createUserWithSettings(userData: any, isAdmin: boolean = false) {
    // Create user
    const userStmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, custom_slug)
      VALUES (?, ?, ?, ?, ?)
    `)
    userStmt.run(
      userData.id,
      userData.email,
      userData.password_hash,
      userData.display_name,
      userData.custom_slug || null
    )

    // Create user settings
    const settingsStmt = db.prepare(`
      INSERT INTO user_settings (id, user_id, theme_color, show_categories)
      VALUES (?, ?, ?, ?)
    `)
    settingsStmt.run(
      crypto.randomUUID(),
      userData.id,
      '#2563eb',
      1
    )

    // Add to admin_users if needed
    if (isAdmin) {
      const adminStmt = db.prepare('INSERT INTO admin_users (user_id) VALUES (?)')
      adminStmt.run(userData.id)
    }

    // Return user with admin status
    const user = await this.getUserById(userData.id)
    return {
      ...user,
      is_admin: isAdmin
    }
  },

  async adminUpdateUser(id: string, userData: any, isAdmin?: boolean) {
    const fields: string[] = []
    const values: any[] = []

    if (userData.email !== undefined) {
      fields.push('email = ?')
      values.push(userData.email)
    }
    if (userData.password_hash !== undefined) {
      fields.push('password_hash = ?')
      values.push(userData.password_hash)
    }
    if (userData.display_name !== undefined) {
      fields.push('display_name = ?')
      values.push(userData.display_name)
    }
    if (userData.custom_slug !== undefined) {
      fields.push('custom_slug = ?')
      values.push(userData.custom_slug)
    }

    if (fields.length > 0) {
      values.push(id)
      const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`)
      stmt.run(...values)
    }

    // Update admin status if provided
    if (isAdmin !== undefined) {
      if (isAdmin) {
        // Add to admin_users if not already
        const checkStmt = db.prepare('SELECT 1 FROM admin_users WHERE user_id = ?')
        const exists = checkStmt.get(id)
        if (!exists) {
          const insertStmt = db.prepare('INSERT INTO admin_users (user_id) VALUES (?)')
          insertStmt.run(id)
        }
      } else {
        // Remove from admin_users
        const deleteStmt = db.prepare('DELETE FROM admin_users WHERE user_id = ?')
        deleteStmt.run(id)
      }
    }

    // Get updated user with admin status
    const user = await this.getUserById(id)
    const adminCheck = db.prepare('SELECT 1 FROM admin_users WHERE user_id = ?')
    const isAdminResult = !!adminCheck.get(id)

    return {
      ...user,
      is_admin: isAdminResult
    }
  },

  async adminDeleteUser(id: string) {
    // Delete from admin_users first
    const adminStmt = db.prepare('DELETE FROM admin_users WHERE user_id = ?')
    adminStmt.run(id)

    // Delete from users table (cascade will handle user_settings)
    const userStmt = db.prepare('DELETE FROM users WHERE id = ?')
    userStmt.run(id)
  },

  async setAdminStatus(userId: string, isAdmin: boolean) {
    if (isAdmin) {
      const checkStmt = db.prepare('SELECT 1 FROM admin_users WHERE user_id = ?')
      const exists = checkStmt.get(userId)
      if (!exists) {
        const insertStmt = db.prepare('INSERT INTO admin_users (user_id) VALUES (?)')
        insertStmt.run(userId)
      }
    } else {
      const deleteStmt = db.prepare('DELETE FROM admin_users WHERE user_id = ?')
      deleteStmt.run(userId)
    }
  },

  // Admin Category Operations (global categories without userId)
  async adminGetAllCategories() {
    const stmt = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC')
    const rows = stmt.all()
    return rows.map(rowToObject)
  },

  async adminCreateCategory(category: any) {
    const stmt = db.prepare(`
      INSERT INTO categories (id, name, icon, description, sort_order, user_id)
      VALUES (?, ?, ?, ?, ?, NULL)
    `)
    stmt.run(
      category.id,
      category.name,
      category.icon || null,
      category.description || null,
      category.sort_order || 0
    )
    return this.getCategoryById(category.id)
  },

  async adminUpdateCategory(id: string, categoryData: any) {
    const fields: string[] = []
    const values: any[] = []

    if (categoryData.name !== undefined) {
      fields.push('name = ?')
      values.push(categoryData.name)
    }
    if (categoryData.icon !== undefined) {
      fields.push('icon = ?')
      values.push(categoryData.icon)
    }
    if (categoryData.description !== undefined) {
      fields.push('description = ?')
      values.push(categoryData.description)
    }
    if (categoryData.sort_order !== undefined) {
      fields.push('sort_order = ?')
      values.push(categoryData.sort_order)
    }

    if (fields.length > 0) {
      values.push(id)
      const stmt = db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`)
      stmt.run(...values)
    }

    return this.getCategoryById(id)
  },

  async adminDeleteCategory(id: string) {
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?')
    stmt.run(id)
  },

  // Stats
  async getUserStats(userId: string) {
    const linksStmt = db.prepare('SELECT COUNT(*) as count FROM links WHERE user_id = ?')
    const linksResult = linksStmt.get(userId) as { count: number }

    const categoriesStmt = db.prepare('SELECT COUNT(*) as count FROM categories WHERE user_id = ?')
    const categoriesResult = categoriesStmt.get(userId) as { count: number }

    const clicksStmt = db.prepare('SELECT SUM(click_count) as total FROM links WHERE user_id = ?')
    const clicksResult = clicksStmt.get(userId) as { total: number | null }

    const publicLinksStmt = db.prepare('SELECT COUNT(*) as count FROM links WHERE user_id = ? AND is_public = 1')
    const publicLinksResult = publicLinksStmt.get(userId) as { count: number }

    return {
      totalLinks: linksResult.count,
      totalCategories: categoriesResult.count,
      totalClicks: clicksResult.total || 0,
      publicLinks: publicLinksResult.count
    }
  },

  async getPlatformStats() {
    const usersStmt = db.prepare('SELECT COUNT(*) as count FROM users')
    const usersResult = usersStmt.get() as { count: number }

    const linksStmt = db.prepare('SELECT COUNT(*) as count FROM links')
    const linksResult = linksStmt.get() as { count: number }

    const clicksStmt = db.prepare('SELECT SUM(click_count) as total FROM links')
    const clicksResult = clicksStmt.get() as { total: number | null }

    const categoriesStmt = db.prepare('SELECT COUNT(*) as count FROM categories')
    const categoriesResult = categoriesStmt.get() as { count: number }

    return {
      totalUsers: usersResult.count,
      totalLinks: linksResult.count,
      totalClicks: clicksResult.total || 0,
      totalCategories: categoriesResult.count
    }
  }
}

export default db
