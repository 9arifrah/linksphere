'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment } from 'react'

const breadcrumbNames: Record<string, string> = {
  dashboard: 'Dashboard',
  links: 'Kelola Link',
  categories: 'Kategori',
  settings: 'Pengaturan',
  users: 'Pengguna',
  stats: 'Statistik',
}

export function BreadcrumbNav() {
  const pathname = usePathname()

  // Skip breadcrumb on root dashboard
  if (pathname === '/dashboard' || pathname === '/admin/dashboard') {
    return null
  }

  const segments = pathname.split('/').filter(Boolean)

  // Build breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const isLast = index === segments.length - 1
    const name = breadcrumbNames[segment] || segment

    return { name, href, isLast }
  })

  return (
    <nav className="flex items-center space-x-1 text-sm mb-4 animate-fade-in">
      <Link
        href={segments[0] === 'admin' ? '/admin/dashboard' : '/dashboard'}
        className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.map((crumb) => (
        <Fragment key={crumb.href}>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          {crumb.isLast ? (
            <span className="font-medium text-slate-900">{crumb.name}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              {crumb.name}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
