'use client'

import React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const ICON_CATEGORIES: Record<string, string[]> = {
  'Umum': ['📁', '📂', '📌', '⭐', '❤️', '🔥', '✨', '💎', '🔔', '🔖', '🏷️', '📎', '📋', '📝', '📄', '📃', '📑', '📊', '📈', '📉', '📒', '📓', '📔', '📕', '📗', '📘', '📙', '📰', '🗞️'],
  'Sosial & Komunikasi': ['💬', '💭', '🗨️', '✉️', '📧', '📩', '📞', '☎️', '📱', '📲', '🤳', '👏', '🤝', '👋', '✋', '🤙', '🫶', '🫰', '🫡', '🫂'],
  'Web & Teknologi': ['🔗', '🌐', '💻', '🖥️', '⌨️', '🖱️', '💾', '💿', '💽', '📷', '📸', '📹', '🎥', '📺', '📡', '🔌', '🔋', '⚙️', '🔧', '🔨', '🛠️', '🧰', '🔩', '📳', '📶'],
  'Bisnis & Keuangan': ['💼', '📊', '📈', '💰', '💳', '🤑', '🏦', '🏧', '🧾', '💲', '🪙', '🗃️', '🗄️', '📋', '🗓️', '📅', '🧮', '💼', '📁', '🏏'],
  'Belanja & Produk': ['🛒', '🛍️', '🎁', '🎀', '🎈', '🎊', '🎉', '📦', '📮', '📫', '📥', '📤', '🏷️', '🎟️', '🎫', '🧧', '🛷', '🏪', '🏬', '🛐'],
  'Hiburan': ['🎵', '🎶', '🎬', '🎭', '🎨', '🖼️', '🎪', '🎢', '🎰', '🎲', '🎮', '🕹️', '🧩', '🪀', '🧸', '🎯', '🏆', '🥇', '🎖️', '🏅'],
  'Makanan & Minuman': ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥨', '🥯', '🍞', '🥐', '☕', '🍵', '🧃', '🍹', '🍷', '🎂', '🍰', '🧁', '🍩', '🍪'],
  'Perjalanan & Tempat': ['✈️', '🚀', '🏘️', '🏠', '🏢', '🏣', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏗️', '🧱', '⛩️', '🕌', '🌁', '🌃'],
  'Olahraga': ['⚽', '🏀', '🏐', '🏈', '🎾', '🏓', '🏸', '🥊', '🤺', '⛳', '🏇', '🧗', '🏂', '🏄', '🏊', '🚴', '🤸', '🏋️', '🧘', '⛷️'],
  'Alam & Lingkungan': ['🌍', '🌎', '🌏', '🗺️', '🧭', '🌈', '☀️', '🌤️', '⛅', '🌧️', '⚡', '❄️', '🌊', '🔥', '🌋', '🌙', '⭐', '🌟', '💥', '🌸'],
  'Keamanan & Privasi': ['🔐', '🔒', '🔑', '🗝️', '🛡️', '👮', '🚨', '⚠️', '🚫', '⛔', '🆘', '🆗', '✅', '❌', '❗', '❓', '⁉️', '‼️', '💯', '🆔'],
}

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
  className?: string
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [customIcon, setCustomIcon] = useState('')
  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>(Object.keys(ICON_CATEGORIES)[0])

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
    <div className={cn('flex gap-2 items-center', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between bg-transparent"
          >
            <span className="text-2xl">{value || '📁'}</span>
            <span className="text-slate-500 text-sm ml-2">Pilih icon</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0 max-h-[420px] overflow-hidden flex flex-col" align="start" onWheel={(e) => e.stopPropagation()}>
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 p-3 border-b bg-slate-50/50 max-h-24 overflow-y-auto scrollbar-thin" onWheel={(e) => e.stopPropagation()}>
            {Object.keys(ICON_CATEGORIES).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                  activeCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Icon Grid */}
          <div
            className="p-3 overflow-y-auto flex-1 scrollbar-thin"
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-6 gap-1.5">
              {ICON_CATEGORIES[activeCategory]?.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleSelectIcon(icon)}
                  className={cn(
                    'p-2 text-xl rounded-lg border-2 transition-all hover:scale-110',
                    value === icon
                      ? 'border-blue-600 bg-blue-50 shadow-sm'
                      : 'border-transparent hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Icon Input */}
          <div className="border-t p-3 bg-slate-50/50">
            <form onSubmit={handleCustomIcon} className="space-y-2">
              <label className="block text-xs font-medium text-slate-600">
                Icon Custom
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={customIcon}
                  onChange={(e) => setCustomIcon(e.target.value)}
                  placeholder="Paste emoji..."
                  maxLength={2}
                  className="h-8 text-sm"
                />
                <Button
                  type="submit"
                  disabled={!customIcon}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 h-8"
                >
                  OK
                </Button>
              </div>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}