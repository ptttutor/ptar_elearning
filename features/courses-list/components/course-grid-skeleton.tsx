import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } }

export function CourseGridSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, idx) => (
        <motion.div key={`skeleton-${idx}`} variants={fadeInUp}>
          <Card className="h-full group pt-0">
            <CardContent className="p-0">
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <Skeleton className="absolute inset-0" />
                <div className="absolute top-4 left-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </>
  )
}
