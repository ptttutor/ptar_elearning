import { useEffect, useMemo, useRef, useState } from "react"
import { fetchExams, ITEMS_PER_PAGE } from "@/features/exam-bank/api/fetch-exams"
import { fetchExamCategories } from "@/features/exam-bank/api/fetch-exam-categories"
import { fetchExamYears } from "@/features/exam-bank/api/fetch-exam-years"
import type { ApiExam, ExamCategory, UiExam } from "@/features/exam-bank/types"

export function useExamBank({
  initialExams,
  initialTotal,
  initialCategories,
  initialYears,
}: {
  initialExams: ApiExam[]
  initialTotal: number
  initialCategories: ExamCategory[]
  initialYears: number[]
}) {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [categories, setCategories] = useState<ExamCategory[]>(initialCategories)
  const [selectedYear, setSelectedYear] = useState("all")
  const [yearOptions, setYearOptions] = useState<number[]>(initialYears)
  const [searchTerm, setSearchTerm] = useState("")

  const [data, setData] = useState<ApiExam[]>(initialExams)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(initialTotal)
  const [currentPage, setCurrentPage] = useState(1)

  // Fallback only — categories/years are already server-fetched for first paint.
  useEffect(() => {
    if (categories.length > 1) return
    fetchExamCategories().then((list) => {
      if (list.length > 1) setCategories(list)
    })
  }, [])

  useEffect(() => {
    if (yearOptions.length) return
    fetchExamYears().then((years) => {
      if (years.length) setYearOptions(years)
    })
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, selectedYear, searchTerm])

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
        const { items, total } = await fetchExams({ page: currentPage, categoryId: selectedCategory, year: selectedYear, search: searchTerm })
        if (active) {
          setData(items)
          setTotalCount(total)
          if (!yearOptions.length) {
            const yrs = Array.from(new Set(items.map((e) => new Date(e.createdAt).getFullYear()))).sort((a, b) => b - a)
            if (yrs.length) setYearOptions(yrs)
          }
        }
      } catch (e: any) {
        if (active) setError(e?.message ?? "Failed to load exams")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedCategory, selectedYear, searchTerm])

  const getCategoryColorById = (key?: string) => {
    if (!key) return "rgb(250 202 21)"
    const match = categories.find((c) => c.id === key || c.type === key || c.name === key)
    return match?.color ?? "rgb(250 202 21)"
  }

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filteredData = useMemo(() => {
    if (!normalizedSearch) return data || []
    return (data || []).filter((exam) => {
      const target = [exam.title, exam.description, exam.category?.name].filter(Boolean).map((v) => String(v).toLowerCase())
      return target.some((value) => value.includes(normalizedSearch))
    })
  }, [data, normalizedSearch])

  const uiExams: UiExam[] = useMemo(() => {
    return (filteredData || [])
      .filter((e) => e.isActive)
      .map((e) => {
        const year = new Date(e.createdAt).getFullYear()
        const categoryName = e.category?.name ?? "ไม่ระบุ"
        const categoryId = String(e.category?.id ?? e.categoryId ?? "")
        return { id: e.id, title: e.title, categoryId, categoryName, year, examType: categoryName }
      })
  }, [filteredData])

  const displayTotal = normalizedSearch ? uiExams.length : totalCount
  const totalPages = useMemo(() => (normalizedSearch ? 1 : Math.max(1, Math.ceil((totalCount || 0) / ITEMS_PER_PAGE))), [normalizedSearch, totalCount])

  return {
    selectedCategory,
    setSelectedCategory,
    categories,
    selectedYear,
    setSelectedYear,
    yearOptions,
    searchTerm,
    setSearchTerm,
    data,
    loading,
    error,
    totalCount,
    currentPage,
    setCurrentPage,
    getCategoryColorById,
    normalizedSearch,
    uiExams,
    displayTotal,
    totalPages,
  }
}
