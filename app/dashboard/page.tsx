import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { DashboardLayout } from '@/components/user/dashboard-layout'
import { LinksTable } from '@/components/user/links-table'
import { StatsCards } from '@/components/user/stats-cards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

async function getStats(userId: string) {
  const { count: totalLinks } = await supabase
    .from('links')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { count: publicLinks } = await supabase
    .from('links')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_public', true)

  const { data: clickData } = await supabase
    .from('links')
    .select('click_count')
    .eq('user_id', userId)

  const totalClicks = clickData?.reduce((sum, link) => sum + (link.click_count || 0), 0) || 0

  const { count: totalCategories } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return {
    totalLinks: totalLinks || 0,
    publicLinks: publicLinks || 0,
    totalClicks,
    totalCategories: totalCategories || 0
  }
}

export default async function UserDashboard() {
  const userId = await checkAuth()

  const [links, categories, stats] = await Promise.all([
    getLinks(userId),
    getCategories(userId),
    getStats(userId)
  ])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Kelola semua link dan kategori Anda</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Statistik Link</CardTitle>
          </CardHeader>
          <CardContent>
            <StatsCards stats={stats} />
          </CardContent>
        </Card>

        <LinksTable links={links} categories={categories} userId={userId} />
      </div>
    </DashboardLayout>
  )
}