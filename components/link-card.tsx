'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { Link } from '@/lib/supabase'
import { ariaLabels } from '@/lib/accessibility'
import { cn } from '@/lib/utils'

type LinkCardProps = {
  link: Link
  themeColor?: string
}

export function LinkCard({ link, themeColor = '#2563eb' }: LinkCardProps) {
  const [isClicked, setIsClicked] = useState(false)

  const handleClick = async () => {
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 200)

    // Track click
    try {
      await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: link.id })
      })
    } catch (error) {
      console.error('[v0] Error tracking click:', error)
    }

    // Open link
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group relative w-full rounded-xl border bg-white p-5 text-left",
        "shadow-slack-md transition-all duration-300",
        "hover:shadow-slack-xl hover:-translate-y-1 active:scale-[0.98]",
        "overflow-hidden"
      )}
      style={{
        borderColor: `${themeColor}30`,
        borderWidth: '1px',
      }}
      aria-label={`${ariaLabels.linkOpensExternal}. ${link.title}. ${link.url}`}
      rel="noopener noreferrer"
    >
      {/* Gradient border overlay on hover */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${themeColor}15 0%, ${themeColor}05 100%)`,
        }}
      />

      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_ease-in-out]" />
      </div>

      {/* Content */}
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-slate-900 transition-all duration-300 truncate group-hover:scale-[1.02]"
            style={{
              color: isClicked ? themeColor : undefined,
            }}
            title={link.title}
            id={`link-title-${link.id}`}
          >
            {link.title}
          </h3>
          <p
            className="mt-1 text-sm text-slate-500 truncate transition-all duration-300 group-hover:translate-x-1"
            title={link.url}
            id={`link-url-${link.id}`}
          >
            {link.url}
          </p>
        </div>
        <ExternalLink
          className={cn(
            "h-5 w-5 flex-shrink-0 transition-all duration-300",
            "text-slate-400 group-hover:scale-125 group-hover:rotate-12"
          )}
          style={{
            color: isClicked ? themeColor : undefined,
          }}
          aria-hidden="true"
        />
      </div>

      {/* Bottom accent bar on hover */}
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:w-full"
        style={{
          color: themeColor,
          width: '0%',
        }}
      />
    </button>
  )
}
