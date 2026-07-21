import { useEffect, useRef, useState } from "react"
import { fetchMyCourses } from "@/features/profile-my-courses/api/fetch-my-courses"
import type { PaidCourse } from "@/features/profile-my-courses/types"

export function useMyCourses(userId: string | undefined, authLoading: boolean) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [courses, setCourses] = useState<PaidCourse[]>([])
  const [reloadKey, setReloadKey] = useState(0)
  const ensuredCourseIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    let active = true
    ;(async () => {
      if (!userId) {
        if (!authLoading) {
          setLoading(false)
          setCourses([])
        }
        return
      }
      try {
        setLoading(true)
        const data = await fetchMyCourses(userId)
        if (active) {
          setCourses(data)
          data.forEach((c) => {
            if (c?.id) ensuredCourseIdsRef.current.add(c.id)
          })
          setError(null)
        }
      } catch (e: any) {
        if (active) setError(e?.message ?? "โหลดคอร์สไม่สำเร็จ")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [userId, authLoading, reloadKey])

  const reload = () => setReloadKey((key) => key + 1)

  return { courses, loading, error, reload, ensuredCourseIdsRef }
}
