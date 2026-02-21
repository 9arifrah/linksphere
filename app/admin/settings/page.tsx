import { getVerifiedAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/admin/dashboard-layout'
import { Settings, LogOut, Globe, Mail, Building2, Shield } from 'lucide-react'

async function checkAuth() {
  const session = await getVerifiedAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return session.userId
}

export default async function AdminSettings() {
  await checkAuth()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">Pengaturan Platform</h1>
          <p className="text-sm sm:text-base text-slate-300">Konfigurasi LinkSphere</p>
        </div>

        {/* Platform Info */}
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 backdrop-blur p-4 sm:p-6 shadow-slack-md">
          <div className="mb-4 sm:mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-blue-600">
              <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">Informasi Platform</h2>
              <p className="text-xs sm:text-sm text-slate-400">Detail tentang LinkSphere</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-slate-700/50 pb-4">
              <div>
                <p className="text-sm font-medium text-white">Nama Aplikasi</p>
                <p className="text-sm text-slate-400">Nama platform yang ditampilkan ke user</p>
              </div>
              <div className="rounded-md bg-slate-700 px-4 py-2">
                <p className="font-medium text-white">LinkSphere</p>
              </div>
            </div>

            <div className="flex items-start justify-between border-b border-slate-700/50 pb-4">
              <div>
                <p className="text-sm font-medium text-white">Versi</p>
                <p className="text-sm text-slate-400">Versi aplikasi saat ini</p>
              </div>
              <div className="rounded-md bg-slate-700 px-4 py-2">
                <p className="font-medium text-white">1.0.0</p>
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white">Status</p>
                <p className="text-sm text-slate-400">Status sistem saat ini</p>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-green-900/30 px-4 py-2 border border-green-700/50">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <p className="font-medium text-green-400">Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 backdrop-blur p-4 sm:p-6 shadow-slack-md">
          <div className="mb-4 sm:mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-purple-600">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">Fitur Aktif</h2>
              <p className="text-xs sm:text-sm text-slate-400">Fitur yang tersedia di platform</p>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-md border border-slate-700/50 bg-slate-700/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-900/30">
                <Globe className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Public Pages</p>
                <p className="text-xs text-slate-400">Halaman publik per user</p>
              </div>
              <div className="ml-auto">
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-slate-700/50 bg-slate-700/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-900/30">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Multi-User</p>
                <p className="text-xs text-slate-400">Banyak user dengan dashboard</p>
              </div>
              <div className="ml-auto">
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-slate-700/50 bg-slate-700/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-900/30">
                <Shield className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Admin Panel</p>
                <p className="text-xs text-slate-400">Manajemen lengkap</p>
              </div>
              <div className="ml-auto">
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-slate-700/50 bg-slate-700/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-pink-900/30">
                <Settings className="h-5 w-5 text-pink-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Customization</p>
                <p className="text-xs text-slate-400">Tema & personalisasi</p>
              </div>
              <div className="ml-auto">
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 backdrop-blur p-4 sm:p-6 shadow-slack-md">
          <div className="mb-4 sm:mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-red-600">
              <LogOut className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">Aksi Cepat</h2>
              <p className="text-xs sm:text-sm text-slate-400">Perintah admin</p>
            </div>
          </div>

          <div className="space-y-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-md border border-slate-700/50 bg-slate-700/50 p-4 transition-colors hover:bg-slate-700"
            >
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-white">Buka Landing Page</p>
                  <p className="text-xs text-slate-400">Halaman publik LinkSphere</p>
                </div>
              </div>
              <div className="rounded-md bg-slate-600 px-3 py-1 text-xs font-medium text-white shadow-sm">
                Buka
              </div>
            </a>

            <form
              action="/api/admin/logout"
              method="POST"
              className="flex items-center justify-between rounded-md border border-red-700/50 bg-red-900/20 p-4 transition-colors hover:bg-red-900/30"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5 text-red-400" />
                <div>
                  <p className="text-sm font-medium text-white">Logout Admin</p>
                  <p className="text-xs text-slate-400">Keluar dari panel admin</p>
                </div>
              </div>
              <button
                type="submit"
                className="rounded-md bg-slate-600 px-3 py-1 text-xs font-medium text-red-400 shadow-sm transition-colors hover:bg-slate-500"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* Support */}
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 backdrop-blur p-4 sm:p-6 shadow-slack-md">
          <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-white">Bantuan & Dukungan</h3>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-300">
            <p>
              Jika Anda mengalami masalah atau memiliki pertanyaan tentang LinkSphere, 
              hubungi tim dukungan kami.
            </p>
            <div className="flex items-center gap-2 rounded-md bg-slate-700 p-4">
              <Mail className="h-5 w-5 text-slate-400" />
              <div>
                <p className="font-medium text-white">Email Dukungan</p>
                <p className="text-slate-400">support@linksphere.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}