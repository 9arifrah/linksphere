'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ExternalLink, FolderTree, BarChart3, Settings, Users } from 'lucide-react'

const navigation = [
  { name: 'Kelola Link', href: '/admin/dashboard', icon: ExternalLink },
  { name: 'Kategori', href: '/admin/categories', icon: FolderTree },
  { name: 'Manajemen User', href: '/admin/users', icon: Users },
  { name: 'Statistik', href: '/admin/stats', icon: BarChart3 },
  { name: 'Pengaturan', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-700/50 bg-slate-900/95 backdrop-blur-xl lg:block hidden">
      <div className="flex h-16 items-center border-b border-slate-700/50 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <ExternalLink className="h-5 w-5 text-white relative z-10" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Admin Panel</div>
            <p className="text-xs text-slate-400">Link Manager</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 relative overflow-hidden group',
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10 border-l-4 border-emerald-500'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:shadow-lg'
              )}
            >
              <item.icon className={cn('h-5 w-5 transition-all duration-200', isActive ? 'scale-110 text-emerald-400' : 'group-hover:scale-110 group-hover:text-white')} />
              <span className="relative z-10">{item.name}</span>
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
