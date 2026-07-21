import Link from "next/link"
import Image from "next/image"
import { BookOpen, Clock, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { CourseProgress, PaidCourse } from "@/features/profile-my-courses/types"

function formatTHDate(iso?: string | null) {
  if (!iso) return ""
  try {
    return new Date(iso).toLocaleDateString("th-TH")
  } catch {
    return ""
  }
}

export function MyCourseCard({ course, progress, priority }: { course: PaidCourse; progress?: CourseProgress; priority: boolean }) {
  const chaptersCount = course._count?.chapters ?? course.chapters?.length ?? 0
  const percent = progress?.percent ?? 0
  const complete = progress?.complete ?? false
  const expired = Boolean(course.isExpire)

  return (
    <Card className="overflow-hidden group p-0">
      <CardContent className="p-0">
        <div className="aspect-video relative overflow-hidden border-b">
          <Image
            src={course.coverImageUrl || "/placeholder.svg?height=200&width=350"}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={priority}
            fetchPriority={priority ? "high" : undefined}
          />
          {course.category?.name && <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">{course.category.name}</Badge>}
          {expired && <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">หมดอายุ</Badge>}
        </div>

        <div className="p-4 space-y-3">
          <div className="font-semibold text-foreground line-clamp-2">{course.title}</div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {chaptersCount} บทเรียน
            </div>
            {course.enrolledAt && (
              <div className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTHDate(course.enrolledAt)}
              </div>
            )}
          </div>

          {course.expiresAt && (
            <div className={`text-xs ${expired ? "text-destructive" : "text-muted-foreground"}`}>
              {expired ? "หมดอายุเมื่อ " : "ใช้งานได้ถึง "}
              {formatTHDate(course.expiresAt)}
            </div>
          )}

          <div className="mt-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>ความคืบหน้า</span>
              <span className="font-medium">{percent}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-1" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${expired ? "bg-muted-foreground/30" : "bg-primary"}`}
                style={{ width: `${percent}%` }}
              />
            </div>

            {complete && !expired && (
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <Check className="h-3.5 w-3.5" />
                เรียนจบแล้ว
              </div>
            )}
            {expired && (
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-destructive bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-full">
                คอร์สหมดอายุแล้ว
              </div>
            )}
          </div>

          <div className="pt-1">
            {expired ? (
              <Button className="bg-muted text-muted-foreground cursor-not-allowed" disabled>
                คอร์สหมดอายุ
              </Button>
            ) : (
              <Link href={`/profile/my-courses/course/${course.id}`}>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">เข้าเรียน</Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
