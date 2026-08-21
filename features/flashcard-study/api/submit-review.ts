import http from "@/lib/http"
import type { FlashcardAnswerMode, ReviewResult } from "@/features/flashcard-study/types"

export type SubmitReviewPayload = {
  cardId: string
  grade: number
  answerMode: FlashcardAnswerMode
  userAnswer?: string
}

export async function submitReview(payload: SubmitReviewPayload): Promise<ReviewResult> {
  const res = await http.post("/api/flashcards/review", payload)
  if (!res.data?.success) throw new Error(res.data?.error || "บันทึกผลไม่สำเร็จ")
  return res.data.data
}
