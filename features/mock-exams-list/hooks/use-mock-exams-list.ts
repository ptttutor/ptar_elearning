import { useEffect, useRef, useState } from "react"
import { fetchMockExams } from "@/features/mock-exams-list/api/fetch-mock-exams"
import type { ApiMockExam } from "@/features/mock-exams-list/types"

export function useMockExamsList({ initialExams, initialTotal, initialTotalPages }: { initialExams: ApiMockExam[]; initialTotal: number; initialTotalPages: number }) {
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedGradeLevel, setSelectedGradeLevel] = useState("all")
  const [exams, setExams] = useState<ApiMockExam[]>(initialExams)
  const [totalExams, setTotalExams] = useState(initialTotal)
  const [totalPages, setTotalPages] = useState(Math.max(1, initialTotalPages))
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedSubject, selectedGradeLevel])

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
        const json = await fetchMockExams({ page: currentPage, subject: selectedSubject, gradeLevel: selectedGradeLevel })
        if (active) {
          setExams(Array.isArray(json?.data) ? json.data : [])
          setTotalExams(json?.pagination?.total ?? 0)
          setTotalPages(Math.max(1, json?.pagination?.totalPages ?? 1))
        }
      } catch (e: any) {
        if (active) setError(e?.message ?? "Failed to load mock exams")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [selectedSubject, selectedGradeLevel, currentPage])

  return {
    selectedSubject,
    setSelectedSubject,
    selectedGradeLevel,
    setSelectedGradeLevel,
    exams,
    totalExams,
    totalPages,
    currentPage,
    setCurrentPage,
    loading,
    error,
  }
}
