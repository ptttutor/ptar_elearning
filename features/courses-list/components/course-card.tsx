import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Users, BookOpen, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GRADE_LEVEL_LABELS } from "@/features/courses-list/types"
import type { ApiCourse } from "@/features/courses-list/types"

const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } }

export function CourseCard({ course }: { course: ApiCourse }) {
  const original = Number(course.price || 0)
  const discountPrice = course.discountPrice
  const hasDiscount = discountPrice != null && discountPrice < original
  const effective = hasDiscount ? Number(discountPrice) : original
  const isFree = course.isFree || original === 0

  return (
    <motion.div variants={fadeInUp}>
      <Card className="h-full hover:shadow-xl transition-shadow duration-300 group pt-0">
        <CardContent className="p-0">
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            <Image
              src={course.coverImageUrl || "/placeholder.svg?height=200&width=350"}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary text-primary-foreground">
                {course.gradeLevel ? GRADE_LEVEL_LABELS[course.gradeLevel] : (course.category?.name ?? "คอร์ส")}
              </Badge>
            </div>
          </div>

          <div className="p-6">
            {(course.gradeLevel || course.category?.name) && (
              <div className="mb-2 text-sm font-medium text-primary">{course.gradeLevel ? GRADE_LEVEL_LABELS[course.gradeLevel] : course.category?.name}</div>
            )}
            <h3 className="text-xl font-bold text-card-foreground mb-2 text-balance line-clamp-2">{course.title}</h3>
            <p className="text-muted-foreground mb-4 text-pretty line-clamp-2">{course.description}</p>

            <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course._count?.enrollments ?? 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{course._count?.chapters ?? 0} บทเรียน</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration ?? "-"}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              {isFree ? (
                <span className="text-2xl font-bold text-green-600">ฟรี</span>
              ) : (
                <>
                  {hasDiscount && <span className="text-sm text-muted-foreground line-through mr-1">฿{original.toLocaleString()}</span>}
                  <span className="text-2xl font-extrabold text-primary">฿{effective.toLocaleString()}</span>
                </>
              )}
            </div>

            <Link href={`/courses/${course.id}`}>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">ดูรายละเอียด</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
