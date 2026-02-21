'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Link } from '@/lib/supabase'
import { LinkCard } from './link-card'
import { ariaLabels } from '@/lib/accessibility'

export function SearchBar({ links, themeColor = '#2563eb' }: { links: Link[], themeColor?: string }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLinks = searchQuery
    ? links.filter((link) =>
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  return (
    <div className="relative mb-8">
      <div className="relative group">
        <label htmlFor="search-input" className="sr-only">
          {ariaLabels.search}
        </label>
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" aria-hidden="true" />
        <Input
          id="search-input"
          type="text"
          placeholder="Cari link disini..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-14 rounded-xl border-slate-200/60 bg-white/80 backdrop-blur-sm pl-12 pr-4 shadow-slack-md focus:border-blue-300 focus:ring-blue-300 transition-all duration-300"
          aria-label={ariaLabels.search}
          aria-autocomplete="list"
          aria-controls={searchQuery ? 'search-results' : undefined}
          aria-expanded={searchQuery ? 'true' : 'false'}
        />
      </div>

      {searchQuery && (
        <div
          id="search-results"
          className="absolute left-0 right-0 top-full z-10 mt-2 max-h-96 space-y-2 overflow-y-auto rounded-xl border border-slate-200/60 bg-white/95 backdrop-blur-sm p-4 shadow-xl animate-scale-in"
          role="listbox"
          aria-label="Hasil pencarian"
        >
          {filteredLinks.length > 0 ? (
            filteredLinks.map((link) => (
              <LinkCard key={link.id} link={link} themeColor={themeColor} />
            ))
          ) : (
            <div className="py-8 text-center" role="status">
              <div className="flex flex-col items-center justify-center">
                <Search className="h-12 w-12 text-slate-400 mb-4" aria-hidden="true" />
                <p className="text-slate-900 font-medium mb-1">Tidak ada hasil yang ditemukan</p>
                <p className="text-sm text-slate-500">Coba kata kunci lain untuk mencari link</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
