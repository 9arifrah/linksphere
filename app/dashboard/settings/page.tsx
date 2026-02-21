import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
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
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, display_name, custom_slug')
    .eq('id', userId)
    .single()

  if (userError || !user) {
    return { user: null, settings: null }
  }

  const { data: settings, error: settingsError } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (settingsError) {
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
}

export default async function UserSettings() {
  const userId = await checkAuth()
  const { user, settings } = await getUserSettings(userId)

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="animate-scale-in">
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