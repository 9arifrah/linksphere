'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { LogOut, ExternalLink, Menu } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DashboardHeaderProps {
  onMobileMenuOpen?: () => void
}

export function DashboardHeader({ onMobileMenuOpen }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('[v0] Error logging out:', error)
    }
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          {onMobileMenuOpen && (
            <button
              onClick={onMobileMenuOpen}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors duration-200"
            >
              <Menu className="h-6 w-6 text-slate-600" />
            </button>
          )}

          <Link href="/dashboard" className="hidden lg:flex items-center gap-2 group">
            <ExternalLink className="h-6 w-6 text-purple-600 transition-transform duration-200 group-hover:scale-110" />
            <span className="font-semibold text-slate-900">Link Manager</span>
          </Link>

          <Link href="/dashboard" className="lg:hidden flex items-center gap-2 group">
            <ExternalLink className="h-6 w-6 text-purple-600 transition-transform duration-200 group-hover:scale-110" />
            <span className="font-semibold text-slate-900">Link Manager</span>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="hidden sm:flex hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="sm:hidden flex h-9 w-9 items-center justify-center p-0 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
