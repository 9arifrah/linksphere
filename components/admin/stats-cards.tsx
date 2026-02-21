import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, MousePointerClick, FolderTree, CheckCircle, Users } from 'lucide-react'

type Stats = {
  totalLinks: number
  activeLinks: number
  totalClicks: number
  totalCategories: number
  totalUsers?: number
}

export function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    {
      title: 'Total Pengguna',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Total Link',
      value: stats.totalLinks,
      icon: ExternalLink,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Link Aktif',
      value: stats.activeLinks,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Klik',
      value: stats.totalClicks,
      icon: MousePointerClick,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Kategori',
      value: stats.totalCategories,
      icon: FolderTree,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div className="grid gap-2 sm:gap-4 grid-cols-1 min-[450px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:pb-2 sm:p-4 sm:lg:p-6">
            <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-600">
              {card.title}
            </CardTitle>
            <div className={`rounded-lg p-1 sm:p-2 sm:lg:p-2.5 ${card.bgColor}`}>
              <card.icon className={`h-2.5 w-2.5 sm:h-4 sm:w-4 sm:lg:h-5 sm:lg:w-5 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 sm:lg:p-6 pt-0 sm:pt-0 sm:lg:pt-0">
            <div className="text-lg sm:text-2xl sm:lg:text-3xl font-bold text-slate-900">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
