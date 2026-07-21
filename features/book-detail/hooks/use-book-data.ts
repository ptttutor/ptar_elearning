import { useEffect, useState } from "react"
import { fetchBookById } from "@/features/book-detail/api/fetch-book"
import type { Ebook } from "@/features/book-detail/types"

export function useBookData(id: string, initial: Ebook | null) {
  const [book, setBook] = useState<Ebook | null>(initial)
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
        const data = await fetchBookById(id)
        if (active) {
          setBook(data)
          setLoadedFor(id)
        }
      } catch (e: any) {
        if (active) setError(e?.message ?? "โหลดข้อมูลไม่สำเร็จ")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id, loadedFor])

  return { book, loading, error }
}
