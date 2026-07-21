import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function BookGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={`sk-${i}`} className="overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="aspect-[3/4] relative">
              <Skeleton className="absolute inset-0" />
            </div>
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-9 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
