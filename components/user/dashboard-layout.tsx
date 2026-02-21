'use client'

import { DashboardSidebar } from './dashboard-sidebar'
import { DashboardHeader } from './dashboard-header'
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ExternalLink, Menu } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const mobileNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Menu },
  { name: 'Kelola Link', href: '/dashboard/links', icon: ExternalLink },
  { name: 'Kategori', href: '/dashboard/categories', icon: ExternalLink },
  { name: 'Pengaturan', href: '/dashboard/settings', icon: ExternalLink },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/20 to-accent-50/10 relative">
      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative">
        <DashboardHeader onMobileMenuOpen={() => setMobileMenuOpen(true)} />

        <div className="flex">
          <DashboardSidebar />

          <main className="flex-1 p-6 lg:p-8 animate-fade-in">
            <BreadcrumbNav />
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0 backdrop-blur-md bg-white/95">
          <SheetHeader className="border-b border-slate-200/60 px-6 py-4 bg-gradient-to-r from-brand-50/50 to-accent-50/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30 transition-transform hover:scale-105">
                <ExternalLink className="h-5 w-5 text-white" />
              </div>
              <SheetTitle className="text-left">
                <div className="font-semibold text-slate-900">User Panel</div>
                <div className="text-xs text-slate-500">Link Manager</div>
              </SheetTitle>
            </div>
          </SheetHeader>

          <nav className="flex flex-col space-y-1 p-4">
            {mobileNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-50 to-accent-50 text-brand-700 shadow-sm border-l-4 border-brand-600'
                      : 'text-slate-700 hover:bg-slate-50 hover:shadow-sm'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
