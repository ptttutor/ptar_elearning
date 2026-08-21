import { useCallback, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { fetchStudyQueue } from "@/features/flashcard-study/api/fetch-study-queue"
import { submitReview } from "@/features/flashcard-study/api/submit-review"
import { formatInterval } from "@/features/flashcard-study/lib/format-interval"
import type { FlashcardAnswerMode, StudyCard, StudyDeck } from "@/features/flashcard-study/types"

export function useFlashcardStudy(deckId: string, isAuthenticated: boolean, authLoading: boolean) {
  const { toast } = useToast()

  const [deck, setDeck] = useState<StudyDeck | null>(null)
  const [cards, setCards] = useState<StudyCard[]>([])
  const [dueCount, setDueCount] = useState(0)
  const [newCount, setNewCount] = useState(0)
  const [index, setIndex] = useState(0)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    if (!deckId) return
    try {
      setLoading(true)
      setError(null)
      const data = await fetchStudyQueue(deckId)
      setDeck(data.deck)
      setCards(data.cards)
      setDueCount(data.dueCount)
      setNewCount(data.newCount)
      setIndex(0)
      setReviewedCount(0)
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "โหลดคิวทบทวนไม่สำเร็จ")
    } finally {
      setLoading(false)
    }
  }, [deckId])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    load()
  }, [authLoading, isAuthenticated, load])

  const currentCard = cards[index] ?? null
  const isDone = !loading && !error && cards.length > 0 && index >= cards.length
  const isEmpty = !loading && !error && cards.length === 0

  const grade = useCallback(
    async (gradeValue: number, answerMode: FlashcardAnswerMode, userAnswer?: string) => {
      if (!currentCard || submitting) return
      setSubmitting(true)
      try {
        const result = await submitReview({ cardId: currentCard.id, grade: gradeValue, answerMode, userAnswer })
        toast({ title: `บันทึกแล้ว — เจอกันอีกครั้งใน ${formatInterval(result.interval)}` })
        setReviewedCount((c) => c + 1)
        setIndex((i) => i + 1)
      } catch (e: any) {
        toast({ variant: "destructive", title: e?.response?.data?.error || e?.message || "บันทึกผลไม่สำเร็จ" })
      } finally {
        setSubmitting(false)
      }
    },
    [currentCard, submitting, toast]
  )

  return {
    deck,
    cards,
    dueCount,
    newCount,
    index,
    currentCard,
    reviewedCount,
    loading,
    error,
    submitting,
    isDone,
    isEmpty,
    grade,
    reload: load,
  }
}
