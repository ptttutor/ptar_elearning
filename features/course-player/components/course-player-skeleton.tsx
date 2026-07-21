import { Skeleton } from "@/components/ui/skeleton"

export function CoursePlayerSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="hidden lg:block">
          <Skeleton className="h-[60vh] w-full rounded" />
        </div>
        <div className="lg:col-span-3 space-y-4">
          <Skeleton className="aspect-video w-full rounded" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  )
}
