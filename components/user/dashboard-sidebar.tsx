'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ExternalLink, FolderTree, BarChart3, Settings, LogOut, Home } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Kelola Link', href: '/dashboard/links', icon: ExternalLink },
  { name: 'Kategori', href: '/dashboard/categories', icon: FolderTree },
  { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:block w-64 border-r border-slate-200/60 bg-white/80 backdrop-blur-sm">
      <div className="flex h-16 items-center border-b border-slate-200/60 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30">
            <ExternalLink className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">User Panel</div>
            <p className="text-xs text-slate-500">Link Manager</p>
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
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 shadow-sm border-l-4 border-purple-600'
                  : 'text-slate-700 hover:bg-slate-50 hover:shadow-sm'
              )}
            >
              <item.icon className={cn('h-5 w-5 transition-transform duration-200', isActive ? 'scale-110' : '')} />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}