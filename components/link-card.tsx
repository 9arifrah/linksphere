'use client'

import { useState } from 'react'
import { ExternalLink, QrCode } from 'lucide-react'
import type { Link } from '@/lib/supabase'
import { ariaLabels } from '@/lib/accessibility'
import { cn } from '@/lib/utils'
import { QRCodeModal } from '@/components/shared/qr-code-modal'

type LinkCardProps = {
  link: Link
  themeColor?: string
}

export function LinkCard({ link, themeColor = '#2563eb' }: LinkCardProps) {
  const [isClicked, setIsClicked] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)

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
    <>
      <button
        onClick={handleClick}
        className={cn(
          "group relative w-full rounded-xl border bg-white text-left",
          "shadow-slack-md transition-all duration-300",
          "hover:shadow-slack-xl hover:-translate-y-1 active:scale-[0.98]",
          "overflow-hidden",
          "p-4 sm:p-5"  // Responsive padding - smaller on mobile
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
        <div className="relative flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-slate-900 transition-all duration-300 truncate group-hover:scale-[1.02] text-base sm:text-base"
              style={{
                color: isClicked ? themeColor : undefined,
              }}
              title={link.title}
              id={`link-title-${link.id}`}
            >
              {link.title}
            </h3>
            <p
              className="mt-1 text-slate-500 truncate transition-all duration-300 group-hover:translate-x-1 text-xs sm:text-sm"
              title={link.url}
              id={`link-url-${link.id}`}
            >
              {link.url}
            </p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {link.qr_code && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowQrModal(true)
                }}
                className={cn(
                  "transition-all duration-300 opacity-0 group-hover:opacity-100",
                  "text-slate-400 hover:scale-125 hover:rotate-12 hover:text-slate-600",
                  "h-4 w-4 sm:h-5 sm:w-5"  // Smaller on mobile
                )}
                title="Lihat QR Code"
                aria-label="Lihat QR Code untuk link ini"
              >
                <QrCode
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  style={{
                    color: isClicked ? themeColor : undefined,
                  }}
                />
              </button>
            )}
            <ExternalLink
              className={cn(
                "transition-all duration-300",
                "text-slate-400 group-hover:scale-125 group-hover:rotate-12",
                "h-4 w-4 sm:h-5 sm:w-5"  // Smaller on mobile
              )}
              style={{
                color: isClicked ? themeColor : undefined,
              }}
              aria-hidden="true"
            />
          </div>
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

      <QRCodeModal
        open={showQrModal}
        onOpenChange={setShowQrModal}
        link={{
          title: link.title,
          url: link.url,
          qr_code: link.qr_code || null,
          short_code: link.short_code || null
        }}
      />
    </>
  )
}
