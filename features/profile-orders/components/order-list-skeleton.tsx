import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function OrderListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={`o-sk-${i}`}>
          <CardContent className="p-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-[8rem_1fr_auto] sm:items-center">
              {/* รูป: COURSE (16:9) / EBOOK (3:4) — ใช้ 3:4 เป็น default ในช่วงโหลดเพื่อสมดุลบนมือถือ */}
              <div className="relative w-full sm:w-auto aspect-[3/4] rounded-md bg-muted ring-1 ring-border overflow-hidden">
                <Skeleton className="h-full w-full rounded-none" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-5 w-3/5" />
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex gap-2 sm:flex-col justify-self-stretch sm:justify-self-end">
                <Skeleton className="h-9 w-full sm:w-28" />
                <Skeleton className="h-9 w-full sm:w-28" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
