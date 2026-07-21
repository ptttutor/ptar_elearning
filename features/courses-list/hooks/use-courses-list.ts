import { useEffect, useRef, useState } from "react"
import { fetchCourses, fetchSubjectOptions, PAGE_SIZE } from "@/features/courses-list/api/fetch-courses"
import type { ApiCourse, SubjectOption } from "@/features/courses-list/types"

export function useCoursesList({
  initialGradeLevel,
  initialCourses,
  initialTotal,
  initialTotalPages,
  initialSubjects,
}: {
  initialGradeLevel: string
  initialCourses: ApiCourse[]
  initialTotal: number
  initialTotalPages: number
  initialSubjects: SubjectOption[]
}) {
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(initialGradeLevel)
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [courses, setCourses] = useState<ApiCourse[]>(initialCourses)
  const [totalCourses, setTotalCourses] = useState(initialTotal)
  const [totalPages, setTotalPages] = useState(Math.max(1, initialTotalPages))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [availableSubjects, setAvailableSubjects] = useState<SubjectOption[]>(initialSubjects)

  // Client-side fallback only if the server-side fetch found no subject options.
  useEffect(() => {
    if (availableSubjects.length > 1) return
    let active = true
    fetchSubjectOptions().then((subjects) => {
      if (active && subjects.length > 1) setAvailableSubjects(subjects)
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Skip the first run — the server already fetched matching data for first paint.
  const skippedInitialFetch = useRef(false)
  useEffect(() => {
    if (!skippedInitialFetch.current) {
      skippedInitialFetch.current = true
      return
    }
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams({ page: String(currentPage), limit: String(PAGE_SIZE) })
        if (selectedGradeLevel !== "all") params.set("gradeLevel", selectedGradeLevel)
        if (selectedSubject !== "all") params.set("categoryId", selectedSubject)

        const json = await fetchCourses(params)
        if (active) {
          setCourses(Array.isArray(json?.data) ? json.data : [])
          setTotalCourses(json?.pagination?.total ?? 0)
          setTotalPages(Math.max(1, json?.pagination?.totalPages ?? 1))
        }
      } catch (e: any) {
        if (active) setError(e?.message ?? "Failed to load courses")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [selectedGradeLevel, selectedSubject, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedGradeLevel, selectedSubject])

  useEffect(() => {
    setCurrentPage((prev) => {
      if (!Number.isFinite(prev) || prev < 1) return 1
      return Math.min(prev, totalPages)
    })
  }, [totalPages])

  return {
    selectedGradeLevel,
    setSelectedGradeLevel,
    selectedSubject,
    setSelectedSubject,
    courses,
    totalCourses,
    totalPages,
    loading,
    error,
    currentPage,
    setCurrentPage,
    availableSubjects,
  }
}
