import { useEffect, useState } from "react"
import { fetchCourseDetail } from "@/features/course-detail/api/fetch-course"
import type { ApiChapter, ApiCourse } from "@/features/course-detail/types"

export function useCourseData(id: string, initial: { course: ApiCourse | null; chapters: ApiChapter[] }) {
  const [course, setCourse] = useState<ApiCourse | null>(initial.course)
  const [chapters, setChapters] = useState<ApiChapter[]>(initial.chapters)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Server already fetched matching data for first paint; only refetch if `id` changes client-side.
  const [loadedFor, setLoadedFor] = useState(id)
  useEffect(() => {
    if (id === loadedFor) return
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await fetchCourseDetail(id)
        if (active) {
          setCourse(data.course)
          setChapters(data.chapters)
          setLoadedFor(id)
        }
      } catch (e: any) {
        if (active) setError(e?.message ?? "Failed to load course")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id, loadedFor])

  return { course, chapters, loading, error }
}
