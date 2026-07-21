import { useEffect, useMemo, useState } from "react"
import { fetchAllEbooks, fetchBookCategories } from "@/features/books-list/api/fetch-books"
import { filterByCategory } from "@/features/books-list/selectors"
import type { BookCategory, Ebook } from "@/features/books-list/types"

const PAGE_SIZE = 8

export function useBooksList({ initialEbooks, initialCategories }: { initialEbooks: Ebook[]; initialCategories: BookCategory[] }) {
  const [allEbooks, setAllEbooks] = useState<Ebook[]>(initialEbooks)
  const [categories, setCategories] = useState<BookCategory[]>(initialCategories)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Fetching is purely a resiliency fallback — filtering/pagination below is all
  // in-memory against data the server already fetched for first paint.
  useEffect(() => {
    if (allEbooks.length > 0) return
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const list = await fetchAllEbooks()
        if (active) setAllEbooks(list)
      } catch (e: any) {
        if (active) setError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (categories.length > 1) return
    let active = true
    fetchBookCategories().then((list) => {
      if (active && list.length > 1) setCategories(list)
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ebooks = useMemo(() => filterByCategory(selectedCategory, allEbooks, categories), [selectedCategory, allEbooks, categories])

  const onSelectCategory = (id: string) => {
    setSelectedCategory(id)
    setCurrentPage(1)
  }

  useEffect(() => {
    setCurrentPage((prev) => {
      if (!Number.isFinite(prev) || prev < 1) return 1
      const pages = Math.max(1, Math.ceil((ebooks.length || 0) / PAGE_SIZE))
      return Math.min(prev, pages)
    })
  }, [ebooks.length])

  const totalPages = useMemo(() => Math.max(1, Math.ceil((ebooks.length || 0) / PAGE_SIZE)), [ebooks.length])

  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return ebooks.slice(start, start + PAGE_SIZE)
  }, [currentPage, ebooks])

  return {
    categories,
    selectedCategory,
    onSelectCategory,
    loading,
    error,
    ebooks,
    paginatedBooks,
    currentPage,
    setCurrentPage,
    totalPages,
  }
}
