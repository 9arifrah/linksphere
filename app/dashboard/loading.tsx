import { LinksTableSkeleton } from '@/components/user/links-table-skeleton'
import { StatsSkeleton } from '@/components/user/stats-skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Stats Card */}
      <Card className="border-slate-200/60 shadow-slack-md">
        <CardHeader>
          <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
        </CardHeader>
        <CardContent>
          <StatsSkeleton />
        </CardContent>
      </Card>

      {/* Links Table */}
      <LinksTableSkeleton />
    </div>
  )
}
