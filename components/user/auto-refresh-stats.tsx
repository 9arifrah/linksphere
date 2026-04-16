'use client'

import { useEffect, useState } from 'react'
import { StatsCards } from './stats-cards'

type AutoRefreshStatsProps = {
  initialStats: {
    totalLinks: number
    publicLinks: number
    totalClicks: number
    totalCategories: number
  }
}

export function AutoRefreshStats({ initialStats }: AutoRefreshStatsProps) {
  const [stats, setStats] = useState(initialStats)

  const refreshStats = async () => {
    try {
      const response = await fetch('/api/user/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || initialStats)
      }
    } catch (error) {
      console.error('[v0] Error refreshing stats:', error)
    }
  }

  useEffect(() => {
    // Refresh stats every 5 seconds
    const interval = setInterval(refreshStats, 5000)

    return () => clearInterval(interval)
  }, [])

  // Also refresh when window regains focus (user switches back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshStats()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return <StatsCards stats={stats} />
}
