'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Globe, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LinkPreviewData {
  title?: string
  description?: string
  favicon?: string
  image?: string
  siteName?: string
}

type LinkPreviewProps = {
  url: string
  themeColor?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LinkPreview({ url, themeColor = '#2563eb', size = 'md' }: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchPreview() {
      if (!url) return

      setLoading(true)
      setError(false)

      try {
        // Get favicon
        const domain = new URL(url).hostname
        const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

        if (!cancelled) {
          setPreview({
            favicon,
            siteName: domain,
          })
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[v0] Error fetching link preview:', err)
          setError(true)
          setLoading(false)
        }
      }
    }

    fetchPreview()

    return () => {
      cancelled = true
    }
  }, [url])

  if (loading) {
    return (
      <div className={cn(
        "flex items-center gap-3 rounded-lg transition-all",
        size === 'sm' ? 'p-2' : size === 'md' ? 'p-3' : 'p-4'
      )}>
        <div className="flex-shrink-0">
          <Loader2 className={cn(
            "animate-spin text-slate-400",
            size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn(
            "bg-slate-200 rounded animate-pulse",
            size === 'sm' ? 'h-3 w-24' : size === 'md' ? 'h-4 w-32' : 'h-5 w-40'
          )} />
        </div>
      </div>
    )
  }

  if (error || !preview) {
    return (
      <div className={cn(
        "flex items-center gap-3 rounded-lg",
        size === 'sm' ? 'p-2' : size === 'md' ? 'p-3' : 'p-4'
      )}>
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-lg"
          style={{ backgroundColor: `${themeColor}20` }}
        >
          <Globe
            className={cn(
              "text-slate-500",
              size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
            )}
            style={{ color: themeColor }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "font-medium text-slate-700 truncate",
              size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
            )}
          >
            {preview?.siteName || url}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-lg transition-all hover:bg-slate-50",
      size === 'sm' ? 'p-2' : size === 'md' ? 'p-3' : 'p-4'
    )}>
      {/* Favicon */}
      <div className="relative flex-shrink-0">
        {preview.favicon ? (
          <img
            src={preview.favicon}
            alt=""
            className={cn(
              "rounded-lg object-cover",
              size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'
            )}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div
            className={cn(
              "flex items-center justify-center rounded-lg",
              size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'
            )}
            style={{ backgroundColor: `${themeColor}20` }}
          >
            <Globe
              className={cn(
                "text-slate-500",
                size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
              )}
              style={{ color: themeColor }}
            />
          </div>
        )}
      </div>

      {/* Site Info */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-medium text-slate-700 truncate",
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          )}
          title={preview.siteName || url}
        >
          {preview.siteName || url}
        </p>
        {preview.description && size !== 'sm' && (
          <p
            className={cn(
              "text-slate-500 truncate",
              size === 'md' ? 'text-xs mt-0.5' : 'text-sm mt-1'
            )}
            title={preview.description}
          >
            {preview.description}
          </p>
        )}
      </div>

      {/* External Link Icon */}
      <ExternalLink
        className={cn(
          "flex-shrink-0 text-slate-400",
          size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
        )}
      />
    </div>
  )
}

/**
 * Link Preview Card - Enhanced version with image preview
 */
export function LinkPreviewCard({
  url,
  title,
  themeColor = '#2563eb'
}: {
  url: string
  title: string
  themeColor?: string
}) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchPreview() {
      if (!url) return

      setLoading(true)

      try {
        const domain = new URL(url).hostname
        const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`

        if (!cancelled) {
          setPreview({
            favicon,
            siteName: domain,
            title,
          })
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[v0] Error fetching link preview:', err)
          setLoading(false)
        }
      }
    }

    fetchPreview()

    return () => {
      cancelled = true
    }
  }, [url, title])

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-slack-md transition-all duration-300 hover:shadow-slack-xl hover:-translate-y-1">
      {/* Background gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-5"
        style={{ backgroundColor: themeColor }}
      />

      <div className="relative p-5">
        <div className="flex items-start gap-4">
          {/* Favicon */}
          <div className="flex-shrink-0">
            {loading ? (
              <div className="h-12 w-12 rounded-lg bg-slate-200 animate-pulse" />
            ) : preview?.favicon ? (
              <img
                src={preview.favicon}
                alt=""
                className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200"
                style={{ backgroundColor: `${themeColor}20` }}
              >
                <Globe className="h-6 w-6" style={{ color: themeColor }} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate group-hover:text-purple-700 transition-colors">
              {title}
            </h3>
            <p className="mt-1 text-sm text-slate-500 truncate">
              {preview?.siteName || url}
            </p>
          </div>

          {/* External Link Icon */}
          <ExternalLink className="h-5 w-5 flex-shrink-0 text-slate-400 transition-all duration-300 group-hover:scale-110" />
        </div>
      </div>
    </div>
  )
}
