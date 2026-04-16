import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { DashboardLayout } from '@/components/user/dashboard-layout'
import { LinksTable } from '@/components/user/links-table'
import { AutoRefreshStats } from '@/components/user/auto-refresh-stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function checkAuth() {
  const session = await getUserSession()

  if (!session) {
    redirect('/login')
  }

  return session.userId
}

async function getLinks(userId: string) {
  try {
    return await db.getLinks(userId)
  } catch (error) {
    console.error('[v0] Error fetching user links:', error)
    return []
  }
}

async function getCategories(userId: string) {
  try {
    return await db.getCategories(userId)
  } catch (error) {
    console.error('[v0] Error fetching user categories:', error)
    return []
  }
}

async function getStats(userId: string) {
  try {
    return await db.getUserStats(userId)
  } catch (error) {
    console.error('[v0] Error fetching user stats:', error)
    return {
      totalLinks: 0,
      publicLinks: 0,
      totalClicks: 0,
      totalCategories: 0
    }
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
            <AutoRefreshStats initialStats={stats} />
          </CardContent>
        </Card>

        <LinksTable links={links} categories={categories} userId={userId} />
      </div>
    </DashboardLayout>
  )
}