'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Link as LinkIcon, Eye, MousePointerClick, FolderTree, TrendingUp, TrendingDown } from 'lucide-react'
import { Sparkline } from '@/components/ui/sparkline'
import { cn } from '@/lib/utils'

type StatsCardsProps = {
  stats: {
    totalLinks: number
    publicLinks: number
    totalClicks: number
    totalCategories: number
  }
  trends?: {
    totalLinks?: { value: number; history: number[] }
    publicLinks?: { value: number; history: number[] }
    totalClicks?: { value: number; history: number[] }
    totalCategories?: { value: number; history: number[] }
  }
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  history,
  color,
}: {
  title: string
  value: number
  icon: any
  trend?: number
  history?: number[]
  color: string
}) {
  const isPositive = trend !== undefined && trend >= 0
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const duration = 1000 // 1 second animation
          const steps = 30
          const stepValue = value / steps
          const stepDuration = duration / steps

          let current = 0
          const timer = setInterval(() => {
            current += stepValue
            if (current >= value) {
              setDisplayValue(value)
              clearInterval(timer)
            } else {
              setDisplayValue(Math.floor(current))
            }
          }, stepDuration)

          return () => clearInterval(timer)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(cardRef.current)

    return () => observer.disconnect()
  }, [value, hasAnimated])

  return (
    <Card
      ref={cardRef}
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer border-slate-200/60"
    >
      {/* Gradient background overlay on hover */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-5 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      <CardContent className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-3xl font-bold text-slate-900 tabular-nums">
              {displayValue.toLocaleString()}
            </p>

            {/* Trend Indicator */}
            {trend !== undefined && (
              <div className={cn(
                'flex items-center text-xs font-medium px-2 py-1 rounded-full transition-all duration-300',
                isPositive
                  ? 'text-green-600 bg-green-50'
                  : 'text-red-600 bg-red-50'
              )}>
                {isPositive ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {isPositive ? '+' : ''}{trend}%
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{
                backgroundColor: color,
                backgroundImage: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
              }}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>

            {/* Sparkline */}
            {history && history.length >= 2 && (
              <div className="transition-transform duration-300 group-hover:scale-105">
                <Sparkline data={history} color={color} width={60} height={30} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent transition-all duration-300"
          style={{
            color: color,
            width: hasAnimated ? '100%' : '0%',
            opacity: '0.2',
          }}
        />
      </CardContent>
    </Card>
  )
}

export function StatsCards({ stats, trends }: StatsCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Link"
        value={stats.totalLinks}
        icon={LinkIcon}
        trend={trends?.totalLinks?.value}
        history={trends?.totalLinks?.history}
        color="#2563eb"
      />

      <StatCard
        title="Link Publik"
        value={stats.publicLinks}
        icon={Eye}
        trend={trends?.publicLinks?.value}
        history={trends?.publicLinks?.history}
        color="#10b981"
      />

      <StatCard
        title="Total Klik"
        value={stats.totalClicks}
        icon={MousePointerClick}
        trend={trends?.totalClicks?.value}
        history={trends?.totalClicks?.history}
        color="#8b5cf6"
      />

      <StatCard
        title="Kategori"
        value={stats.totalCategories}
        icon={FolderTree}
        trend={trends?.totalCategories?.value}
        history={trends?.totalCategories?.history}
        color="#f59e0b"
      />
    </div>
  )
}
