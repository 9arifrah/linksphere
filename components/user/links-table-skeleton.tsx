import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function LinksTableSkeleton() {
  return (
    <Card className="border-slate-200/60 shadow-slack-md">
      <CardHeader>
        <Skeleton className="h-7 w-32" />
        <div className="flex items-center gap-2 mt-4">
          <Skeleton className="h-10 flex-1" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border border-slate-100 rounded-lg">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
