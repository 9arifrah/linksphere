'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AdminHeaderProps {
  onMobileMenuOpen?: () => void
}

export function AdminHeader({ onMobileMenuOpen }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('[v0] Logout error:', error)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          {onMobileMenuOpen && (
            <button
              onClick={onMobileMenuOpen}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-800/50 transition-colors duration-200"
            >
              <Menu className="h-6 w-6 text-slate-300" />
            </button>
          )}
          <div className="text-sm text-slate-300 font-medium">
            Dashboard Admin
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full bg-transparent border-slate-700/50 text-slate-300 hover:bg-slate-800/50 hover:text-white hover:border-emerald-500/50 transition-all duration-200"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-800/95 backdrop-blur-xl border-slate-700/50 text-slate-200">
            <DropdownMenuLabel className="text-slate-200">Akun Admin</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-700/50" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-slate-300 hover:bg-slate-700/50 hover:text-white focus:bg-slate-700/50 focus:text-white cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
