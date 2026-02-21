import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { DashboardLayout } from '@/components/user/dashboard-layout'
import { LinksTable } from '@/components/user/links-table'

async function checkAuth() {
  const session = await getUserSession()

  if (!session) {
    redirect('/login')
  }

  return session.userId
}

async function getLinks(userId: string) {
  const { data: links, error } = await supabase
    .from('links')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] Error fetching user links:', error)
    return []
  }

  return links
}

async function getCategories(userId: string) {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order')

  if (error) {
    console.error('[v0] Error fetching user categories:', error)
    return []
  }

  return categories
}

export default async function UserLinks() {
  const userId = await checkAuth()
  const [links, categories] = await Promise.all([
    getLinks(userId),
    getCategories(userId)
  ])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-bold text-slate-900">Kelola Link</h1>
          <p className="text-slate-600">Tambah, edit, dan hapus link Anda</p>
        </div>

        <LinksTable links={links} categories={categories} userId={userId} />
      </div>
    </DashboardLayout>
  )
}