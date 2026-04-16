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
  if (!supabase) {
    console.error('[v0] Supabase client not initialized')
    return []
  }

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] Error fetching users:', error)
    return []
  }

  return users || []
}

export default async function AdminUsers() {
  await checkAuth()
  const users = await getUsers()

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="animate-scale-in">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            Manajemen User
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1">
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
