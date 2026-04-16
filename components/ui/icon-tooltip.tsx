'use client'

import { ReactNode } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface IconButtonTooltipProps {
  children: ReactNode
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  className?: string
}

/**
 * Tooltip wrapper for icon-only buttons
 * Provides consistent tooltip styling and behavior
 */
export function IconButtonTooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 400,
  className,
}: IconButtonTooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn('bg-slate-900 text-white border-slate-700', className)}
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Keyboard shortcut badge for tooltips
 */
interface ShortcutBadgeProps {
  keys: string[]
}

export function ShortcutBadge({ keys }: ShortcutBadgeProps) {
  return (
    <div className="ml-2 flex items-center gap-1">
      {keys.map((key, index) => (
        <kbd
          key={index}
          className="rounded bg-slate-800 px-1.5 py-0.5 text-xs font-mono text-slate-300"
        >
          {key}
        </kbd>
      ))}
    </div>
  )
}

/**
 * Tooltip with keyboard shortcut
 */
interface TooltipWithShortcutProps extends Omit<IconButtonTooltipProps, 'content'> {
  content: string
  shortcut?: string[]
}

export function TooltipWithShortcut({
  children,
  content,
  shortcut,
  side = 'top',
  align = 'center',
  delayDuration = 400,
  className,
}: TooltipWithShortcutProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn('bg-slate-900 text-white border-slate-700', className)}
        >
          <div className="flex items-center justify-between gap-4">
            <p>{content}</p>
            {shortcut && <ShortcutBadge keys={shortcut} />}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Quick helper for common icon button tooltips
 */
export const tooltips = {
  // Navigation
  dashboard: 'Dashboard',
  links: 'Kelola Link',
  categories: 'Kategori',
  settings: 'Pengaturan',
  users: 'Pengguna',
  stats: 'Statistik',

  // Actions
  edit: 'Edit',
  delete: 'Hapus',
  copy: 'Salin',
  share: 'Bagikan',
  download: 'Unduh',
  refresh: 'Refresh',
  search: 'Cari',
  filter: 'Filter',
  sort: 'Urutkan',

  // States
  close: 'Tutup',
  open: 'Buka',
  save: 'Simpan',
  cancel: 'Batal',

  // Form
  showPassword: 'Tampilkan password',
  hidePassword: 'Sembunyikan password',
  clear: 'Hapus',

  // Links
  openLink: 'Buka link',
  copyLink: 'Salin link',

  // Keyboard shortcuts
  commandPalette: 'Cari perintah',
  newLink: 'Link baru',
  focusSearch: 'Fokus pencarian',
} as const

/**
 * Pre-configured tooltip for common actions
 */
export function CommonTooltip({
  type,
  children,
  shortcut,
  side = 'top',
}: {
  type: keyof typeof tooltips
  children: ReactNode
  shortcut?: string[]
  side?: 'top' | 'right' | 'bottom' | 'left'
}) {
  const content = tooltips[type]

  return (
    <TooltipWithShortcut content={content} shortcut={shortcut} side={side}>
      {children}
    </TooltipWithShortcut>
  )
}
