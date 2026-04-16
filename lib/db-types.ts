// Database Abstraction Layer Types
// This interface allows switching between different database implementations

export interface DatabaseClient {
  // Users
  getUserByEmail(email: string): Promise<any | null>
  getUserById(id: string): Promise<any | null>
  getUserBySlug(slug: string): Promise<any | null>
  createUser(user: any): Promise<any>
  updateUser(id: string, data: any): Promise<any>
  deleteUser(id: string): Promise<void>
  getAllUsers(): Promise<any[]>

  // User Settings
  getUserSettings(userId: string): Promise<any | null>
  createUserSettings(settings: any): Promise<any>
  updateUserSettings(userId: string, data: any): Promise<any>

  // Links
  getLinks(userId?: string): Promise<any[]>
  getLinkById(id: string): Promise<any | null>
  createLink(link: any): Promise<any>
  updateLink(id: string, data: any, userId: string): Promise<any>
  deleteLink(id: string, userId: string): Promise<void>
  incrementClickCount(id: string): Promise<void>

  // Short code operations
  getLinkByShortCode(shortCode: string): Promise<any | null>
  isShortCodeExists(shortCode: string, excludeLinkId?: string): Promise<boolean>
  generateShortCode(length?: number): Promise<string>

  // Categories
  getCategories(userId?: string): Promise<any[]>
  getCategoryById(id: string): Promise<any | null>
  createCategory(category: any): Promise<any>
  updateCategory(id: string, data: any, userId: string): Promise<any>
  deleteCategory(id: string, userId: string): Promise<void>

  // Admin
  getAdminUsers(): Promise<any[]>
  isAdminUser(userId: string): Promise<boolean>

  // Admin User Management (with admin status)
  getAllUsersWithAdminStatus(search?: string): Promise<any[]>
  createUserWithSettings(userData: any, isAdmin?: boolean): Promise<any>
  adminUpdateUser(id: string, data: any, isAdmin?: boolean): Promise<any>
  adminDeleteUser(id: string): Promise<void>
  setAdminStatus(userId: string, isAdmin: boolean): Promise<void>

  // Admin Link Operations (no userId restriction)
  adminGetAllLinks(): Promise<any[]>
  adminCreateLink(link: any): Promise<any>
  adminUpdateLink(id: string, data: any): Promise<any>
  adminDeleteLink(id: string): Promise<void>

  // Admin Category Operations (global categories without userId)
  adminGetAllCategories(): Promise<any[]>
  adminCreateCategory(category: any): Promise<any>
  adminUpdateCategory(id: string, data: any): Promise<any>
  adminDeleteCategory(id: string): Promise<void>

  // Stats
  getUserStats(userId: string): Promise<any>
  getPlatformStats(): Promise<any>
}

export type { Category, Link, User, UserSettings, Admin } from './supabase'
