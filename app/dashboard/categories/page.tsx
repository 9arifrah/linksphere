import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { DashboardLayout } from '@/components/user/dashboard-layout'
import { CategoriesTable } from '@/components/user/categories-table'

async function checkAuth() {
  const session = await getUserSession()

  if (!session) {
    redirect('/login')
  }

  return session.userId
}

async function getCategories(userId: string) {
  try {
    return await db.getCategories(userId)
  } catch (error) {
    console.error('[v0] Error fetching user categories:', error)
    return []
  }
}

export default async function UserCategories() {
  const userId = await checkAuth()
  const categories = await getCategories(userId)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-bold text-slate-900">Kategori Saya</h1>
          <p className="text-slate-600">Kelola kategori untuk mengorganisasi link Anda</p>
        </div>

        <CategoriesTable categories={categories} userId={userId} />
      </div>
    </DashboardLayout>
  )
}