import { Card, CardContent, CardHeader } from "@/components/ui/card"

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-muted ${className}`}>
      <div className="absolute inset-0 -translate-x-full shimmer" />
    </div>
  )
}

export function CourseDetailSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8 py-4" aria-busy="true" aria-live="polite">
      <style jsx>{`
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
          animation: shimmer 1.8s infinite;
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
      <section className="lg:col-span-2 space-y-6 order-1 lg:order-1">
        <div className="aspect-video rounded-2xl ring-1 ring-black/5 shadow-lg overflow-hidden">
          <Skeleton className="h-full w-full rounded-none" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-32 rounded-full" />
        </div>
        <Skeleton className="h-8 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-24" />
        </div>
      </section>

      <aside className="lg:col-span-1 order-3 lg:order-2 space-y-6">
        <Card className="rounded-2xl shadow-lg ring-1 ring-black/5">
          <CardContent className="p-4 space-y-4">
            <Skeleton className="h-8 w-40 mx-auto" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </CardContent>
        </Card>
      </aside>

      <section className="lg:col-span-2 order-2 lg:order-3">
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="lg:col-span-3 order-4">
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
