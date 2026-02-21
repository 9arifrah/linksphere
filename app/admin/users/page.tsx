import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { DashboardLayout } from '@/components/admin/dashboard-layout'
import { UsersTable } from '@/components/admin/users-table'

async function checkAuth() {
  const session = await getVerifiedAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return session.userId
}

async function getUsers() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/users`, {
    cache: 'no-store'
  })
  
  if (!response.ok) {
    console.error('[v0] Error fetching users:', response.statusText)
    return []
  }
  
  const data = await response.json()
  return data.users || []
}

export default async function AdminUsers() {
  await checkAuth()
  const users = await getUsers()

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="animate-scale-in">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Manajemen User
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Kelola semua user yang terdaftar di platform ({users.length} user)
          </p>
        </div>

        {/* Users Table */}
        <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <UsersTable users={users} />
        </div>
      </div>
    </DashboardLayout>
  )
}