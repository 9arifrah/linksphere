import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { DashboardLayout } from '@/components/admin/dashboard-layout'
import { LinksTable } from '@/components/admin/links-table'
import { StatsCards } from '@/components/admin/stats-cards'

import { GrowthChart } from '@/components/admin/growth-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function checkAuth() {
  const session = await getVerifiedAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return session.userId
}

async function getLinks() {
  const { data: links, error } = await supabase
    .from('links')
    .select(`
      *,
      category:categories(*),
      user:users(email, display_name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] Error fetching links:', error)
    return []
  }

  return links
}

async function getCategories() {
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

async function getUsers() {
  const { data: users, error } = await supabase
    .from('users')
    .select('created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] Error fetching users:', error)
    return []
  }

  return users
}


async function getStats() {
  const { count: totalLinks } = await supabase
    .from('links')
    .select('*', { count: 'exact', head: true })

  const { count: activeLinks } = await supabase
    .from('links')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { data: clickData } = await supabase
    .from('links')
    .select('click_count')

  const totalClicks = clickData?.reduce((sum, link) => sum + (link.click_count || 0), 0) || 0

  const { count: totalCategories } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })

  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  return {
    totalLinks: totalLinks || 0,
    activeLinks: activeLinks || 0,
    totalClicks,
    totalCategories: totalCategories || 0,
    totalUsers: totalUsers || 0
  }
}

export default async function AdminDashboard() {
  await checkAuth()

  const [links, categories, stats, users] = await Promise.all([
    getLinks(),
    getCategories(),
    getStats(),
    getUsers()
  ])

  return (
    <DashboardLayout>
      <div className="space-y-6 overflow-x-hidden animate-fade-in">
        {/* Header */}
        <div className="animate-scale-in">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Dashboard Admin
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Kelola semua link, kategori, dan user di platform
          </p>
        </div>

        {/* Stats Cards */}
        <Card className="shadow-slack-md border-slate-200/60 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-900">Statistik Platform</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <StatsCards stats={stats} />
          </CardContent>
        </Card>

        {/* Growth Chart */}
        <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <GrowthChart links={links} users={users} />
        </div>

        {/* Recent Links */}
        <Card className="shadow-slack-md border-slate-200/60 animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-900">Link Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <LinksTable links={links} categories={categories} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
