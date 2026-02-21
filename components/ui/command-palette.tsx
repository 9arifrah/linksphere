'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, FileText, FolderTree, Settings, Users, BarChart3, Command } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  action: () => void
  keywords?: string[]
}

interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const defaultCommands: CommandItem[] = [
  {
    id: 'links',
    title: 'Kelola Link',
    description: 'Lihat dan kelola semua link Anda',
    icon: <FileText className="h-5 w-5" />,
    action: () => (window.location.href = '/dashboard/links'),
    keywords: ['link', 'url', 'kelola'],
  },
  {
    id: 'categories',
    title: 'Kategori',
    description: 'Atur kategori link',
    icon: <FolderTree className="h-5 w-5" />,
    action: () => (window.location.href = '/dashboard/categories'),
    keywords: ['kategori', 'folder', 'group'],
  },
  {
    id: 'settings',
    title: 'Pengaturan',
    description: 'Ubah profil dan preferensi',
    icon: <Settings className="h-5 w-5" />,
    action: () => (window.location.href = '/dashboard/settings'),
    keywords: ['setting', 'pengaturan', 'profil', 'preferensi'],
  },
  {
    id: 'stats',
    title: 'Statistik',
    description: 'Lihat statistik dan analitik',
    icon: <BarChart3 className="h-5 w-5" />,
    action: () => (window.location.href = '/dashboard'),
    keywords: ['statistik', 'analytics', 'data'],
  },
]

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  // Filter commands based on search query
  const filteredCommands = defaultCommands.filter(
    (command) =>
      command.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      command.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  // Reset selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
            setOpen(false)
            setSearchQuery('')
          }
          break
        case 'Escape':
          e.preventDefault()
          setOpen(false)
          setSearchQuery('')
          break
      }
    },
    [filteredCommands, selectedIndex, setOpen]
  )

  // Listen for custom event to open command palette
  useEffect(() => {
    const handleOpen = () => {
      setOpen(true)
      setSearchQuery('')
    }

    window.addEventListener('open-command-palette', handleOpen)
    return () => window.removeEventListener('open-command-palette', handleOpen)
  }, [setOpen])

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        setSearchQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setOpen])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b border-slate-200 px-4 py-4">
            <Search className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari perintah..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            <kbd className="ml-3 flex h-6 items-center gap-1 rounded border border-slate-200 bg-slate-100 px-2 text-xs text-slate-500">
              <Command className="h-3 w-3" />
              <span>K</span>
            </kbd>
          </div>

          {/* Command List */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Tidak ada perintah ditemukan
              </div>
            ) : (
              <div className="space-y-1">
                {filteredCommands.map((command, index) => (
                  <button
                    key={command.id}
                    onClick={() => {
                      command.action()
                      setOpen(false)
                      setSearchQuery('')
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all',
                      'hover:bg-slate-100',
                      index === selectedIndex && 'bg-slate-100'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                        'bg-gradient-to-br from-brand-500 to-brand-600',
                        'text-white shadow-md'
                      )}
                    >
                      {command.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">{command.title}</p>
                      {command.description && (
                        <p className="text-sm text-slate-500 truncate">
                          {command.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 bg-slate-50">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <kbd className="flex h-5 items-center gap-1 rounded border border-slate-200 bg-white px-1.5">
                  <span>↑</span>
                  <span>↓</span>
                </kbd>
                <span>navigasi</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="flex h-5 items-center gap-1 rounded border border-slate-200 bg-white px-1.5">
                  <span>↵</span>
                </kbd>
                <span>pilih</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="flex h-5 items-center gap-1 rounded border border-slate-200 bg-white px-1.5">
                  <span>esc</span>
                </kbd>
                <span>tutup</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Command palette trigger button (for demo purposes)
 */
export function CommandPaletteTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
      >
        <Search className="h-4 w-4" />
        <span>Cari...</span>
        <kbd className="ml-auto flex h-5 items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 text-xs">
          <Command className="h-3 w-3" />
          <span>K</span>
        </kbd>
      </button>

      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  )
}
