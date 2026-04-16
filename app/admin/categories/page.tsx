import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { DashboardLayout } from '@/components/admin/dashboard-layout'
import { AdminCategoriesClient } from '@/components/admin/admin-categories-client'

async function checkAuth() {
  const session = await getVerifiedAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return session.userId
}

async function getCategories() {
  if (!supabase) {
    console.error('[v0] Supabase client not initialized')
    return []
  }

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  if (error) {
    console.error('[v0] Error fetching categories:', error)
    return []
  }

  return categories
}

export default async function AdminCategories() {
  await checkAuth()
  const categories = await getCategories()

  return <AdminCategoriesClient initialCategories={categories} />
}
