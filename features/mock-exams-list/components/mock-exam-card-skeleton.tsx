import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } }

export function MockExamCardSkeleton() {
  return (
    <motion.div variants={fadeInUp}>
      <Card className="h-full">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      </Card>
    </motion.div>
  )
}
