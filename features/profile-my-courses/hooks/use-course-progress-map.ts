import { useEffect, useState } from "react"
import { fetchCourseProgress, toPercent } from "@/features/profile-my-courses/api/fetch-course-progress"
import type { CourseProgress, PaidCourse } from "@/features/profile-my-courses/types"

export function useCourseProgressMap(userId: string | undefined, courses: PaidCourse[]) {
  const [progressMap, setProgressMap] = useState<Record<string, CourseProgress>>({})

  useEffect(() => {
    let active = true
    ;(async () => {
      if (!userId || courses.length === 0) return
      try {
        const results = await Promise.all(
          courses.map(async (course): Promise<readonly [string, CourseProgress]> => {
            if (course.isExpire) return [course.id, { percent: 0, complete: false }] as const
            if (course.progress !== undefined && course.progress !== null) {
              const percent = toPercent(course.progress)
              return [course.id, { percent, complete: percent >= 100 }] as const
            }
            return [course.id, await fetchCourseProgress(userId, course.id)] as const
          })
        )
        if (active) setProgressMap(Object.fromEntries(results))
      } catch {}
    })()
    return () => {
      active = false
    }
  }, [userId, courses])

  return progressMap
}
