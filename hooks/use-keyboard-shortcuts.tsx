'use client'

import { useEffect, useState } from 'react'
import { keyboardShortcuts } from '@/lib/accessibility'

interface Shortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  description: string
  action: () => void
  enabled?: boolean
}

type ShortcutConfig = {
  shortcuts: Shortcut[]
  disabled?: boolean
}

/**
 * Keyboard shortcuts hook
 * @param config Shortcut configuration
 */
export function useKeyboardShortcuts(config: ShortcutConfig) {
  const { shortcuts, disabled = false } = config
  const [enabledShortcuts, setEnabledShortcuts] = useState<Shortcut[]>([])

  useEffect(() => {
    if (disabled) {
      setEnabledShortcuts([])
      return
    }

    // Filter enabled shortcuts
    const active = shortcuts.filter(s => s.enabled !== false)
    setEnabledShortcuts(active)
  }, [shortcuts, disabled])

  useEffect(() => {
    if (disabled || enabledShortcuts.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Find matching shortcut
      const shortcut = enabledShortcuts.find(s => {
        return (
          s.key.toLowerCase() === e.key.toLowerCase() &&
          (s.ctrlKey === undefined || s.ctrlKey === e.ctrlKey) &&
          (s.metaKey === undefined || s.metaKey === e.metaKey) &&
          (s.shiftKey === undefined || s.shiftKey === e.shiftKey) &&
          (s.altKey === undefined || s.altKey === e.altKey)
        )
      })

      if (shortcut) {
        e.preventDefault()
        shortcut.action()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabledShortcuts, disabled])

  return { shortcuts: enabledShortcuts }
}

/**
 * Common keyboard shortcuts for the app
 */
export function useAppShortcuts() {
  return useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'k',
        ctrlKey: true,
        metaKey: true,
        description: 'Buka command palette',
        action: () => {
          // Dispatch custom event for command palette
          window.dispatchEvent(new CustomEvent('open-command-palette'))
        },
      },
      {
        key: '/',
        description: 'Fokus ke pencarian',
        action: () => {
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
          searchInput?.focus()
        },
      },
      {
        key: 'n',
        ctrlKey: true,
        metaKey: true,
        description: 'Buat link baru',
        action: () => {
          // Dispatch custom event for new link dialog
          window.dispatchEvent(new CustomEvent('open-new-link-dialog'))
        },
      },
      {
        key: 'Escape',
        description: 'Tutup dialog/modal',
        action: () => {
          // Dispatch custom event to close dialogs
          window.dispatchEvent(new CustomEvent('close-dialogs'))
        },
      },
    ],
  })
}

/**
 * Keyboard shortcuts help component
 */
interface KeyboardShortcutsHelpProps {
  shortcuts: Array<{
    keys: string[]
    description: string
  }>
  onClose?: () => void
}

export function KeyboardShortcutsHelp({ shortcuts, onClose }: KeyboardShortcutsHelpProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Keyboard Shortcuts</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Tutup
          </button>
        )}
      </div>

      <div className="space-y-3">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{shortcut.description}</span>
            <div className="flex gap-1">
              {shortcut.keys.map((key, i) => (
                <kbd
                  key={i}
                  className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-300 rounded"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Format shortcut keys for display
 */
export function formatShortcutKey(key: string, metaKey?: boolean, ctrlKey?: boolean): string[] {
  const keys: string[] = []

  if (metaKey) {
    keys.push('⌘')
  } else if (ctrlKey) {
    keys.push('Ctrl')
  }

  keys.push(key.charAt(0).toUpperCase() + key.slice(1))

  return keys
}

/**
 * Detect OS for correct modifier key display
 */
export function useModifierKey(): 'meta' | 'ctrl' {
  const [modifier, setModifier] = useState<'meta' | 'ctrl'>('meta')

  useEffect(() => {
    // Detect if Mac
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    setModifier(isMac ? 'meta' : 'ctrl')
  }, [])

  return modifier
}
