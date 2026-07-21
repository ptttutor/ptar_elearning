import { useEffect, useRef, type MutableRefObject } from "react"
import { createEnrollment, findMissingCourseIdsFromOrders } from "@/features/profile-my-courses/api/sync-enrollments"
import type { PaidCourse } from "@/features/profile-my-courses/types"

/** Runs once courses have loaded; backfills any enrollment a completed order should have created. */
export function useEnrollmentSync({
  userId,
  authLoading,
  loading,
  courses,
  ensuredCourseIdsRef,
  onSynced,
}: {
  userId: string | undefined
  authLoading: boolean
  loading: boolean
  courses: PaidCourse[]
  ensuredCourseIdsRef: MutableRefObject<Set<string>>
  onSynced: () => void
}) {
  const ensuringRef = useRef(false)

  useEffect(() => {
    if (!userId || authLoading || loading || ensuringRef.current) return

    ;(async () => {
      ensuringRef.current = true
      try {
        const existingCourseIds = new Set(courses.map((c) => c.id))
        const missing = await findMissingCourseIdsFromOrders(userId, existingCourseIds)

        let createdAny = false
        for (const courseId of missing) {
          if (ensuredCourseIdsRef.current.has(courseId)) continue
          try {
            await createEnrollment(userId, courseId)
            ensuredCourseIdsRef.current.add(courseId)
            createdAny = true
          } catch (err) {
            console.error("Failed to create missing enrollment", err)
          }
        }

        if (createdAny) onSynced()
      } catch (err) {
        console.error("Failed to sync enrollments from orders", err)
      } finally {
        ensuringRef.current = false
      }
    })()
  }, [userId, authLoading, loading, courses, ensuredCourseIdsRef, onSynced])
}
