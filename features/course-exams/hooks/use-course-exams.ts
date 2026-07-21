import { useEffect, useState } from "react"
import { fetchCourseExams } from "@/features/course-exams/api/fetch-course-exams"
import type { ExamItem } from "@/features/course-exams/types"

export function useCourseExams(courseId: string, userId: string | undefined) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exams, setExams] = useState<ExamItem[]>([])

  useEffect(() => {
    let active = true
    ;(async () => {
      if (!courseId || !userId) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await fetchCourseExams(courseId, userId)
        if (active) setExams(data)
      } catch (e: any) {
        if (active) setError(e?.message || "โหลดข้อสอบไม่สำเร็จ")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [courseId, userId])

  return { exams, loading, error }
}
