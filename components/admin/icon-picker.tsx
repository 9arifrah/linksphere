'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { ChevronDown } from 'lucide-react'

const POPULAR_ICONS = [
  '📁', '📂', '🔗', '📌', '⭐', '❤️',
  '📱', '💻', '🖥️', '⌨️', '🖱️', '📷',
  '🎵', '🎬', '🎮', '🎨', '📚', '📖',
  '🎓', '🏆', '🎯', '📊', '📈', '💰',
  '💳', '🛒', '🛍️', '📦', '🚀', '✈️',
  '🏠', '🏢', '🏪', '🍕', '☕', '🍔',
  '⚽', '🏀', '🎾', '🏐', '🏈', '⛳',
  '🌍', '🌎', '🌏', '🗺️', '🧭', '🔔',
  '🔐', '🔑', '🛡️', '⚙️', '🔧', '🔨',
  '✉️', '📧', '📞', '☎️', '📠', '📡',
  '🎁', '🎀', '🎉', '🎊', '🎈', '🌟',
  '💡', '🔦', '🕯️', '💥', '⚡', '🌈',
]

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [customIcon, setCustomIcon] = useState('')
  const [open, setOpen] = useState(false)

  const handleSelectIcon = (icon: string) => {
    onChange(icon)
    setOpen(false)
  }

  const handleCustomIcon = (e: React.FormEvent) => {
    e.preventDefault()
    if (customIcon) {
      onChange(customIcon.substring(0, 2))
      setCustomIcon('')
      setOpen(false)
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between bg-transparent"
          >
            <span className="text-2xl">{value}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-900 mb-3">
                Pilih Icon
              </p>
              <div className="grid grid-cols-6 gap-2">
                {POPULAR_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => handleSelectIcon(icon)}
                    className={`p-2 text-2xl rounded-lg border-2 transition-colors ${
                      value === icon
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <form onSubmit={handleCustomIcon} className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Icon Custom
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={customIcon}
                    onChange={(e) => setCustomIcon(e.target.value)}
                    placeholder="Paste emoji atau karakter"
                    maxLength={2}
                  />
                  <Button
                    type="submit"
                    disabled={!customIcon}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Tambah
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
