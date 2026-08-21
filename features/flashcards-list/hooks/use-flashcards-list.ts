import { useCallback, useEffect, useState } from "react"
import { fetchFlashcardDecks } from "@/features/flashcards-list/api/fetch-flashcard-decks"
import type { ApiFlashcardDeck } from "@/features/flashcards-list/types"

export function useFlashcardsList(isAuthenticated: boolean, authLoading: boolean) {
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedGradeLevel, setSelectedGradeLevel] = useState("all")
  const [decks, setDecks] = useState<ApiFlashcardDeck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchFlashcardDecks({ subject: selectedSubject, gradeLevel: selectedGradeLevel })
      setDecks(data)
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "โหลดชุดแฟลชการ์ดไม่สำเร็จ")
    } finally {
      setLoading(false)
    }
  }, [selectedSubject, selectedGradeLevel])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    load()
  }, [authLoading, isAuthenticated, load])

  return {
    selectedSubject,
    setSelectedSubject,
    selectedGradeLevel,
    setSelectedGradeLevel,
    decks,
    loading,
    error,
  }
}
