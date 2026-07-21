"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/components/auth-provider"
import { useCourseExams } from "@/features/course-exams/hooks/use-course-exams"
import { ExamCard } from "@/features/course-exams/components/exam-card"

export function CourseExamsClient({ courseId }: { courseId: string }) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { exams, loading, error } = useCourseExams(courseId, (user as any)?.id)

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-background border rounded-lg p-6 text-muted-foreground">โปรดเข้าสู่ระบบ</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">ข้อสอบของคอร์ส</h1>
        <Button variant="outline" onClick={() => router.push(`/profile/my-courses/course/${encodeURIComponent(courseId)}`)}>
          กลับไปหน้าคอร์ส
        </Button>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      )}
      {error && <div className="text-destructive">{error}</div>}
      {!loading && !error && exams.length === 0 && <div className="text-muted-foreground">คอร์สนี้ยังไม่มีข้อสอบ</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        {exams.map((exam) => (
          <ExamCard key={exam.id} courseId={courseId} exam={exam} />
        ))}
      </div>
    </div>
  )
}
