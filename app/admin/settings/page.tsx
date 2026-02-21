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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Pengaturan Platform</h1>
          <p className="text-sm sm:text-base text-slate-600">Konfigurasi LinkSphere</p>
        </div>

        {/* Platform Info */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="mb-4 sm:mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-blue-600">
              <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Informasi Platform</h2>
              <p className="text-xs sm:text-sm text-slate-500">Detail tentang LinkSphere</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-sm font-medium text-slate-900">Nama Aplikasi</p>
                <p className="text-sm text-slate-500">Nama platform yang ditampilkan ke user</p>
              </div>
              <div className="rounded-md bg-slate-100 px-4 py-2">
                <p className="font-medium text-slate-900">LinkSphere</p>
              </div>
            </div>

            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-sm font-medium text-slate-900">Versi</p>
                <p className="text-sm text-slate-500">Versi aplikasi saat ini</p>
              </div>
              <div className="rounded-md bg-slate-100 px-4 py-2">
                <p className="font-medium text-slate-900">1.0.0</p>
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Status</p>
                <p className="text-sm text-slate-500">Status sistem saat ini</p>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-green-100 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                <p className="font-medium text-green-700">Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="mb-4 sm:mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-purple-600">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Fitur Aktif</h2>
              <p className="text-xs sm:text-sm text-slate-500">Fitur yang tersedia di platform</p>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-100">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Public Pages</p>
                <p className="text-xs text-slate-500">Halaman publik per user</p>
              </div>
              <div className="ml-auto">
                <div className="h-2 w-2 rounded-full bg-green-600" />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Multi-User</p>
                <p className="text-xs text-slate-500">Banyak user dengan dashboard</p>
              </div>
              <div className="ml-auto">
                <div className="h-2 w-2 rounded-full bg-green-600" />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-100">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Admin Panel</p>
                <p className="text-xs text-slate-500">Manajemen lengkap</p>
              </div>
              <div className="ml-auto">
                <div className="h-2 w-2 rounded-full bg-green-600" />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-pink-100">
                <Settings className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Customization</p>
                <p className="text-xs text-slate-500">Tema & personalisasi</p>
              </div>
              <div className="ml-auto">
                <div className="h-2 w-2 rounded-full bg-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="mb-4 sm:mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-red-600">
              <LogOut className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Aksi Cepat</h2>
              <p className="text-xs sm:text-sm text-slate-500">Perintah admin</p>
            </div>
          </div>

          <div className="space-y-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-slate-100"
            >
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Buka Landing Page</p>
                  <p className="text-xs text-slate-500">Halaman publik LinkSphere</p>
                </div>
              </div>
              <div className="rounded-md bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                Buka
              </div>
            </a>

            <form
              action="/api/admin/logout"
              method="POST"
              className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-4 transition-colors hover:bg-red-100"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Logout Admin</p>
                  <p className="text-xs text-slate-500">Keluar dari panel admin</p>
                </div>
              </div>
              <button
                type="submit"
                className="rounded-md bg-white px-3 py-1 text-xs font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* Support */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-slate-900">Bantuan & Dukungan</h3>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-600">
            <p>
              Jika Anda mengalami masalah atau memiliki pertanyaan tentang LinkSphere, 
              hubungi tim dukungan kami.
            </p>
            <div className="flex items-center gap-2 rounded-md bg-slate-100 p-4">
              <Mail className="h-5 w-5 text-slate-600" />
              <div>
                <p className="font-medium text-slate-900">Email Dukungan</p>
                <p className="text-slate-600">support@linksphere.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}