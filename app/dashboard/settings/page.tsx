import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { DashboardLayout } from '@/components/user/dashboard-layout'
import { SettingsForm } from '@/components/user/settings-form'

async function checkAuth() {
  const session = await getUserSession()

  if (!session) {
    redirect('/login')
  }

  return session.userId
}

async function getUserSettings(userId: string) {
  try {
    const user = await db.getUserById(userId)
    
    if (!user) {
      return { user: null, settings: null }
    }

    const settings = await db.getUserSettings(userId)

    if (!settings) {
      // Return default settings if none exist
      return { 
        user, 
        settings: {
          user_id: userId,
          theme_color: '#2563eb',
          show_categories: true
        }
      }
    }

    return { user, settings }
  } catch (error) {
    console.error('[v0] Error fetching user settings:', error)
    return { user: null, settings: null }
  }
}

export default async function UserSettings() {
  const userId = await checkAuth()
  const { user, settings } = await getUserSettings(userId)

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Pengaturan
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Kustomisasi profil dan halaman publik Anda
          </p>
        </div>

        {/* Settings Form with live preview */}
        <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <SettingsForm user={user} settings={settings} userId={userId} />
        </div>
      </div>
    </DashboardLayout>
  )
}